// src/lib/weather.ts

export async function getWeatherData(lat: number, lon: number) {
  // AJOUT dans &daily= : wind_speed_10m_max et wind_direction_10m_dominant
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,uv_index,weather_code,is_day,wind_speed_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant&timezone=auto&forecast_days=15`;
  const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5,pm10,grass_pollen&timezone=auto&forecast_days=15`;

  const weatherRes = await fetch(weatherUrl, { next: { revalidate: 3600 } });
  if (!weatherRes.ok) throw new Error("Erreur météo");
  const weatherData = await weatherRes.json();

  // On initialise avec des "null". Si l'API plante sur Codespaces, 
  // le graphique sera vide (transparent) au lieu de montrer de fausses courbes.
  let pm2_5 = new Array(360).fill(null);
  let pm10 = new Array(360).fill(null);
  let pollen = new Array(360).fill(null);

  try {
    const aqRes = await fetch(airQualityUrl, { next: { revalidate: 3600 } });
    if (aqRes.ok) {
      const aqData = await aqRes.json();
      pm2_5 = aqData.hourly?.pm2_5 || pm2_5;
      pm10 = aqData.hourly?.pm10 || pm10;
      pollen = aqData.hourly?.grass_pollen || pollen;
    }
  } catch (error) {
    console.warn("API Qualité de l'air bloquée temporairement, affichage vide.");
  }

  return {
    ...weatherData,
    hourly: {
      ...weatherData.hourly,
      pm2_5,
      pm10,
      pollen,
    }
  };
}

export function getWeatherIcon(code: number, isDay: number = 1) {
  if (code === 0) return isDay ? "☀️" : "🌙";
  if (code === 1 || code === 2) return isDay ? "🌤️" : "☁️";
  if (code === 3) return "☁️";
  if (code >= 45 && code <= 48) return "🌫️";
  if (code >= 51 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 95) return "⛈️";
  return "❓";
}

export function getTempGradient(temp: number) {
  if (temp <= 0) return "from-blue-600 to-cyan-400";
  if (temp <= 12) return "from-cyan-400 to-emerald-400";
  if (temp <= 22) return "from-emerald-400 to-yellow-400";
  if (temp <= 29) return "from-yellow-400 to-orange-500";
  if (temp <= 36) return "from-orange-500 to-red-600";
  return "from-red-600 to-purple-600";
}

// NOUVEAU : Calcule la provenance du vent et affiche la flèche dans le sens du courant
export function getWindDirectionIcon(degree: number) {
  // Si le vent vient du Nord (0°), il descend (↓). S'il vient de l'Est (90°), il va vers l'Ouest (←).
  const directions = ['N ↓', 'NE ↙', 'E ←', 'SE ↖', 'S ↑', 'SW ↗', 'W →', 'NW ↘'];
  const index = Math.round(((degree %= 360) < 0 ? degree + 360 : degree) / 45) % 8;
  return directions[index];
}