// --- DICTIONNAIRE MÉTÉO ---
const WMO_CODES = {
    0: ["Dégagé", "☀️"], 1: ["Plutôt dégagé", "🌤️"], 2: ["Partiellement nuageux", "⛅"],
    3: ["Couvert", "☁️"], 45: ["Brouillard", "🌫️"], 48: ["Brouillard givrant", "🌫️❄️"],
    51: ["Bruine", "🌦️"], 53: ["Bruine mod.", "🌧️"], 55: ["Bruine forte", "🌧️"],
    61: ["Pluie", "🌧️"], 63: ["Pluie mod.", "🌧️"], 65: ["Pluie forte", "🌧️☔"],
    71: ["Neige", "🌨️"], 73: ["Neige mod.", "❄️"], 75: ["Neige forte", "❄️☃️"],
    80: ["Averses", "🌦️"], 81: ["Averses mod.", "🌧️"], 82: ["Orage violent", "⛈️"],
    95: ["Orage", "⛈️"], 96: ["Orage grêle", "⛈️🧊"], 99: ["Orage violent", "⛈️🌪️"]
};

// --- VARIABLES GLOBALES ---
let favorites = JSON.parse(localStorage.getItem('weather_favorites')) || ["Paris", "Lyon", "Marseille", "Bordeaux", "Brest", "Strasbourg"];
let lastCity = localStorage.getItem('weather_last_city') || "Lyon";
let globalData = { weather: null, air: null, geo: null }; // Stocke les données pour éviter de recharger l'API quand on bouge le slider
let chartInstances = {};
let mapInstance = null;

// --- GESTION DES FAVORIS ---
function saveMemory() {
    localStorage.setItem('weather_favorites', JSON.stringify(favorites));
    localStorage.setItem('weather_last_city', lastCity);
}

function renderFavorites() {
    const list = document.getElementById('favorites-list');
    list.innerHTML = '';
    favorites.forEach(city => {
        const li = document.createElement('li');
        li.className = "flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100";
        li.innerHTML = `<span class="font-medium" onclick="loadMainCity('${city}')">${city}</span>
                        <button onclick="removeFavorite('${city}')" class="text-red-400 hover:text-red-600">✖</button>`;
        list.appendChild(li);
    });
    if (mapInstance && !document.getElementById('tab-map').classList.contains('hidden')) drawMap();
}

function addFavorite(city) {
    if (city && !favorites.includes(city)) { favorites.push(city); saveMemory(); renderFavorites(); }
}
function removeFavorite(city) {
    favorites = favorites.filter(c => c !== city); saveMemory(); renderFavorites();
}

document.getElementById('add-fav-btn').addEventListener('click', () => {
    const input = document.getElementById('new-fav-input');
    addFavorite(input.value.trim().charAt(0).toUpperCase() + input.value.trim().slice(1));
    input.value = '';
});

