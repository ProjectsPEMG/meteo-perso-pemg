// Dictionnaire WMO (Traduction des codes météo)
const WMO_CODES = {
    0: ["Dégagé", "☀️"], 1: ["Plutôt dégagé", "🌤️"], 2: ["Partiellement nuageux", "⛅"],
    3: ["Couvert", "☁️"], 45: ["Brouillard", "🌫️"], 48: ["Brouillard givrant", "🌫️❄️"],
    51: ["Bruine légère", "🌦️"], 53: ["Bruine modérée", "🌧️"], 55: ["Bruine forte", "🌧️"],
    56: ["Bruine verglaçante", "🌧️❄️"], 57: ["Bruine verglaçante", "🌧️❄️"],
    61: ["Pluie légère", "🌧️"], 63: ["Pluie modérée", "🌧️"], 65: ["Pluie forte", "🌧️☔"],
    66: ["Pluie verglaçante", "🌧️❄️"], 67: ["Pluie verglaçante forte", "🌧️☔❄️"],
    71: ["Neige légère", "🌨️"], 73: ["Neige modérée", "❄️"], 75: ("Neige forte", "❄️☃️"),
    77: ["Grains de neige", "🌨️"],
    80: ["Averses légères", "🌦️"], 81: ["Averses modérées", "🌧️"], 82: ["Averses violentes", "⛈️"],
    85: ["Averses de neige", "🌨️"], 86: ["Averses de neige fortes", "❄️"],
    95: ["Orage", "⛈️"], 96: ["Orage et grêle", "⛈️🧊"], 99: ["Orage fort et grêle", "⛈️🌪️"]
};

// --- GESTION DE LA MÉMOIRE (LocalStorage) ---
let favorites = JSON.parse(localStorage.getItem('weather_favorites')) || ["Paris", "Lyon", "Marseille", "Bordeaux"];
let lastCity = localStorage.getItem('weather_last_city') || "Lyon";

// Variable pour détruire/recréer le graphique proprement
let tempChartInstance = null;

function saveMemory() {
    localStorage.setItem('weather_favorites', JSON.stringify(favorites));
    localStorage.setItem('weather_last_city', lastCity);
}

// --- INTERFACE FAVORIS ---
function renderFavorites() {
    const list = document.getElementById('favorites-list');
    list.innerHTML = '';
    favorites.forEach(city => {
        const li = document.createElement('li');
        li.className = "flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100";
        li.innerHTML = `
            <span class="font-medium" onclick="loadCity('${city}')">${city}</span>
            <button onclick="removeFavorite('${city}')" class="text-red-400 hover:text-red-600 text-sm">✖</button>
        `;
        list.appendChild(li);
    });
}

function addFavorite(city) {
    if (city && !favorites.includes(city)) {
        favorites.push(city);
        saveMemory();
        renderFavorites();
    }
}

function removeFavorite(city) {
    favorites = favorites.filter(c => c !== city);
    saveMemory();
    renderFavorites();
}

// --- MOTEUR API ---
async function loadCity(cityName) {
    // Sauvegarde de la dernière recherche
    lastCity = cityName;
    saveMemory();
    document.getElementById('search-input').value = cityName;
    document.getElementById('city-name').innerText = "Recherche en cours...";

    try {
        // 1. Trouver les coordonnées (Geocoding)
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=fr`);
        const geoData = await geoRes.json();
        
        if (!geoData.results) throw new Error("Ville non trouvée");
        const location = geoData.results[0];
        
        document.getElementById('city-name').innerText = location.name;

        // 2. Récupérer la météo
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max&timezone=auto&forecast_days=7`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        updateDashboard(weatherData);

    } catch (error) {
        document.getElementById('city-name').innerText = "❌ Ville introuvable";
        console.error(error);
    }
}

// --- MISE À JOUR DE L'ÉCRAN ---
function updateDashboard(data) {
    // Météo Actuelle
    const current = data.current;
    const [desc, icon] = WMO_CODES[current.weather_code] || ["Inconnu", "❓"];
    document.getElementById('current-temp').innerText = `${current.temperature_2m}°C`;
    document.getElementById('current-desc').innerText = `${icon} ${desc}`;
    document.getElementById('current-wind').innerText = `💨 ${current.wind_speed_10m} km/h`;
    document.getElementById('current-humidity').innerText = `💧 ${current.relative_humidity_2m} %`;

    // Tableau de la semaine
    const tbody = document.getElementById('forecast-table-body');
    tbody.innerHTML = '';
    
    for (let i = 0; i < 7; i++) {
        const dateObj = new Date(data.daily.time[i]);
        const jourStr = dateObj.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' });
        
        // Fonction rapide pour trouver le pire emoji sur une période
        const getEmoji = (startH, endH) => {
            let startIdx = (i * 24) + startH;
            let endIdx = (i * 24) + endH;
            let codes = data.hourly.weather_code.slice(startIdx, endIdx);
            let maxCode = Math.max(...codes);
            return (WMO_CODES[maxCode] || ["", "❓"])[1];
        };

        const pluie = data.daily.precipitation_sum[i] > 0 ? `${data.daily.precipitation_sum[i]} mm` : "-";
        
        const tr = document.createElement('tr');
        tr.className = "border-b border-slate-50 hover:bg-slate-50";
        tr.innerHTML = `
            <td class="py-3 px-2 font-medium capitalize">${jourStr}</td>
            <td class="py-3 px-2 text-center text-xl">${getEmoji(6, 12)}</td>
            <td class="py-3 px-2 text-center text-xl">${getEmoji(12, 18)}</td>
            <td class="py-3 px-2 text-center text-xl">${getEmoji(18, 24)}</td>
            <td class="py-3 px-2 text-blue-600 font-medium">${data.daily.temperature_2m_min[i]}°</td>
            <td class="py-3 px-2 text-red-500 font-medium">${data.daily.temperature_2m_max[i]}°</td>
            <td class="py-3 px-2 text-slate-500">${pluie}</td>
            <td class="py-3 px-2 font-medium ${data.daily.uv_index_max[i] > 6 ? 'text-orange-500' : 'text-slate-500'}">${data.daily.uv_index_max[i]}</td>
        `;
        tbody.appendChild(tr);
    }

    // Graphique Chart.js
    const ctx = document.getElementById('tempChart').getContext('2d');
    if (tempChartInstance) tempChartInstance.destroy(); // On efface l'ancien graphique

    // On limite aux 72 prochaines heures pour la lisibilité
    const times = data.hourly.time.slice(0, 72).map(t => new Date(t).getHours() + "h");
    const temps = data.hourly.temperature_2m.slice(0, 72);

    tempChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: times,
            datasets: [{
                label: 'Température (°C)',
                data: temps,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4, // Rend la courbe lisse
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { min: -5, max: 40 }
            }
        }
    });
}

// --- ÉCOUTEURS D'ÉVÉNEMENTS (Démarrage) ---
document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    loadCity(document.getElementById('search-input').value);
});

document.getElementById('add-fav-btn').addEventListener('click', () => {
    const input = document.getElementById('new-fav-input');
    addFavorite(input.value.trim().charAt(0).toUpperCase() + input.value.trim().slice(1));
    input.value = '';
});

// Lancement au chargement de la page
renderFavorites();
loadCity(lastCity);