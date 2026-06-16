// src/components/WeatherDashboardContent.tsx
"use client";

import { useState } from "react";
import WeatherChart from "./WeatherChart";
import { getWeatherIcon } from "@/lib/weather";
import { Calendar, BarChart3, ChevronRight } from "lucide-react";

export default function WeatherDashboardContent({ daily, hourly }: { daily: any; hourly: any }) {
  const [daysCount, setDaysCount] = useState<number>(3);

  // 1. EXTRACTION ET INJECTION CORRIGÉE DES DONNÉES POLLUTION / POLLEN
  const totalHoursToDisplay = daysCount * 24;
  const chartData = hourly.time.slice(0, totalHoursToDisplay).map((time: string, index: number) => {
    return {
      uniqueTime: time,
      temp: hourly.temperature_2m[index],
      rainQty: hourly.precipitation[index],
      rainProb: hourly.precipitation_probability[index],
      wind: hourly.wind_speed_10m[index],
      gusts: hourly.wind_gusts_10m[index],
      // On s'assure d'extraire les données météo ET de pollution pour chaque index horaire
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

      {/* LISTE DES PRÉVISIONS JOURNALIÈRES (SANS CURSEUR DE DÉFILEMENT) */}
      <div className="bg-[#1B263B] p-6 rounded-3xl shadow-xl border border-slate-700">
        <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
          <Calendar size={16} className="text-[#38BDF8]" />
          Prévisions détaillées
        </h3>
        
        {/* MODIFICATION ICI : Suppression de max-h et de overflow-y-auto pour tout afficher d'un coup */}
        <div className="flex flex-col gap-2">
          {dailyRows.map((time: string, index: number) => {
            const date = new Date(time);
            const isToday = index === 0;

            return (
              <div 
                key={time} 
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${isToday ? "bg-[#0D1B2A]/60 border-[#38BDF8]/40 shadow-md" : "bg-[#0D1B2A]/30 border-slate-700/40 hover:bg-[#0D1B2A]/50"}`}
              >
                <div className="w-1/3 min-w-0">
                  <p className="text-sm font-semibold capitalize truncate text-slate-200">
                    {isToday ? "Aujourd'hui" : date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric" })}
                  </p>
                  <p className="text-[11px] text-slate-400 capitalize">{date.toLocaleDateString("fr-FR", { month: "short" })}</p>
                </div>

                <div className="flex items-center justify-center gap-4 w-1/3 text-center">
                  <span className="text-xl">{getWeatherIcon(daily.weather_code[index])}</span>
                  {daily.precipitation_probability_max[index] > 20 && (
                    <span className="text-xs font-medium text-[#38BDF8] font-mono">{daily.precipitation_probability_max[index]}%</span>
                  )}
                </div>

                <div className="w-1/3 flex items-center justify-end gap-3">
                  <div className="text-right font-mono text-xs">
                    <span className="font-bold text-orange-400 text-sm">{Math.round(daily.temperature_2m_max[index])}°</span>
                    <span className="text-slate-500 mx-1">/</span>
                    <span className="text-slate-400">{Math.round(daily.temperature_2m_min[index])}°</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-600" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GRAPHIQUE INTERACTIF COMPLET */}
      <div className="w-full">
        <WeatherChart data={chartData} daysCount={daysCount} />
      </div>

    </section>
  );
}
