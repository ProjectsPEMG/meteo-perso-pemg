// src/components/WeatherDashboardContent.tsx
"use client";

import { useState } from "react";
import { Droplets, Sun, Umbrella, Wind } from "lucide-react";
import { getWeatherIcon, getTempGradient, getWindDirectionIcon } from "@/lib/weather";
import WeatherChart from "./WeatherChart";

export default function WeatherDashboardContent({ daily, hourly }: { daily: any; hourly: any }) {
  const [daysCount, setDaysCount] = useState(7);

  const totalHoursNeeded = daysCount * 24;
  const chartData = hourly.time.slice(0, totalHoursNeeded).map((time: string, index: number) => {
    const date = new Date(time);
    return {
      uniqueTime: time,
      timeLabel: date.toLocaleTimeString('fr-FR', { hour: '2-digit' }) + 'h',
      dateLabel: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      dateFull: date.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit' }) + 'h',
      hour: date.getHours(),
      temp: hourly.temperature_2m[index],
      rainQty: hourly.precipitation[index],
      rainProb: hourly.precipitation_probability[index],
      pm2_5: hourly.pm2_5[index],
      pollen: hourly.pollen[index],
      wind: hourly.wind_speed_10m[index],
      gusts: hourly.wind_gusts_10m[index]
    };
  });

  return (
    <div className="lg:col-span-2 flex flex-col gap-6">
      
      <section className="bg-[#1B263B] p-6 rounded-3xl border border-slate-700 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold">Prévisions <span className="text-[#38BDF8]">({daysCount} jours)</span></h2>
          <div className="flex items-center gap-3 w-full sm:w-auto bg-[#0D1B2A] px-4 py-2 rounded-full border border-slate-700">
            <span className="text-xs text-slate-500 font-mono">1j</span>
            <input 
              type="range" min="1" max="15" 
              value={daysCount} 
              onChange={(e) => setDaysCount(Number(e.target.value))}
              className="w-32 sm:w-40 accent-[#38BDF8] cursor-pointer" 
            />
            <span className="text-xs text-slate-500 font-mono">15j</span>
          </div>
        </div>
        
        <div className="overflow-x-auto max-h-[300px] overflow-y-auto pr-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-slate-400 border-b border-slate-700 sticky top-0 bg-[#1B263B] z-10">
              <tr>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium text-center">Météo</th>
                <th className="pb-3 font-medium text-center">Min / Max</th>
                <th className="pb-3 font-medium text-center">Pluie</th>
                {/* NOUVELLE COLONNE VENT */}
                <th className="pb-3 font-medium text-center">Vent (Max)</th>
                <th className="pb-3 font-medium text-center">UV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {daily.time.slice(0, daysCount).map((date: string, i: number) => {
                const morningIcon = getWeatherIcon(hourly.weather_code[i * 24 + 8], 1);
                const noonIcon = getWeatherIcon(hourly.weather_code[i * 24 + 14], 1);
                const eveningIcon = getWeatherIcon(hourly.weather_code[i * 24 + 20], 0);

                return (
                  <tr key={date} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 font-mono text-slate-300">
                      {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                    </td>
                    <td className="py-3 text-center text-xl tracking-wider">
                      {morningIcon} {noonIcon} {eveningIcon}
                    </td>
                    <td className="py-3 text-center font-mono font-bold">
                      <span className={`text-transparent bg-clip-text bg-gradient-to-br ${getTempGradient(Math.round(daily.temperature_2m_min[i]))}`}>{Math.round(daily.temperature_2m_min[i])}°</span> 
                      <span className="text-slate-600 mx-1">/</span> 
                      <span className={`text-transparent bg-clip-text bg-gradient-to-br ${getTempGradient(Math.round(daily.temperature_2m_max[i]))}`}>{Math.round(daily.temperature_2m_max[i])}°</span>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="flex items-center gap-1 text-slate-400 text-xs"><Umbrella size={13}/> {daily.precipitation_probability_max[i]}%</span>
                        <span className="flex items-center gap-1 text-[#38BDF8] text-xs"><Droplets size={13}/> {daily.precipitation_sum[i]} mm</span>
                      </div>
                    </td>
                    {/* AFFICHAGE DU VENT */}
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Wind size={14} className="text-violet-400" />
                        <span className="font-semibold text-slate-200">{Math.round(daily.wind_speed_10m_max[i])}</span>
                        <span className="text-xs text-slate-400">km/h</span>
                        <span className="text-xs font-bold text-violet-300 ml-1">{getWindDirectionIcon(daily.wind_direction_10m_dominant[i])}</span>
                      </div>
                    </td>
                    <td className="py-3 text-center font-mono text-[#FBBF24] font-semibold">{daily.uv_index_max[i] || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <WeatherChart data={chartData} daysCount={daysCount} />
    </div>
  );
}