// --- RECHERCHE ET API PRINCIPALE ---
async function loadMainCity(cityName) {
    lastCity = cityName; saveMemory();
    document.getElementById('search-input').value = cityName;
    document.getElementById('city-name').innerText = "Recherche...";

    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=fr`);
        const geoData = await geoRes.json();
        if (!geoData.results) throw new Error("Ville introuvable");
        globalData.geo = geoData.results[0];
        document.getElementById('city-name').innerText = globalData.geo.name;

        // Appel Météo (14 jours)
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${globalData.geo.latitude}&longitude=${globalData.geo.longitude}&current=temperature_2m,relative_humidity_2m,surface_pressure,weather_code,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,precipitation,surface_pressure,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant,uv_index_max&timezone=auto&forecast_days=14`;
        const weatherRes = await fetch(weatherUrl);
        globalData.weather = await weatherRes.json();

        // Appel Qualité de l'air (7 jours max autorisés par API)
        const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${globalData.geo.latitude}&longitude=${globalData.geo.longitude}&hourly=european_aqi,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&timezone=auto&forecast_days=7`;
        try {
            const airRes = await fetch(airUrl);
            globalData.air = await airRes.json();
        } catch { globalData.air = null; }

        updateDashboard();
    } catch (e) { document.getElementById('city-name').innerText = "❌ Erreur"; console.error(e); }
}

document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault(); loadMainCity(document.getElementById('search-input').value);
});

// --- MISE À JOUR DE L'INTERFACE ---
function updateDashboard() {
    const days = parseInt(document.getElementById('days-slider').value);
    
    // En-tête
    const curr = globalData.weather.current;
    const [desc, icon] = WMO_CODES[curr.weather_code] || ["Inconnu", "❓"];
    document.getElementById('current-temp').innerText = `${curr.temperature_2m}°C`;
    document.getElementById('current-desc').innerText = `${icon} ${desc}`;
    document.getElementById('current-wind').innerText = `💨 ${curr.wind_speed_10m} km/h`;
    document.getElementById('current-humidity').innerText = `💧 ${curr.relative_humidity_2m} %`;
    document.getElementById('current-pressure').innerText = `🧭 ${curr.surface_pressure} hPa`;

    // Tableau
    const tbody = document.getElementById('forecast-table-body');
    tbody.innerHTML = '';
    const getWindDir = (deg) => ["↓ N","↙ NE","← E","↖ SE","↑ S","↗ SW","→ W","↘ NW"][Math.round(deg/45)%8] || "";
    
    for (let i = 0; i < days; i++) {
        const d = new Date(globalData.weather.daily.time[i]);
        const jour = d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' });
        const getEmoji = (startH, endH) => {
            const codes = globalData.weather.hourly.weather_code.slice((i*24)+startH, (i*24)+endH);
            return codes.length ? (WMO_CODES[Math.max(...codes)] || ["","❓"])[1] : "❓";
        };
        const precip = globalData.weather.daily.precipitation_sum[i];
        const uv = globalData.weather.daily.uv_index_max[i];

        // Colorisation comme dans Pandas
        let pluieHtml = precip > 0 ? `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-bold">${precip} mm</span>` : "-";
        let uvHtml = uv > 7 ? `<span class="bg-red-100 text-red-800 px-2 py-1 rounded-md font-bold">${uv}</span>` : (uv > 0 ? uv : "-");

        tbody.innerHTML += `
            <tr class="border-b border-slate-50 hover:bg-slate-50">
                <td class="py-3 px-2 font-medium capitalize">${jour}</td>
                <td class="py-3 px-2 text-center text-xl">${getEmoji(6, 12)}</td>
                <td class="py-3 px-2 text-center text-xl">${getEmoji(12, 18)}</td>
                <td class="py-3 px-2 text-center text-xl">${getEmoji(18, 24)}</td>
                <td class="py-3 px-2 text-blue-600 font-medium">${globalData.weather.daily.temperature_2m_min[i]}°</td>
                <td class="py-3 px-2 text-red-500 font-medium">${globalData.weather.daily.temperature_2m_max[i]}°</td>
                <td class="py-3 px-2 text-sm text-slate-500">${globalData.weather.daily.wind_speed_10m_max[i]} ${getWindDir(globalData.weather.daily.wind_direction_10m_dominant[i])}</td>
                <td class="py-3 px-2">${pluieHtml}</td>
                <td class="py-3 px-2">${uvHtml}</td>
            </tr>`;
    }

    // Graphiques
    drawCharts(days);
}

// Slider
document.getElementById('days-slider').addEventListener('input', (e) => {
    document.getElementById('slider-val').innerText = `${e.target.value} jours`;
    if(globalData.weather) updateDashboard();
});

// --- LOGIQUE DES GRAPHIQUES (Chart.js) ---
function createChart(canvasId, label, labels, dataY, color, yRange, thresholds = [], type = 'line') {
    if (chartInstances[canvasId]) chartInstances[canvasId].destroy();
    
    // Création des lignes de seuil pour le plugin d'annotation
    let annotations = {};
    thresholds.forEach((th, idx) => {
        annotations[`line${idx}`] = {
            type: 'line', yMin: th.val, yMax: th.val,
            borderColor: th.col, borderWidth: 1.5, borderDash: [5, 5],
            label: { display: true, content: th.txt, position: 'start', backgroundColor: th.col, font: {size: 10} }
        };
    });

    const ctx = document.getElementById(canvasId).getContext('2d');
    chartInstances[canvasId] = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: label, data: dataY,
                borderColor: color, backgroundColor: color + '33', // 33 pour transparence
                borderWidth: 2, fill: type==='line', pointRadius: 0, tension: 0.4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, annotation: { annotations: annotations } },
            scales: {
                x: { ticks: { maxTicksLimit: 14 } },
                y: yRange ? { min: yRange[0], max: yRange[1] } : { beginAtZero: true }
            }
        }
    });
}

