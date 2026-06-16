// src/components/WeatherDashboardContent.tsx
"use client";

import { useState } from "react";
import WeatherChart from "./WeatherChart";
import { getWeatherIcon } from "@/lib/weather";
import { Calendar, Droplets, Wind, Sun, Navigation, ChevronDown, ChevronUp } from "lucide-react";

const getDynamicHourlyData = (daily: any, hourly: any, index: number, textColor: string) => {
  const windDirections = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const dailyTime = daily.time[index];
  const daytimeHourly = [];

  for (let h = 0; h < hourly.time.length; h++) {
    if (hourly.time[h].startsWith(dailyTime) && hourly.is_day[h] === 1) {
      daytimeHourly.push({
        code: hourly.weather_code[h],
        precip: hourly.precipitation[h],
      });
    }
  }

  let codeDominant = daily.weather_code[index];
  if (daytimeHourly.length > 0) {
    const storm = daytimeHourly.some(h => [95, 96, 99].includes(h.code));
    const rain = daytimeHourly.filter(h => [51,53,55,56,57,61,63,65,66,67,80,81,82].includes(h.code));

    if (storm) {
      codeDominant = 95;
    } else if (rain.length >= 2) {
      codeDominant = rain.length >= 5 ? 65 : 61;
    } else {
      const counts = daytimeHourly.reduce((acc, h) => {
        acc[h.code] = (acc[h.code] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      let maxCount = 0;
      for (const code in counts) {
        if (counts[code] > maxCount) {
          maxCount = counts[code];
          codeDominant = parseInt(code);
        }
      }
    }
  }

  // CORRECTION : let permet la réassignation
  let windDegree = daily.wind_direction_10m_dominant[index];
  const windDirIndex = Math.round(((windDegree %= 360) < 0 ? windDegree + 360 : windDegree) / 45) % 8;

  return {
    codeDominant,
    windLabel: windDirections[windDirIndex],
    windRotate: windDegree,
  };
};

const getTempColor = (temp: number) => {
  const stops = [
    { t: -10, c: [59, 130, 246] }, { t: 0, c: [59, 130, 246] },
    { t: 10, c: [45, 212, 191] }, { t: 20, c: [250, 204, 21] },
    { t: 30, c: [249, 115, 22] }, { t: 35, c: [239, 68, 68] },
    { t: 40, c: [168, 85, 247] }, { t: 50, c: [168, 85, 247] }
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

// === NOUVEAU : Props isDay ajoutée ===
export default function WeatherDashboardContent({ daily, hourly, isDay }: { daily: any; hourly: any, isDay: boolean }) {
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
      pollen: hourly.grass_pollen ? hourly.grass_pollen[index] : 0,
      dateFull: new Date(time).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit" }),
      hour: new Date(time).getHours()
    };
  });

  const dailyRows = daily.time.slice(0, daysCount);

  // === CLASSES DYNAMIQUES (Contenu central) ===
  const textMuted = isDay ? "text-slate-600" : "text-slate-400";
  const borderCol = isDay ? "border-slate-300/60" : "border-slate-700/50";
  const bgCard = isDay ? "bg-white" : "bg-[#1B263B]";
  const bgRowToday = isDay ? "bg-slate-100/70 border-slate-300/80 shadow-inner" : "bg-[#0D1B2A]/80 border-slate-700/50 shadow-md";
  const bgRow = isDay ? "bg-white hover:bg-slate-50" : "bg-[#0D1B2A]/40 border-slate-700/50 hover:bg-[#0D1B2A]/70";
  const bgToggle = isDay ? "bg-slate-100 border-slate-300" : "bg-[#0D1B2A] border-slate-700";
  const textTable = isDay ? "text-slate-800" : "text-slate-300";

  return (
    <section className="lg:col-span-2 flex flex-col gap-6 w-full">
      
      {/* SÉLECTEUR DE PÉRIODE (Dynamique) */}
      <div className={`${bgCard} p-4 rounded-3xl border ${borderCol} shadow-xl flex justify-between items-center transition-colors duration-1000`}>
        <span className={`text-sm font-medium ${textMuted}`}>Période d'analyse :</span>
        <div className={`flex ${bgToggle} p-1 rounded-xl border text-xs font-semibold`}>
          {[3, 7, 15].map((days) => (
            <button
              key={days}
              onClick={() => setDaysCount(days)}
              className={`px-4 py-2 rounded-lg transition-colors ${daysCount === days ? "bg-[#38BDF8] text-white" : `${textMuted} hover:text-[#38BDF8]`}`}
            >
              {days} Jours
            </button>
          ))}
        </div>
      </div>

      {/* LISTE DES PRÉVISIONS JOURNALIÈRES (Dynamique) */}
      <div className={`${bgCard} p-6 rounded-3xl shadow-xl border ${borderCol} transition-colors duration-1000`}>
        <h3 className={`text-sm font-bold uppercase ${textMuted} tracking-wider mb-4 flex items-center gap-2`}>
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
            
            // Calcul dynamique de l'icône dominante et du vent
            const { codeDominant, windLabel, windRotate } = getDynamicHourlyData(daily, hourly, index, textTable);

            return (
              <div 
                key={time} 
                className={`flex flex-col p-4 rounded-2xl border transition-colors ${isToday ? bgRowToday : bgRow}`}
              >
                <div className="flex flex-col md:flex-row md:items-center w-full gap-4 md:gap-0">
                  
                  {/* DATE & ICÔNE */}
                  <div className="flex items-center gap-4 md:w-[220px] shrink-0">
                    <div className={`w-12 h-12 flex items-center justify-center ${isDay ? 'bg-slate-200/50' : 'bg-[#1B263B]'} rounded-xl border ${borderCol} shadow-inner text-2xl shrink-0`}>
                      {getWeatherIcon(codeDominant, 1)}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-bold capitalize truncate text-sm md:text-base ${isToday ? textTable : isDay ? 'text-slate-800' : 'text-slate-100'}`}>
                        {isToday ? "Aujourd'hui" : date.toLocaleDateString("fr-FR", { weekday: "long" })}
                      </p>
                      <p className={`text-xs ${textMuted}`}>{date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</p>
                    </div>
                  </div>

                  {/* TEMPÉRATURES */}
                  <div className="flex items-center gap-2 md:w-[120px] shrink-0">
                    <span className="font-bold text-2xl drop-shadow-sm" style={{ color: getTempColor(dayMax) }}>{Math.round(dayMax)}°</span>
                    <span className="text-slate-500 text-lg">/</span>
                    <span className="font-semibold text-lg drop-shadow-sm" style={{ color: getTempColor(dayMin) }}>{Math.round(dayMin)}°</span>
                  </div>

                  {/* STATISTIQUES */}
                  <div className={`grid grid-cols-3 gap-2 md:flex md:items-start md:gap-0 shrink-0 text-xs font-medium ${textTable}`}>
                    <div className="flex flex-col md:w-[100px]">
                      <div className="flex items-center gap-1.5 text-[#38BDF8]">
                        <Droplets size={14} className="shrink-0" /> <span className="truncate">{daily.precipitation_sum[index]} mm</span>
                      </div>
                      <div className="h-[16px] flex items-center mt-0.5">
                        {daily.precipitation_probability_max[index] > 0 && (
                          <span className={`text-[10px] ml-5 truncate ${textMuted}`}>{daily.precipitation_probability_max[index]}% de risque</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:w-[100px]">
                      <div className="flex items-center gap-1.5">
                        <Wind size={14} className="text-violet-400 shrink-0" />
                        <span className="font-mono truncate">{Math.round(daily.wind_speed_10m_max[index])} km/h</span>
                      </div>
                      <div className="h-[16px] flex items-center gap-1 text-[10px] ml-5 mt-0.5">
                        <Navigation size={10} style={{ transform: `rotate(${windRotate}deg)` }} className={`${textMuted} shrink-0`} />
                        <span className={`truncate ${textMuted}`}>{windLabel}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 md:w-[80px]">
                      <Sun size={14} className="text-[#FBBF24] shrink-0" />
                      <span className="font-mono truncate">UV {Math.round(daily.uv_index_max[index])}</span>
                    </div>
                  </div>

                  {/* BOUTON */}
                  <div className="mt-2 md:mt-0 md:flex-grow flex md:justify-end shrink-0">
                    <button 
                      onClick={() => setExpandedDay(isExpanded ? null : time)}
                      className={`flex items-center justify-center w-full md:w-auto gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isExpanded ? "bg-[#38BDF8]/20 text-[#38BDF8]" : `${isDay ? 'bg-slate-200 hover:bg-slate-300' : 'bg-slate-800 hover:bg-slate-700'} ${textMuted}`}`}
                    >
                      {isExpanded ? "Fermer" : "Voir +"}
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* ACCORDÉON (Détail Heure par Heure) */}
                {isExpanded && (
                  <div className={`mt-4 pt-4 border-t ${borderCol} animate-in slide-in-from-top-2 duration-300`}>
                    <p className={`text-xs font-bold ${textMuted} mb-3 ml-1 uppercase tracking-wider`}>Évolution de la journée</p>
                    <div className="flex gap-2 overflow-x-auto pb-3">
                      {hourly.time.map((hTime: string, hIndex: number) => {
                        if (!hTime.startsWith(daily.time[index])) return null;
                        const hDate = new Date(hTime);
                        
                        return (
                          <div key={hTime} className={`flex flex-col items-center justify-between gap-1 min-w-[56px] p-2 rounded-xl border ${isDay ? 'bg-slate-100 hover:bg-white border-slate-300/80' : 'bg-[#0D1B2A]/50 border-slate-700/50 hover:bg-[#0D1B2A]'} transition-colors`}>
                            <span className={`text-[11px] font-medium ${textMuted}`}>{hDate.getHours()}h</span>
                            <span className="text-2xl my-1">{getWeatherIcon(hourly.weather_code[hIndex], hourly.is_day[hIndex])}</span>
                            <span className={`text-sm font-bold ${isDay ? 'text-slate-800' : 'text-slate-100'}`} style={{ color: getTempColor(hourly.temperature_2m[hIndex]) }}>{Math.round(hourly.temperature_2m[hIndex])}°</span>
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

      {/* GRAPHIQUE (Dynamique avec isDay) */}
      <div className="w-full">
        {/* On passe isDay pour que le graphique ajuste ses couleurs de grilles/tooltips */}
        <WeatherChart data={chartData} daysCount={daysCount} isDay={isDay} />
      </div>
    </section>
  );
}
