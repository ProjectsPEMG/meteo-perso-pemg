// src/app/page.tsx
import Link from "next/link";
import { getWeatherData, getWeatherIcon, getTempGradient } from "@/lib/weather";
import SearchBar from "@/component/SearchBar";
import WeatherDashboardContent from "@/component/WeatherDashboardContent";
import FavoriteButton from "@/component/FavoriteButton";
import FavoritesDropdown from "@/component/FavoritesDropdown";
import GeoLocator from "@/component/GeoLocator";
import { Wind, Droplets, Sun, Map, Sunrise } from "lucide-react";

// === COMPOSANT DE FOND ANIMÉ ET COHÉRENT ===
const WeatherBackground = ({ code, isDay, currentTs, sunriseTs, sunsetTs }: any) => {
  const isSunrise = Math.abs(currentTs - sunriseTs) < 3600000;
  const isSunset = Math.abs(currentTs - sunsetTs) < 3600000;
  const isSun = code === 0 || code === 1;
  const isCloud = code === 2 || code === 3 || code === 45 || code === 48;
  const isRain = [51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code);
  const isSnow = [71,73,75,77,85,86].includes(code);
  const isStorm = [95,96,99].includes(code);

  const rainDrops = Array.from({length: 40}).map((_, i) => ({ left: `${(i * 2.5)}%`, delay: `${(i % 5) * 0.15}s`, duration: `${0.5 + (i % 3) * 0.1}s` }));
  const stars = Array.from({length: 50}).map((_, i) => ({ left: `${(i * 7) % 100}%`, top: `${(i * 11) % 60}%`, delay: `${(i % 4) * 0.5}s`, size: i % 3 === 0 ? 'w-1.5 h-1.5' : 'w-1 h-1' }));
  const clouds = [ 
    { top: '10%', delay: '0s', duration: '50s', width: '300px', height: '100px', opacity: 0.4 }, 
    { top: '30%', delay: '-20s', duration: '65s', width: '400px', height: '120px', opacity: 0.3 }, 
    { top: '5%', delay: '-10s', duration: '45s', width: '250px', height: '80px', opacity: 0.5 } 
  ];

  let bgClass = "";
  if (isSunrise && isDay) bgClass = "from-orange-300 via-rose-100 to-sky-200";
  else if (isSunrise && !isDay) bgClass = "from-orange-900 via-[#0D1B2A] to-[#0D1B2A]";
  else if (isSunset && isDay) bgClass = "from-rose-300 via-orange-100 to-indigo-200";
  else if (isSunset && !isDay) bgClass = "from-rose-900 via-[#0D1B2A] to-[#0D1B2A]";
  else if (!isDay) {
    if (isStorm) bgClass = "from-slate-900 via-purple-900 to-[#050A10]";
    else if (isRain || isSnow) bgClass = "from-slate-800 via-slate-900 to-[#050A10]";
    else bgClass = "from-[#0B1522] via-[#0D1B2A] to-[#050A10]";
  } else {
    if (isSun) bgClass = "from-sky-300 via-blue-100 to-white";
    else if (isStorm) bgClass = "from-slate-600 via-slate-500 to-slate-300";
    else if (isRain || isSnow) bgClass = "from-slate-400 via-slate-300 to-slate-200";
    else bgClass = "from-slate-300 via-slate-200 to-slate-100";
  }

  return (
    <div className={`fixed inset-0 -z-50 overflow-hidden bg-gradient-to-b ${bgClass} transition-colors duration-1000 pointer-events-none`}>
      <style>{`
        @keyframes rainFall { 0% { transform: translateY(-10vh) translateX(0) scaleY(1); opacity: 0.8; } 100% { transform: translateY(110vh) translateX(-15vh) scaleY(1.5); opacity: 0.1; } }
        @keyframes snowFall { 0% { transform: translateY(-10vh) translateX(0); opacity: 0.8; } 100% { transform: translateY(110vh) translateX(20vh); opacity: 0.2; } }
        @keyframes cloudDrift { 0% { transform: translateX(-150%); } 100% { transform: translateX(150vw); } }
        @keyframes twinkle { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes lightning { 0%, 94%, 100% { opacity: 0; } 95%, 98% { opacity: 0.9; } }
      `}</style>

      {isSun && isDay && <div className="absolute top-20 right-20 md:right-40 w-48 h-48 bg-yellow-100 rounded-full blur-[80px] opacity-80 animate-pulse"></div>}
      {(!isDay && !isCloud && !isRain && !isStorm) && (
        <div className="absolute top-16 right-20 md:right-32 w-20 h-20 bg-slate-200 rounded-full blur-[2px] opacity-90 shadow-[0_0_60px_rgba(255,255,255,0.4)]"></div>
      )}

      {(!isDay && !isCloud && !isRain && !isStorm) && stars.map((s, i) => (
        <div key={`star-${i}`} className={`absolute bg-white rounded-full ${s.size}`} style={{ left: s.left, top: s.top, animation: `twinkle 3s infinite ${s.delay}` }}></div>
      ))}

      {(isCloud || isRain || isSnow || isStorm) && clouds.map((c, i) => (
        <div key={`cloud-${i}`} className="absolute bg-white rounded-full blur-3xl" style={{ top: c.top, width: c.width, height: c.height, opacity: !isDay ? c.opacity * 0.2 : c.opacity, animation: `cloudDrift ${c.duration} linear infinite ${c.delay}` }}></div>
      ))}

      {isRain && rainDrops.map((r, i) => (
        <div key={`rain-${i}`} className="absolute top-0 w-[2px] h-12 bg-sky-300 blur-[1px]" style={{ left: r.left, animation: `rainFall ${r.duration} linear infinite ${r.delay}` }}></div>
      ))}

      {isSnow && rainDrops.map((r, i) => (
        <div key={`snow-${i}`} className="absolute top-0 w-3 h-3 bg-white rounded-full blur-[1px]" style={{ left: r.left, animation: `snowFall ${r.duration} linear infinite ${r.delay}` }}></div>
      ))}

      {isStorm && <div className="absolute inset-0 bg-white mix-blend-overlay" style={{ animation: 'lightning 8s infinite' }}></div>}
    </div>
  );
};

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ lat?: string; lon?: string; city?: string }>;
}) {
  const params = await searchParams;
  
  // On vérifie si l'utilisateur a des paramètres dans l'URL
  const hasLocationParams = !!(params.lat && params.lon);
  
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

  const currentTs = new Date(current.time).getTime();
  const sunriseTs = new Date(weather.daily.sunrise[0]).getTime();
  const sunsetTs = new Date(weather.daily.sunset[0]).getTime();

  const isDayTheme = current.is_day === 1;

  const themeText = isDayTheme ? "text-slate-800" : "text-slate-100";
  const themeTextMuted = isDayTheme ? "text-slate-600" : "text-slate-300";
  const themeCardBg = isDayTheme ? "bg-white/60" : "bg-[#1B263B]/70";
  const themeInnerBg = isDayTheme ? "bg-white/50" : "bg-[#0D1B2A]/60";
  const themeBorder = isDayTheme ? "border-slate-200/50" : "border-slate-700/50";
  const themeHeaderBg = isDayTheme ? "bg-white/60" : "bg-[#0D1B2A]/70";

  return (
    <div className={`min-h-screen ${themeText} font-sans selection:bg-[#38BDF8]`}>
      
      {/* Composant invisible qui tente de géolocaliser l'utilisateur s'il n'a pas de ville */}
      {!hasLocationParams && <GeoLocator />}

      <WeatherBackground code={current.weather_code} isDay={isDayTheme} currentTs={currentTs} sunriseTs={sunriseTs} sunsetTs={sunsetTs} />

      <header className={`sticky top-0 z-50 w-full ${themeHeaderBg} backdrop-blur-md border-b ${themeBorder} p-4 md:px-8 mb-6 shadow-sm transition-colors duration-1000`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center justify-between w-full md:w-auto gap-4 shrink-0">
            <div className="flex items-center gap-2 text-xl md:text-2xl font-bold drop-shadow-sm">
              <span className="text-[#38BDF8]">Météo</span> Perso
            </div>
            
            <div className={`flex items-center gap-2 md:gap-3 ${themeInnerBg} border ${themeBorder} px-3 py-1.5 rounded-full shadow-sm backdrop-blur-md`}>
              <span className={`text-sm font-semibold truncate max-w-[100px] md:max-w-[150px]`}>{cityName}</span>
              <div className={`flex items-center gap-1.5 border-l ${themeBorder} pl-2 md:pl-3`}>
                <span className="font-bold text-orange-500 drop-shadow-sm text-sm">{Math.round(current.temperature_2m)}°</span>
                <span className="text-lg leading-none drop-shadow-md">{getWeatherIcon(current.weather_code, current.is_day)}</span>
              </div>
            </div>
          </div>

          <div className="flex w-full md:flex-1 items-center justify-between md:justify-end gap-4">
            <div className="flex-grow md:max-w-md drop-shadow-sm">
              <SearchBar isDayTheme={isDayTheme} />
            </div>
            <div className="flex gap-3 shrink-0 relative drop-shadow-sm">
              <FavoritesDropdown isDayTheme={isDayTheme} />
              <Link href="/map" className={`p-2 ${themeCardBg} rounded-full hover:scale-105 transition shadow-sm backdrop-blur-md border ${themeBorder}`}>
                <Map size={20} className="text-[#34D399]" />
              </Link>
            </div>
          </div>
          
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        <section className={`lg:col-span-1 ${themeCardBg} backdrop-blur-xl p-6 rounded-3xl border ${themeBorder} shadow-lg relative overflow-hidden lg:sticky lg:top-28 transition-colors duration-1000`}>
          <div className="absolute -top-10 -right-10 text-9xl opacity-20 pointer-events-none drop-shadow-xl">
            {getWeatherIcon(current.weather_code, current.is_day)}
          </div>
          
          <h2 className="text-3xl font-bold flex items-center gap-3 drop-shadow-sm">
            {cityName} 
            <FavoriteButton cityName={cityName} lat={lat} lon={lon} />
          </h2>
          <p className={`${themeTextMuted} mb-6 transition-colors font-medium`}>Météo actuelle</p>
          
          <div className="flex items-end gap-4 mb-8">
            <span className={`text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b drop-shadow-sm ${getTempGradient(Math.round(current.temperature_2m))}`}>
              {Math.round(current.temperature_2m)}°
            </span>
            <span className="text-2xl mb-2 drop-shadow-md">{getWeatherIcon(current.weather_code, current.is_day)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={`flex items-center gap-2 ${themeInnerBg} p-3 rounded-xl border ${themeBorder} shadow-sm backdrop-blur-md transition-colors`}>
              <Wind className="text-violet-500 shrink-0" size={20}/>
              <div className="min-w-0">
                <p className={`text-xs ${themeTextMuted} truncate font-medium`}>Vent</p>
                <p className="font-semibold truncate">{current.wind_speed_10m} km/h</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 ${themeInnerBg} p-3 rounded-xl border ${themeBorder} shadow-sm backdrop-blur-md transition-colors`}>
              <Droplets className="text-[#38BDF8] shrink-0" size={20}/>
              <div className="min-w-0">
                <p className={`text-xs ${themeTextMuted} truncate font-medium`}>Humidité</p>
                <p className="font-semibold truncate">{current.relative_humidity_2m}%</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 ${themeInnerBg} p-3 rounded-xl border ${themeBorder} shadow-sm backdrop-blur-md transition-colors`}>
              <Sun className="text-orange-400 shrink-0" size={20}/>
              <div className="min-w-0">
                <p className={`text-xs ${themeTextMuted} truncate font-medium`}>UV Max</p>
                <p className="font-semibold truncate">{weather.daily.uv_index_max[0]}</p>
              </div>
            </div>

            <div className={`flex items-center gap-2 ${themeInnerBg} p-3 rounded-xl border ${themeBorder} shadow-sm backdrop-blur-md transition-colors`}>
              <Sunrise className="text-rose-400 shrink-0" size={20}/>
              <div className="flex flex-col justify-center leading-tight min-w-0">
                <p className={`text-xs ${themeTextMuted} truncate font-medium`}>Soleil</p>
                <div className={`text-[11px] font-mono font-semibold mt-0.5`}>
                  <p className="truncate">↑ {sunriseTime}</p>
                  <p className="truncate">↓ {sunsetTime}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <WeatherDashboardContent daily={weather.daily} hourly={weather.hourly} isDayTheme={isDayTheme} />

      </main>
    </div>
  );
}
