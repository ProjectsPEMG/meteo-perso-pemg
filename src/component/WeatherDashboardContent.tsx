// src/components/WeatherDashboardContent.tsx
"use client";

import { useState } from "react";
import WeatherChart from "./WeatherChart";
import { getWeatherIcon } from "@/lib/weather";
import { Calendar, Droplets, Wind, Sun, Navigation, ChevronDown, ChevronUp } from "lucide-react";

const getWindDirection = (degree: number) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const index = Math.round(((degree %= 360) < 0 ? degree + 360 : degree) / 45) % 8;
  return { label: directions[index], rotate: degree };
};

export default function WeatherDashboardContent({ daily, hourly }: { daily: any; hourly: any }) {
  const [daysCount, setDaysCount] = useState<number>(3);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const totalHoursToDisplay = daysCount * 24;
  const chartData = hourly.time.slice(0, totalHoursToDisplay).map((time: string, index: number) => {
    return {
      uniqueTime: time,
      temp: hourly.temperature_2m[index],
      rainQty: hourly.precipitation[index],
      rainProb: hourly.precipitation_probability[index],
      wind: hourly.wind_speed_10m[index],
      gusts: hourly.wind_gusts_10m[index],
      pm2_5: hourly.pm2_5 ? hourly.pm2_5[index] : 0,
      pollen: hourly.pollen ? hourly.pollen[index] : 0,
      dateFull: new Date(time).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit" }),
      hour: new Date(time).getHours()
    };
  });

  const dailyRows = daily.time.slice(0, daysCount);

  return (
    <section className="lg:col-span-2 flex flex-col gap-6 w-full">
      
      {/* SÉLECTEUR DE PÉRIODE */}
      <div className="bg-[#1B263B] p-4 rounded-3xl border border-slate-700 shadow-xl flex justify-between items-center">
        <span className="text-sm font-medium text-slate-300">Période d'analyse :</span>
        <div className="flex bg-[#0D1B2A] p-1 rounded-xl border border-slate-700 text-xs font-semibold">
          {[3, 7, 15].map((days) => (
            <button
              key={days}
              onClick={() => setDaysCount(days)}
              className={`px-4 py-2 rounded-lg transition-colors ${daysCount === days ? "bg-[#38BDF8] text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              {days} Jours
            </button>
          ))}
        </div>
      </div>

      {/* LISTE DES PRÉVISIONS JOURNALIÈRES */}
      <div className="bg-[#1B263B] p-6 rounded-3xl shadow-xl border border-slate-700">
        <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
          <Calendar size={16} className="text-[#38BDF8]" />
          Prévisions détaillées
        </h3>
        
        <div className="flex flex-col gap-3">
          {dailyRows.map((time: string, index: number) => {
            const date = new Date(time);
            const isToday = index === 0;
            const isExpanded = expandedDay === time;

            const dayMin = daily.temperature_2m_min[index];
            const dayMax = daily.temperature_2m_max[index];
            const windDir = getWindDirection(daily.wind_direction_10m_dominant[index]);

            return (
              <div 
                key={time} 
                className={`flex flex-col p-4 rounded-2xl border transition-colors ${isToday ? "bg-[#0D1B2A]/80 border-[#38BDF8]/40 shadow-md" : "bg-[#0D1B2A]/40 border-slate-700/50 hover:bg-[#0D1B2A]/70"}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* GROUPE 1 : DATE, ICÔNE ET TEMPÉRATURES (Premiers éléments visibles) */}
                  <div className="flex items-center justify-between lg:justify-start gap-6 lg:w-[45%]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-[#1B263B] rounded-xl border border-slate-700 shadow-inner text-2xl shrink-0">
                        {getWeatherIcon(daily.weather_code[index])}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-100 capitalize truncate text-sm md:text-base">
                          {isToday ? "Aujourd'hui" : date.toLocaleDateString("fr-FR", { weekday: "long" })}
                        </p>
                        <p className="text-xs text-slate-400">{date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</p>
                      </div>
                    </div>

                    {/* Températures mises en évidence directement après la date */}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xl md:text-2xl text-orange-400">{Math.round(dayMax)}°</span>
                      <span className="text-slate-500 text-lg">/</span>
                      <span className="font-semibold text-slate-400 text-lg md:text-xl">{Math.round(dayMin)}°</span>
                    </div>
                  </div>

                  {/* GROUPE 2 : STATISTIQUES (Pluie, Vent, UV) */}
                  <div className="grid grid-cols-3 gap-2 lg:w-[40%] text-xs font-medium text-slate-300">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-[#38BDF8]">
                        <Droplets size={14} /> <span>{daily.precipitation_sum[index]} mm</span>
                      </div>
                      {daily.precipitation_probability_max[index] > 0 && (
                        <span className="text-slate-500 text-[10px] ml-5">{daily.precipitation_probability_max[index]}% de risque</span>
                      )}
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <Wind size={14} className="text-violet-400" />
                        <span className="font-mono">{Math.round(daily.wind_speed_10m_max[index])} km/h</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 ml-5 mt-0.5">
                        <Navigation size={10} style={{ transform: `rotate(${windDir.rotate}deg)` }} className="text-slate-400" />
                        <span>{windDir.label}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <Sun size={14} className="text-[#FBBF24]" />
                      <span className="font-mono">UV {Math.round(daily.uv_index_max[index])}</span>
                    </div>
                  </div>

                  {/* GROUPE 3 : BOUTON VOIR + */}
                  <div className="lg:w-[15%] flex justify-end">
                    <button 
                      onClick={() => setExpandedDay(isExpanded ? null : time)}
                      className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isExpanded ? "bg-[#38BDF8]/20 text-[#38BDF8]" : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"}`}
                    >
                      {isExpanded ? "Fermer" : "Voir +"}
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                </div>

                {/* ACCORDÉON : DÉTAIL HEURE PAR HEURE */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-xs font-bold text-slate-400 mb-3 ml-1 uppercase tracking-wider">Évolution de la journée</p>
                    <div className="flex gap-2 overflow-x-auto pb-3 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                      {hourly.time.map((hTime: string, hIndex: number) => {
                        if (!hTime.startsWith(time.split('T')[0])) return null;
                        
                        const hDate = new Date(hTime);
                        return (
                          <div key={hTime} className="flex flex-col items-center justify-between gap-2 min-w-[56px] p-2 rounded-xl bg-slate-800/30 hover:bg-slate-700/50 transition-colors border border-slate-700/30">
                            <span className="text-[11px] font-medium text-slate-400">{hDate.getHours()}h</span>
                            <span className="text-2xl my-1">{getWeatherIcon(hourly.weather_code[hIndex])}</span>
                            <span className="text-sm font-bold text-slate-200">{Math.round(hourly.temperature_2m[hIndex])}°</span>
                            
                            {/* AFFICHAGE PLUIE : MM ET PROBABILITÉ */}
                            <div className="min-h-[24px] flex flex-col items-center justify-center">
                              {hourly.precipitation[hIndex] > 0 && (
                                <span className="text-[11px] text-[#38BDF8] font-bold leading-tight">{hourly.precipitation[hIndex]} mm</span>
                              )}
                              {hourly.precipitation_probability[hIndex] > 0 && (
                                <span className="text-[9px] text-slate-400 leading-tight">{hourly.precipitation_probability[hIndex]}%</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full">
        <WeatherChart data={chartData} daysCount={daysCount} />
      </div>
    </section>
  );
}
