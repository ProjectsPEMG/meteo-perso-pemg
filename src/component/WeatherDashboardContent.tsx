// src/component/WeatherDashboardContent.tsx
"use client";

import { useState } from "react";
import WeatherChart from "./WeatherChart";
import { getWeatherIcon } from "@/lib/weather";
import { Calendar, Droplets, Wind, Sun, Navigation, ChevronDown, ChevronUp } from "lucide-react";

export default function WeatherDashboardContent({ daily, hourly, isDay }: { daily: any; hourly: any, isDay: boolean }) {
  const [daysCount, setDaysCount] = useState<number>(3);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Remise en place de la logique de calcul précédente
  const getWindDirection = (degree: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(((degree %= 360) < 0 ? degree + 360 : degree) / 45) % 8;
    return { label: directions[index], rotate: degree };
  };

  const chartData = hourly.time.slice(0, daysCount * 24).map((time: string, index: number) => ({
    uniqueTime: time,
    temp: hourly.temperature_2m[index],
    rainQty: hourly.precipitation[index],
    rainProb: hourly.precipitation_probability[index],
    wind: hourly.wind_speed_10m[index],
    pm2_5: hourly.pm2_5 ? hourly.pm2_5[index] : 0,
    pollen: hourly.grass_pollen ? hourly.grass_pollen[index] : 0,
  }));

  const bgCard = isDay ? "bg-white" : "bg-[#1B263B]";
  const textMuted = isDay ? "text-slate-600" : "text-slate-400";
  const borderCol = isDay ? "border-slate-300" : "border-slate-700";
  const textMain = isDay ? "text-slate-800" : "text-slate-100";

  return (
    <section className="lg:col-span-2 flex flex-col gap-6 w-full">
      <div className={`${bgCard} p-6 rounded-3xl shadow-xl border ${borderCol} transition-colors duration-1000`}>
        <h3 className={`text-sm font-bold uppercase ${textMuted} tracking-wider mb-4 flex items-center gap-2`}>
          <Calendar size={16} className="text-[#38BDF8]" /> Prévisions détaillées
        </h3>
        
        <div className="flex flex-col gap-3">
          {daily.time.slice(0, daysCount).map((time: string, index: number) => {
            const isExpanded = expandedDay === time;
            const windDir = getWindDirection(daily.wind_direction_10m_dominant[index]);
            
            return (
              <div key={time} className={`p-4 rounded-2xl border ${borderCol} ${isDay ? 'bg-slate-50' : 'bg-[#0D1B2A]/40'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{getWeatherIcon(daily.weather_code[index])}</div>
                    <div>
                      <p className={`font-bold ${textMain}`}>{new Date(time).toLocaleDateString("fr-FR", { weekday: "long" })}</p>
                      <p className={`text-xs ${textMuted}`}>{new Date(time).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</p>
                    </div>
                  </div>
                  
                  {/* Tes colonnes d'infos originales */}
                  <div className="hidden md:flex gap-6 text-sm">
                    <div className="flex items-center gap-2"><Droplets size={16} className="text-[#38BDF8]" /> {daily.precipitation_sum[index]}mm</div>
                    <div className="flex items-center gap-2"><Wind size={16} className="text-violet-400" /> {Math.round(daily.wind_speed_10m_max[index])} km/h</div>
                    <div className="flex items-center gap-2"><Sun size={16} className="text-[#FBBF24]" /> UV {Math.round(daily.uv_index_max[index])}</div>
                  </div>

                  <button onClick={() => setExpandedDay(isExpanded ? null : time)} className="p-2 hover:bg-slate-500/20 rounded-full">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-500/20 overflow-x-auto flex gap-4">
                    {hourly.time.filter((h: string) => h.startsWith(time.split('T')[0])).map((hTime: string, i: number) => (
                      <div key={hTime} className="flex flex-col items-center gap-1 min-w-[50px]">
                        <span className={`text-xs ${textMuted}`}>{new Date(hTime).getHours()}h</span>
                        <span className="text-xl">{getWeatherIcon(hourly.weather_code[i])}</span>
                        <span className={`font-bold ${textMain}`}>{Math.round(hourly.temperature_2m[i])}°</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <WeatherChart data={chartData} daysCount={daysCount} isDay={isDay} />
    </section>
  );
}
