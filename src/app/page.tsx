// src/app/page.tsx
import Link from "next/link";
import { getWeatherData, getWeatherIcon, getTempGradient } from "@/lib/weather";
import SearchBar from "@/component/SearchBar";
import WeatherDashboardContent from "@/component/WeatherDashboardContent";
import FavoriteButton from "@/component/FavoriteButton";
import FavoritesDropdown from "@/component/FavoritesDropdown";
import { Wind, Droplets, Sun, Map, Sunrise } from "lucide-react";

// === MISE À JOUR : ALGORITHME DES FONDS DYNAMIQUES (Jour & Nuit) ===
const getDynamicBackground = (code: number, isDay: number, currentTime: string, sunriseTime: string, sunsetTime: string) => {
  const current = new Date(currentTime).getTime();
  const sunrise = new Date(sunriseTime).getTime();
  const sunset = new Date(sunsetTime).getTime();
  const oneHour = 60 * 60 * 1000;

  const opacity = isDay ? '40' : '20';

  // Priorité absolue : Lever et Coucher du soleil
  if (Math.abs(current - sunrise) < oneHour) {
    return isDay 
      ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-300/50 via-slate-50 to-slate-100"
      : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/20 via-[#0D1B2A] to-[#0D1B2A]";
  }
  if (Math.abs(current - sunset) < oneHour) {
    return isDay
      ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-300/50 via-slate-50 to-slate-100"
      : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-600/20 via-[#0D1B2A] to-[#0D1B2A]";
  }

  // Nuit
  if (!isDay) {
    if ([95, 96, 99].includes(code)) return "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-[#0D1B2A] to-[#0D1B2A]";
    if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/40 via-[#0D1B2A] to-[#0D1B2A]";
    return "bg-gradient-to-b from-[#0B1522] to-[#050A10]";
  }

  // Jour
  switch (code) {
    case 0: 
    case 1: return "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-300/40 via-slate-50 to-slate-100";
    case 2: 
    case 3: return "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-300/50 via-slate-50 to-slate-100";
    case 45: 
    case 48: return "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-300/50 via-slate-50 to-slate-100";
    case 95: case 96: case 99: return "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-300/50 via-slate-50 to-slate-100";
    default: return "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-200/50 via-slate-50 to-slate-100";
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

  const isDayTheme = current.is_day === 1;

  const dynamicBgClass = getDynamicBackground(
    current.weather_code, 
    current.is_day, 
    current.time, 
    weather.daily.sunrise[0], 
    weather.daily.sunset[0]
  );

  // Variables de thème dynamiques
  const themeText = isDayTheme ? "text-slate-800" : "text-slate-100";
  const themeTextMuted = isDayTheme ? "text-slate-500" : "text-slate-400";
  const themeCardBg = isDayTheme ? "bg-white/70" : "bg-[#1B263B]/80";
  const themeInnerBg = isDayTheme ? "bg-white/50" : "bg-[#0D1B2A]/80";
  const themeBorder = isDayTheme ? "border-slate-200" : "border-slate-700/50";
  const themeHeaderBg = isDayTheme ? "bg-white/60" : "bg-[#0D1B2A]/80";

  return (
    <div className={`min-h-screen ${themeText} font-sans selection:bg-[#38BDF8] transition-colors duration-1000 ${dynamicBgClass}`}>
      
      {/* HEADER & NAVIGATION */}
      <header className={`sticky top-0 z-50 w-full ${themeHeaderBg} backdrop-blur-md border-b ${themeBorder} p-4 md:px-8 mb-6 shadow-sm transition-colors duration-1000`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center justify-between w-full md:w-auto gap-4 shrink-0">
            <div className="flex items-center gap-2 text-xl md:text-2xl font-bold">
              <span className="text-[#38BDF8]">Météo</span> Perso
            </div>
            
            <div className={`flex items-center gap-2 md:gap-3 ${themeInnerBg} border ${themeBorder} px-3 py-1.5 rounded-full shadow-sm`}>
              <span className={`text-sm font-semibold truncate max-w-[100px] md:max-w-[150px]`}>{cityName}</span>
              <div className={`flex items-center gap-1.5 border-l ${themeBorder} pl-2 md:pl-3`}>
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
              <Link href="/map" className={`p-2 ${themeCardBg} rounded-full hover:opacity-80 transition shadow-sm`}>
                <Map size={20} className="text-[#34D399]" />
              </Link>
            </div>
          </div>
          
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* HERO SECTION */}
        <section className={`lg:col-span-1 ${themeCardBg} backdrop-blur-md p-6 rounded-3xl border ${themeBorder} shadow-lg relative overflow-hidden lg:sticky lg:top-28 transition-colors duration-1000`}>
          <div className="absolute -top-10 -right-10 text-9xl opacity-10 pointer-events-none">
            {getWeatherIcon(current.weather_code, current.is_day)}
          </div>
          
          <h2 className="text-3xl font-bold flex items-center gap-3">
            {cityName} 
            <FavoriteButton cityName={cityName} lat={lat} lon={lon} />
          </h2>
          <p className={`${themeTextMuted} mb-6 transition-colors`}>Météo actuelle</p>
          
          <div className="flex items-end gap-4 mb-8">
            <span className={`text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b ${getTempGradient(Math.round(current.temperature_2m))}`}>
              {Math.round(current.temperature_2m)}°
            </span>
            <span className="text-2xl mb-2">{getWeatherIcon(current.weather_code, current.is_day)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={`flex items-center gap-2 ${themeInnerBg} p-3 rounded-xl border ${themeBorder} shadow-sm transition-colors`}>
              <Wind className="text-violet-400 shrink-0" size={20}/>
              <div className="min-w-0">
                <p className={`text-xs ${themeTextMuted} truncate`}>Vent</p>
                <p className="font-semibold truncate">{current.wind_speed_10m} km/h</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 ${themeInnerBg} p-3 rounded-xl border ${themeBorder} shadow-sm transition-colors`}>
              <Droplets className="text-[#38BDF8] shrink-0" size={20}/>
              <div className="min-w-0">
                <p className={`text-xs ${themeTextMuted} truncate`}>Humidité</p>
                <p className="font-semibold truncate">{current.relative_humidity_2m}%</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 ${themeInnerBg} p-3 rounded-xl border ${themeBorder} shadow-sm transition-colors`}>
              <Sun className="text-[#FBBF24] shrink-0" size={20}/>
              <div className="min-w-0">
                <p className={`text-xs ${themeTextMuted} truncate`}>UV Max</p>
                <p className="font-semibold truncate">{weather.daily.uv_index_max[0]}</p>
              </div>
            </div>

            <div className={`flex items-center gap-2 ${themeInnerBg} p-3 rounded-xl border ${themeBorder} shadow-sm transition-colors`}>
              <Sunrise className="text-orange-400 shrink-0" size={20}/>
              <div className="flex flex-col justify-center leading-tight min-w-0">
                <p className={`text-xs ${themeTextMuted} truncate`}>Soleil</p>
                <div className={`text-[11px] font-mono font-semibold mt-0.5`}>
                  <p className="truncate">↑ {sunriseTime}</p>
                  <p className="truncate">↓ {sunsetTime}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* On transmet l'information isDayTheme au contenu central */}
        <WeatherDashboardContent daily={weather.daily} hourly={weather.hourly} isDayTheme={isDayTheme} />

      </main>
    </div>
  );
}