function drawCharts(days) {
    const limit = days * 24;
    const dH = globalData.weather.hourly;
    const labels = dH.time.slice(0, limit).map(t => new Date(t).toLocaleDateString('fr-FR', {weekday:'short', hour:'2-digit'}));

    createChart('chart-temp', 'Temp (°C)', labels, dH.temperature_2m.slice(0, limit), '#ef4444', [-10, 45], [{val: 0, txt: 'Gel', col: '#3b82f6'}]);
    createChart('chart-hum', 'Humidité (%)', labels, dH.relative_humidity_2m.slice(0, limit), '#0ea5e9', [0, 100]); // Pluie pourrait être superposée, mais on simplifie ici
    createChart('chart-wind', 'Vent (km/h)', labels, dH.wind_speed_10m.slice(0, limit), '#64748b', [0, 120], [{val:60, txt:'Fort', col:'#f97316'}, {val:90, txt:'Tempête', col:'#dc2626'}]);
    createChart('chart-pres', 'Pression (hPa)', labels, dH.surface_pressure.slice(0, limit), '#10b981', null);
    createChart('chart-uv', 'UV', labels, dH.uv_index.slice(0, limit), '#eab308', [0, 12], [{val:3, txt:'Modéré', col:'#facc15'}, {val:8, txt:'Élevé', col:'#ef4444'}]);

    // Air & Pollen (Seulement si jours <= 7, sinon on remplit de null)
    let aqiData = Array(limit).fill(null);
    let pollenData = Array(limit).fill(null);
    
    if (globalData.air && globalData.air.hourly) {
        const aqiMaxLimit = Math.min(limit, globalData.air.hourly.european_aqi.length);
        aqiData.splice(0, aqiMaxLimit, ...globalData.air.hourly.european_aqi.slice(0, aqiMaxLimit));
        
        // Calcul du total pollen
        const pKeys = ["alder_pollen", "birch_pollen", "grass_pollen", "mugwort_pollen", "olive_pollen", "ragweed_pollen"];
        for (let i = 0; i < aqiMaxLimit; i++) {
            let sum = 0;
            pKeys.forEach(k => { if(globalData.air.hourly[k]) sum += (globalData.air.hourly[k][i] || 0); });
            pollenData[i] = sum;
        }
    }
    createChart('chart-aqi', 'AQI', labels, aqiData, '#a855f7', [0, 100], [{val:40, txt:'Dégradé', col:'#f97316'}]);
    createChart('chart-pollen', 'Pollen', labels, pollenData, '#22c55e', null, [{val:50, txt:'Alerte', col:'#f97316'}]);
}

// --- LOGIQUE DE LA CARTE (Leaflet) ---
const getColorForTemp = (temp) => {
    if(temp < 0) return '#3b82f6'; if(temp < 10) return '#bae6fd'; 
    if(temp < 20) return '#fef08a'; if(temp < 30) return '#f97316'; return '#ef4444';
};

async function drawMap() {
    if (!mapInstance) {
        mapInstance = L.map('leaflet-map').setView([46.603354, 1.888334], 5);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO'
        }).addTo(mapInstance);
    }
    
    // Nettoyer les anciens marqueurs
    mapInstance.eachLayer((layer) => { if (layer instanceof L.CircleMarker) mapInstance.removeLayer(layer); });

    // Charger la météo de chaque favori et ajouter un point
    for (let city of favorites) {
        try {
            const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`).then(r=>r.json());
            if(!geo.results) continue;
            const lat = geo.results[0].latitude; const lon = geo.results[0].longitude;
            const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
            const weather = await fetch(wUrl).then(r=>r.json());
            const temp = weather.current.temperature_2m;
            const icon = (WMO_CODES[weather.current.weather_code] || ["",""])[1];

            L.circleMarker([lat, lon], {
                radius: 12, fillColor: getColorForTemp(temp),
                color: "#000", weight: 2, fillOpacity: 1
            }).addTo(mapInstance).bindTooltip(`<b>${city}</b><br>${temp}°C ${icon}`, {permanent: false, direction: 'top'});
        } catch(e) {}
    }
}

// --- GESTION DES ONGLETS ---
document.getElementById('tab-btn-prev').addEventListener('click', (e) => {
    document.getElementById('tab-previsions').classList.remove('hidden');
    document.getElementById('tab-map').classList.add('hidden');
    e.target.className = "font-bold text-blue-600 border-b-2 border-blue-600 px-2 pb-1";
    document.getElementById('tab-btn-map').className = "font-bold text-slate-400 hover:text-slate-600 px-2 pb-1";
});

document.getElementById('tab-btn-map').addEventListener('click', (e) => {
    document.getElementById('tab-map').classList.remove('hidden');
    document.getElementById('tab-previsions').classList.add('hidden');
    e.target.className = "font-bold text-blue-600 border-b-2 border-blue-600 px-2 pb-1";
    document.getElementById('tab-btn-prev').className = "font-bold text-slate-400 hover:text-slate-600 px-2 pb-1";
    if (mapInstance) mapInstance.invalidateSize(); // Sécurité pour que Leaflet charge bien les tuiles
    drawMap();
});

// Initialisation
renderFavorites();
loadMainCity(lastCity);
