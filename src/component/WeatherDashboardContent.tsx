// src/component/WeatherDashboardContent.tsx
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

const getTempColor = (temp: number) => {
  const stops = [
    { t: -10, c: [59, 130, 246] },   // Blue
    { t: 0, c: [59, 130, 246] },     // Blue
    { t: 10, c: [45, 212, 191] },    // Cyan
    { t: 20, c: [250, 204, 21] },    // Yellow
    { t: 30, c: [249, 115, 22] },    // Orange
    { t: 35, c: [239, 68, 68] },     // Red
    { t: 40, c: [168, 85, 247] },    // Purple
    { t: 50, c: [168, 85, 247] }     // Purple
  ];
  
  const clampedTemp = Math.max(-10, Math.min(50, temp));
  
  for (let i = 0; i < stops.length - 1; i++) {
    if (clampedTemp >= stops[i].t && clampedTemp <= stops[i+1].t) {
      const ratio = (clampedTemp - stops[i].t) / (stops[i+1].t - stops[i].t);
      const r = Math.round(stops[i].c[0] + ratio * (stops[i+1].c[0] - stops[i].c[0]));
      const g = Math.round(stops[i].c[1] + ratio * (stops[i+1].c[1] - stops[i].c[1]));
      const b = Math.round(stops[i].c[2] + ratio * (stops[i+1].c[2] - stops[i].c[2]));
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  return '#f97316';
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
                <div className="flex flex-col md:flex-row md:items-center w-full gap-4 md:gap-0">
                  
                  <div className="flex items-center gap-4 md:w-[220px] shrink-0">
                    <div className="w-12 h-12 flex items-center justify-center bg-[#1B263B] rounded-xl border border-slate-700 shadow-inner text-2xl shrink-0">
                      {/* Pour le résumé du jour, on force l'icône de jour */}
                      {getWeatherIcon(daily.weather_code[index], 1)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-100 capitalize truncate text-sm md:text-base">
                        {isToday ? "Aujourd'hui" : date.toLocaleDateString("fr-FR", { weekday: "long" })}
                      </p>
                      <p className="text-xs text-slate-400">{date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:w-[120px] shrink-0">
                    <span className="font-bold text-2xl drop-shadow-sm" style={{ color: getTempColor(dayMax) }}>
                      {Math.round(dayMax)}°
                    </span>
                    <span className="text-slate-500 text-lg">/</span>
                    <span className="font-semibold text-lg drop-shadow-sm" style={{ color: getTempColor(dayMin) }}>
                      {Math.round(dayMin)}°
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 md:flex md:items-start md:gap-0 shrink-0 text-xs font-medium text-slate-300">
                    <div className="flex flex-col md:w-[100px]">
                      <div className="flex items-center gap-1.5 text-[#38BDF8]">
                        <Droplets size={14} className="shrink-0" /> 
                        <span className="truncate">{daily.precipitation_sum[index]} mm</span>
                      </div>
                      <div className="h-[16px] flex items-center mt-0.5">
                        {daily.precipitation_probability_max[index] > 0 && (
                          <span className="text-slate-500 text-[10px] ml-5 truncate">{daily.precipitation_probability_max[index]}% de risque</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:w-[100px]">
                      <div className="flex items-center gap-1.5">
                        <Wind size={14} className="text-violet-400 shrink-0" />
                        <span className="font-mono truncate">{Math.round(daily.wind_speed_10m_max[index])} km/h</span>
                      </div>
                      <div className="h-[16px] flex items-center gap-1 text-[10px] text-slate-500 ml-5 mt-0.5">
                        <Navigation size={10} style={{ transform: `rotate(${windDir.rotate}deg)` }} className="text-slate-400 shrink-0" />
                        <span className="truncate">{windDir.label}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:w-[80px]">
                      <div className="flex items-center gap-1.5">
                        <Sun size={14} className="text-[#FBBF24] shrink-0" />
                        <span className="font-mono truncate">UV {Math.round(daily.uv_index_max[index])}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 md:mt-0 md:flex-grow flex md:justify-end shrink-0">
                    <button 
                      onClick={() => setExpandedDay(isExpanded ? null : time)}
                      className={`flex items-center justify-center w-full md:w-auto gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isExpanded ? "bg-[#38BDF8]/20 text-[#38BDF8]" : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"}`}
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
                        
                        const hWindDir = hourly.wind_direction_10m ? getWindDirection(hourly.wind_direction_10m[hIndex]) : { label: '-', rotate: 0 };
                        const hUV = hourly.uv_index ? Math.round(hourly.uv_index[hIndex]) : 0;
                        // On récupère bien si c'est le jour ou la nuit (par défaut jour)
                        const hIsDay = hourly.is_day ? hourly.is_day[hIndex] : 1;

                        return (
                          <div key={hTime} className="flex flex-col items-center justify-start gap-1 min-w-[72px] p-2 rounded-xl bg-[#0D1B2A]/50 hover:bg-[#0D1B2A] transition-colors border border-slate-700/50">
                            
                            <span className="text-[11px] font-medium text-slate-400">{hDate.getHours()}h</span>
                            
                            {/* C'est ICI la correction : on passe hIsDay à getWeatherIcon ! */}
                            <span className="text-2xl my-1">{getWeatherIcon(hourly.weather_code[hIndex], hIsDay)}</span>
                            
                            <span className="text-sm font-bold" style={{ color: getTempColor(hourly.temperature_2m[hIndex]) }}>
                              {Math.round(hourly.temperature_2m[hIndex])}°
                            </span>
                            
                            <div className="w-full h-px bg-slate-700/50 my-1" />
                            
                            <div className="flex flex-col items-center justify-center min-h-[24px]">
                              {hourly.precipitation[hIndex] > 0 ? (
                                <>
                                  <span className="text-[10px] text-[#38BDF8] font-bold leading-tight">{hourly.precipitation[hIndex]} mm</span>
                                  {hourly.precipitation_probability[hIndex] > 0 && (
                                    <span className="text-[9px] text-slate-400 leading-tight">{hourly.precipitation_probability[hIndex]}%</span>
                                  )}
                                </>
                              ) : (
                                <Droplets size={10} className="text-slate-600 opacity-50" />
                              )}
                            </div>

                            <div className="w-full h-px bg-slate-700/50 my-1" />

                            <div className="flex flex-col items-center justify-center">
                              <span className="text-[10px] text-violet-400 font-mono">{Math.round(hourly.wind_speed_10m[hIndex])} <span className="text-[8px]">km/h</span></span>
                              <div className="flex items-center gap-0.5 text-[9px] text-slate-500 mt-0.5">
                                <Navigation size={8} style={{ transform: `rotate(${hWindDir.rotate}deg)` }} className="text-slate-400" />
                                <span>{hWindDir.label}</span>
                              </div>
                            </div>

                            {hUV > 0 && (
                              <>
                                <div className="w-full h-px bg-slate-700/50 my-1" />
                                <div className="flex items-center gap-1 text-[9px] text-[#FBBF24] font-medium">
                                  <Sun size={8} />
                                  <span>UV {hUV}</span>
                                </div>
                              </>
                            )}

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
