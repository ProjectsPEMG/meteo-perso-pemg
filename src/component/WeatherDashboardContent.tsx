// src/components/WeatherDashboardContent.tsx
"use client";

import { useState } from "react";
import WeatherChart from "./WeatherChart";
import { getWeatherIcon } from "@/lib/weather";
import { Calendar, Droplets, Wind, Sun } from "lucide-react";

export default function WeatherDashboardContent({ daily, hourly }: { daily: any; hourly: any }) {
  const [daysCount, setDaysCount] = useState<number>(3);

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

      {/* LISTE DES PRÉVISIONS JOURNALIÈRES RICHES (SANS SCROLLBAR) */}
      <div className="bg-[#1B263B] p-6 rounded-3xl shadow-xl border border-slate-700">
        <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
          <Calendar size={16} className="text-[#38BDF8]" />
          Prévisions détaillées
        </h3>
        
        {/* Affichage étiré avec toutes les infos */}
        <div className="flex flex-col gap-3">
          {dailyRows.map((time: string, index: number) => {
            const date = new Date(time);
            const isToday = index === 0;

            return (
              <div 
                key={time} 
                className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border transition-colors gap-4 ${isToday ? "bg-[#0D1B2A]/80 border-[#38BDF8]/40 shadow-md" : "bg-[#0D1B2A]/40 border-slate-700/50 hover:bg-[#0D1B2A]/70"}`}
              >
                {/* 1. Date et Icône principale */}
                <div className="flex items-center gap-4 md:w-1/4">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#1B263B] rounded-xl border border-slate-700 shadow-inner text-2xl shrink-0">
                    {getWeatherIcon(daily.weather_code[index])}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-100 capitalize truncate">
                      {isToday ? "Aujourd'hui" : date.toLocaleDateString("fr-FR", { weekday: "long" })}
                    </p>
                    <p className="text-xs text-slate-400">{date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</p>
                  </div>
                </div>

                {/* 2. Températures Min/Max */}
                <div className="flex items-center gap-2 md:w-1/5">
                  <span className="font-bold text-lg text-orange-400">{Math.round(daily.temperature_2m_max[index])}°</span>
                  <span className="text-slate-500">/</span>
                  <span className="font-medium text-slate-400">{Math.round(daily.temperature_2m_min[index])}°</span>
                </div>

                {/* 3. Statistiques détaillées (Pluie, Vent, UV) */}
                <div className="grid grid-cols-3 gap-4 md:w-1/2 text-xs font-medium text-slate-300">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-[#38BDF8]">
                      <Droplets size={14} /> <span className="font-semibold">{daily.precipitation_sum[index]} mm</span>
                    </div>
                    {daily.precipitation_probability_max[index] > 0 && (
                      <span className="text-slate-500 text-[10px] ml-5">{daily.precipitation_probability_max[index]}% de risque</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <Wind size={14} className="text-violet-400" />
                    <span className="font-mono">{Math.round(daily.wind_speed_10m_max[index])} km/h</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <Sun size={14} className="text-[#FBBF24]" />
                    <span className="font-mono">UV max {Math.round(daily.uv_index_max[index])}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GRAPHIQUE INTERACTIF */}
      <div className="w-full">
        <WeatherChart data={chartData} daysCount={daysCount} />
      </div>
    </section>
  );
}
