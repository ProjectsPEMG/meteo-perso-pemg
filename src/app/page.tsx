// src/app/page.tsx
import Link from "next/link";
import { getWeatherData, getWeatherIcon, getTempGradient } from "@/lib/weather";
import SearchBar from "@/component/SearchBar";
import WeatherDashboardContent from "@/component/WeatherDashboardContent";
import FavoriteButton from "@/component/FavoriteButton";
import FavoritesDropdown from "@/component/FavoritesDropdown";
import { Wind, Droplets, Sun, Map, Sunrise } from "lucide-react";

// === NOUVEAU : ALGORITHME DES FONDS DYNAMIQUES (Clair/Sombre) ===
const getDynamicBackground = (code: number, isDay: number, currentTime: string, sunriseTime: string, sunsetTime: string) => {
  const current = new Date(currentTime).getTime();
  const sunrise = new Date(sunriseTime).getTime();
  const sunset = new Date(sunsetTime).getTime();
  const oneHour = 60 * 60 * 1000;

  const opacity = isDay ? '10' : '20'; // Moins d'opacité le jour pour rester subtil

  // 1. Soleil (Jour Dégagé)
  if (isDay && (code === 0 || code === 1)) {
    return `bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/${opacity} via-white to-white`;
  }

  // 2. Priorité absolue : Lever et Coucher (Halo orangé/rosé)
  // On baisse l'opacité et on utilise via-white/to-white pour le jour
  if (Math.abs(current - sunrise) < oneHour) {
    if (isDay) return `bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-400/${opacity} via-white to-white`;
    return `bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/20 via-[#0D1B2A] to-[#0D1B2A]`;
  }
  if (Math.abs(current - sunset) < oneHour) {
    if (isDay) return `bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-500/${opacity} via-white to-white`;
    return `bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-600/20 via-[#0D1B2A] to-[#0D1B2A]`;
  }

  // 3. Pluie/Averses (Halo cyan)
  if (isDay && [51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) {
    return `bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-600/${opacity} via-white to-white`;
  }

  // 4. Orage (Halo violet)
  if ([95, 96, 99].includes(code)) {
    if (isDay) return `bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-700/10 via-white to-white`;
    return `bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-700/30 via-[#0D1B2A] to-[#0D1B2A]`;
  }

  // 5. Nuit Dégagée
  if (!isDay && (code === 0 || code === 1)) {
    return "bg-gradient-to-b from-[#0B1522] to-[#050A10]"; // Noir profond
  }

  // 6. Default/Overcast Jour (Halo gris)
  if (isDay) {
    return `bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-300/${opacity} via-white to-white`;
  }

  // 7. Default/Overcast Nuit (Comme actuellement)
  return `bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-500/10 via-[#0D1B2A] to-[#0D1B2A]`;
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

  // Génération du fond dynamique
  const dynamicBgClass = getDynamicBackground(
    current.weather_code, 
    current.is_day, 
    current.time, 
    weather.daily.sunrise[0], 
    weather.daily.sunset[0]
  );

  // === NOUVEAU : CLASSES DYNAMIQUES DE COULEUR ===
  const isDay = current.is_day === 1;
  const textColor = isDay ? "text-slate-900" : "text-slate-100";
  const textMuted = isDay ? "text-slate-600" : "text-slate-400";
  const textSubtle = isDay ? "text-slate-500" : "text-slate-500";
  const borderCol = isDay ? "border-slate-300/60" : "border-slate-700/50";
  const bgCard = isDay ? "bg-white/80" : "bg-[#1B263B]/80";
  const bgInner = isDay ? "bg-slate-100/70" : "bg-[#0D1B2A]/80";
  const headerBg = isDay ? "bg-white/70" : "bg-[#0D1B2A]/80";

  return (
    // transition-colors duration-1000 pour une transition douce
    <div className={`min-h-screen ${textColor} font-sans selection:bg-[#38BDF8] transition-colors duration-1000 ${dynamicBgClass}`}>
      
      {/* HEADER & NAVIGATION (Coloration dynamique) */}
      <header className={`sticky top-0 z-50 w-full ${headerBg} backdrop-blur-md border-b ${borderCol} p-4 md:px-8 mb-6 shadow-sm`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* LIGNE 1 : LOGO + PETIT BANDEAU MÉTÉO */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4 shrink-0">
            <div className={`flex items-center gap-2 text-xl md:text-2xl font-bold`}>
              <span className="text-[#38BDF8]">Météo</span> Perso
            </div>
            
            {/* Petit bandeau dynamique */}
            <div className={`flex items-center gap-2 md:gap-3 ${isDay ? 'bg-slate-100' : 'bg-[#1B263B]/60'} border ${borderCol} px-3 py-1.5 rounded-full shadow-inner`}>
              <span className={`text-sm font-semibold truncate max-w-[100px] md:max-w-[150px] ${isDay ? 'text-slate-800' : 'text-slate-200'}`}>{cityName}</span>
              <div className={`flex items-center gap-1.5 border-l ${borderCol} pl-2 md:pl-3`}>
                <span className="font-bold text-orange-400 text-sm">{Math.round(current.temperature_2m)}°</span>
                <span className="text-lg leading-none">{getWeatherIcon(current.weather_code, current.is_day)}</span>
              </div>
            </div>
          </div>

          {/* LIGNE 2 : RECHERCHE + FAVORIS */}
          <div className="flex w-full md:flex-1 items-center justify-between md:justify-end gap-4">
            <div className="flex-grow md:max-w-md">
              {/* On passe isDay pour que SearchBar s'adapte */}
              <SearchBar isDay={isDay} />
            </div>
            <div className="flex gap-3 shrink-0 relative">
              {/* On passe isDay pour FavoritesDropdown */}
              <FavoritesDropdown isDay={isDay} />
              <Link href="/map" className={`p-2 ${isDay ? 'bg-slate-200/60 hover:bg-slate-300' : 'bg-[#1B263B] hover:bg-slate-700'} rounded-full transition shadow-sm`}>
                <Map size={20} className="text-[#34D399]" />
              </Link>
            </div>
          </div>
          
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* HERO SECTION : MÉTÉO ACTUELLE (Coloration dynamique) */}
        <section className={`lg:col-span-1 ${bgCard} backdrop-blur-md p-6 rounded-3xl border ${borderCol} shadow-xl relative overflow-hidden lg:sticky lg:top-28 transition-colors duration-1000`}>
          <div className="absolute -top-10 -right-10 text-9xl opacity-10 pointer-events-none">
            {getWeatherIcon(current.weather_code, current.is_day)}
          </div>
          
          <h2 className="text-3xl font-bold flex items-center gap-3 min-w-0">
            <span className="truncate">{cityName}</span>
            {/* FavoriteButton est déjà intelligent si on passe les props */}
            <FavoriteButton cityName={cityName} lat={lat} lon={lon} />
          </h2>
          <p className={`${textMuted} mb-6`}>Météo actuelle</p>
          
          <div className="flex items-end gap-4 mb-8">
            <span className={`text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b ${getTempGradient(Math.round(current.temperature_2m))}`}>
              {Math.round(current.temperature_2m)}°
            </span>
            <span className="text-2xl mb-2">{getWeatherIcon(current.weather_code, current.is_day)}</span>
          </div>

          {/* GRILLE D'INFORMATIONS ACTUELLES (Coloration dynamique) */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`flex items-center gap-2 ${bgInner} p-3 rounded-xl border ${borderCol} shadow-inner`}>
              <Wind className="text-violet-400 shrink-0" size={20}/>
              <div className="min-w-0">
                <p className={`text-xs ${textMuted} truncate`}>Vent</p>
                <p className="font-semibold truncate">{current.wind_speed_10m} km/h</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 ${bgInner} p-3 rounded-xl border ${borderCol} shadow-inner`}>
              <Droplets className="text-[#38BDF8] shrink-0" size={20}/>
              <div className="min-w-0">
                <p className={`text-xs ${textMuted} truncate`}>Humidité</p>
                <p className="font-semibold truncate">{current.relative_humidity_2m}%</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 ${bgInner} p-3 rounded-xl border ${borderCol} shadow-inner`}>
              <Sun className="text-[#FBBF24] shrink-0" size={20}/>
              <div className="min-w-0">
                <p className={`text-xs ${textMuted} truncate`}>UV Max</p>
                <p className="font-semibold truncate">{weather.daily.uv_index_max[0]}</p>
              </div>
            </div>

            <div className={`flex items-center gap-2 ${bgInner} p-3 rounded-xl border ${borderCol} shadow-inner`}>
              <Sunrise className="text-orange-400 shrink-0" size={20}/>
              <div className="flex flex-col justify-center leading-tight min-w-0">
                <p className={`text-xs ${textMuted} truncate`}>Soleil</p>
                <div className={`text-[11px] font-mono font-semibold ${isDay ? 'text-slate-800' : 'text-slate-200'} mt-0.5`}>
                  <p className="truncate">↑ {sunriseTime}</p>
                  <p className="truncate">↓ {sunsetTime}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENU CENTRAL (Il faudra aussi le mettre à jour) */}
        <WeatherDashboardContent daily={weather.daily} hourly={weather.hourly} isDay={isDay} />

      </main>
    </div>
  );
}
