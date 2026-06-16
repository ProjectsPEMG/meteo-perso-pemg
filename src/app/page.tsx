// src/app/page.tsx
import Link from "next/link";
import { getWeatherData, getWeatherIcon, getTempGradient } from "@/lib/weather";
import SearchBar from "@/component/SearchBar";
import WeatherDashboardContent from "@/component/WeatherDashboardContent";
import FavoriteButton from "@/component/FavoriteButton";
import FavoritesDropdown from "@/component/FavoritesDropdown";
import { Wind, Droplets, Sun, Map, Sunrise } from "lucide-react";

// === ALGORITHME DES FONDS DYNAMIQUES ADAPTÉ AU THÈME CLAIR ===
const getDynamicBackground = (code: number, isDay: number, currentTime: string, sunriseTime: string, sunsetTime: string) => {
  const current = new Date(currentTime).getTime();
  const sunrise = new Date(sunriseTime).getTime();
  const sunset = new Date(sunsetTime).getTime();
  const oneHour = 60 * 60 * 1000;

  // 1. Priorité absolue : Lever et Coucher du soleil (Halo chaud très visible)
  if (Math.abs(current - sunrise) < oneHour) {
    return "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-400/40 via-slate-50 to-slate-50";
  }
  if (Math.abs(current - sunset) < oneHour) {
    return "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-500/40 via-slate-50 to-slate-50";
  }

  // 2. Nuit (On garde un fond sombre pour la nuit pour le réalisme)
  if (!isDay) {
    if ([95, 96, 99].includes(code)) return "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/50 via-[#0D1B2A] to-[#0D1B2A]"; // Orage nuit
    if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-700/50 via-[#0D1B2A] to-[#0D1B2A]"; // Pluie nuit
    return "bg-gradient-to-b from-[#0B1522] to-[#050A10]"; // Nuit claire
  }

  // 3. Jour (Fond clair avec halos colorés prononcés)
  switch (code) {
    case 0: 
    case 1: return "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/40 via-slate-50 to-slate-50"; // Soleil (Bleu vif)
    case 2: 
    case 3: return "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-400/40 via-slate-50 to-slate-50"; // Nuageux (Gris doux)
    case 45: 
    case 48: return "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-400/40 via-slate-50 to-slate-50"; // Brouillard
    case 95: case 96: case 99: return "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/40 via-slate-50 to-slate-50"; // Orage jour (Violet vif)
    default: return "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-600/40 via-slate-50 to-slate-50"; // Pluie jour (Cyan vif)
  }
};

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ lat?: string; lon?: string; city?: string }>;
}) {
  const params = await searchParams;
  const lat = params.lat ? parseFloat(params.lat) : 46.67;
  const lon = params.lon ? parseFloat(params.lon) : 5.55;
  const cityName = params.city || "Lons-le-Saunier";

  const weather = await getWeatherData(lat, lon);
  const current = weather.current;

  const formatTime = (isoString: string) => {
    if (!isoString) return "--h--";
    return isoString.split("T")[1].replace(":", "h");
  };
  const sunriseTime = formatTime(weather.daily.sunrise[0]);
  const sunsetTime = formatTime(weather.daily.sunset[0]);

  const dynamicBgClass = getDynamicBackground(
    current.weather_code, 
    current.is_day, 
    current.time, 
    weather.daily.sunrise[0], 
    weather.daily.sunset[0]
  );

  // Définition des couleurs de texte globales (sombre le jour, clair la nuit)
  const textClass = current.is_day ? "text-slate-900" : "text-slate-100";
  const textSecondaryClass = current.is_day ? "text-slate-600" : "text-slate-400";

  return (
    <div className={`min-h-screen ${textClass} font-sans selection:bg-[#38BDF8] transition-colors duration-1000 ${dynamicBgClass}`}>
      
      {/* HEADER & NAVIGATION (Adapté au thème clair) */}
      <header className={`sticky top-0 z-50 w-full ${current.is_day ? 'bg-white/80 border-slate-200' : 'bg-[#0D1B2A]/80 border-slate-700'} backdrop-blur-md border-b p-4 md:px-8 mb-6 shadow-sm`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center justify-between w-full md:w-auto gap-4 shrink-0">
            <div className="flex items-center gap-2 text-xl md:text-2xl font-bold">
              <span className="text-[#38BDF8]">Météo</span> Perso
            </div>
            
            {/* Petit bandeau (Reste sombre pour le contraste) */}
            <div className="flex items-center gap-2 md:gap-3 bg-[#1B263B] border border-slate-700 px-3 py-1.5 rounded-full shadow-inner text-slate-100">
              <span className="text-sm font-semibold truncate max-w-[100px] md:max-w-[150px]">{cityName}</span>
              <div className="flex items-center gap-1.5 border-l border-slate-600/50 pl-2 md:pl-3">
                <span className="font-bold text-orange-400 text-sm">{Math.round(current.temperature_2m)}°</span>
                <span className="text-lg leading-none">{getWeatherIcon(current.weather_code, current.is_day)}</span>
              </div>
            </div>
          </div>

          <div className="flex w-full md:flex-1 items-center justify-between md:justify-end gap-4">
            <div className="flex-grow md:max-w-md">
              <SearchBar />
            </div>
            <div className="flex gap-3 shrink-0 relative">
              <FavoritesDropdown />
              <Link href="/map" className={`p-2 ${current.is_day ? 'bg-slate-100 hover:bg-slate-200' : 'bg-[#1B263B] hover:bg-slate-700'} rounded-full transition`}>
                <Map size={20} className="text-[#34D399]" />
              </Link>
            </div>
          </div>
          
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* HERO SECTION (On la garde sombre pour un effet "Pop" magnifique sur le fond clair) */}
        <section className="lg:col-span-1 bg-gradient-to-br from-[#1B263B] to-[#0D1B2A] p-6 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden lg:sticky lg:top-28 text-slate-100">
          <div className="absolute -top-10 -right-10 text-9xl opacity-10 pointer-events-none">
            {getWeatherIcon(current.weather_code, current.is_day)}
          </div>
          
          <h2 className="text-3xl font-bold flex items-center gap-3">
            {cityName} 
            <FavoriteButton cityName={cityName} lat={lat} lon={lon} />
          </h2>
          <p className="text-slate-400 mb-6">Météo actuelle</p>
          
          <div className="flex items-end gap-4 mb-8">
            <span className={`text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b ${getTempGradient(Math.round(current.temperature_2m))}`}>
              {Math.round(current.temperature_2m)}°
            </span>
            <span className="text-2xl mb-2">{getWeatherIcon(current.weather_code, current.is_day)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 bg-[#0D1B2A] p-3 rounded-xl border border-slate-700/50 shadow-inner relative z-10">
              <Wind className="text-violet-400 shrink-0" size={20}/>
              <div className="min-w-0">
                <p className="text-xs text-slate-400 truncate">Vent</p>
                <p className="font-semibold truncate">{current.wind_speed_10m} km/h</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-[#0D1B2A] p-3 rounded-xl border border-slate-700/50 shadow-inner relative z-10">
              <Droplets className="text-[#38BDF8] shrink-0" size={20}/>
              <div className="min-w-0">
                <p className="text-xs text-slate-400 truncate">Humidité</p>
                <p className="font-semibold truncate">{current.relative_humidity_2m}%</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-[#0D1B2A] p-3 rounded-xl border border-slate-700/50 shadow-inner relative z-10">
              <Sun className="text-[#FBBF24] shrink-0" size={20}/>
              <div className="min-w-0">
                <p className="text-xs text-slate-400 truncate">UV Max</p>
                <p className="font-semibold truncate">{weather.daily.uv_index_max[0]}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#0D1B2A] p-3 rounded-xl border border-slate-700/50 shadow-inner relative z-10">
              <Sunrise className="text-orange-400 shrink-0" size={20}/>
              <div className="flex flex-col justify-center leading-tight min-w-0">
                <p className="text-xs text-slate-400 truncate">Soleil</p>
                <div className="text-[11px] font-mono font-semibold text-slate-200 mt-0.5">
                  <p className="truncate">↑ {sunriseTime}</p>
                  <p className="truncate">↓ {sunsetTime}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Passer l'information is_day au contenu central */}
        <WeatherDashboardContent daily={weather.daily} hourly={weather.hourly} isDay={current.is_day} />

      </main>
    </div>
  );
}
