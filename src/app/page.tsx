// src/app/page.tsx
import Link from "next/link";
import { getWeatherData, getWeatherIcon, getTempGradient } from "@/lib/weather";
import SearchBar from "@/component/SearchBar";
import WeatherDashboardContent from "@/component/WeatherDashboardContent";
import FavoriteButton from "@/component/FavoriteButton";
import FavoritesDropdown from "@/component/FavoritesDropdown";
import { Wind, Droplets, Sun, Map } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-slate-100 font-sans selection:bg-[#38BDF8]">
      
      {/* HEADER & NAVIGATION (Fixe en haut avec effet verre flouté) */}
      <header className="sticky top-0 z-50 w-full bg-[#0D1B2A]/80 backdrop-blur-md border-b border-slate-700/50 p-4 md:px-8 mb-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* LIGNE 1 : LOGO + PETIT BANDEAU MÉTÉO */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-2 text-xl md:text-2xl font-bold shrink-0">
              <span className="text-[#38BDF8]">Météo</span> Perso
            </div>
            
            {/* Le fameux petit bandeau intégré */}
            <div className="flex items-center gap-2 md:gap-3 bg-[#1B263B]/60 border border-slate-700/50 px-3 py-1.5 rounded-full shadow-inner">
              <span className="text-sm font-semibold text-slate-200 truncate max-w-[100px] md:max-w-[150px]">{cityName}</span>
              <div className="flex items-center gap-1.5 border-l border-slate-600/50 pl-2 md:pl-3">
                <span className="font-bold text-orange-400 text-sm">{Math.round(current.temperature_2m)}°</span>
                <span className="text-lg leading-none">{getWeatherIcon(current.weather_code, current.is_day)}</span>
              </div>
            </div>
          </div>

          {/* LIGNE 2 : RECHERCHE + FAVORIS */}
          <div className="flex w-full md:w-auto items-center justify-between gap-4">
            <div className="flex-grow md:flex-grow-0">
              <SearchBar />
            </div>
            <div className="flex gap-3 shrink-0 relative">
              <FavoritesDropdown />
              <Link href="/map" className="p-2 bg-[#1B263B] rounded-full hover:bg-slate-700 transition">
                <Map size={20} className="text-[#34D399]" />
              </Link>
            </div>
          </div>
          
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* HERO SECTION : MÉTÉO ACTUELLE (Collant uniquement sur PC) */}
        <section className="lg:col-span-1 bg-gradient-to-br from-[#1B263B] to-[#0D1B2A] p-6 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden lg:sticky lg:top-28">
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
            <div className="flex items-center gap-2 bg-[#0D1B2A] p-3 rounded-xl border border-slate-700/50">
              <Wind className="text-violet-400" size={20}/>
              <div>
                <p className="text-xs text-slate-400">Vent</p>
                <p className="font-semibold">{current.wind_speed_10m} km/h</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#0D1B2A] p-3 rounded-xl border border-slate-700/50">
              <Droplets className="text-[#38BDF8]" size={20}/>
              <div>
                <p className="text-xs text-slate-400">Humidité</p>
                <p className="font-semibold">{current.relative_humidity_2m}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#0D1B2A] p-3 rounded-xl border border-slate-700/50">
              <Sun className="text-[#FBBF24]" size={20}/>
              <div>
                <p className="text-xs text-slate-400">UV Max</p>
                <p className="font-semibold">{weather.daily.uv_index_max[0]}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENU CENTRAL DYNAMIQUE (TABLEAU + GRAPH) */}
        <WeatherDashboardContent daily={weather.daily} hourly={weather.hourly} />

      </main>
    </div>
  );
}
