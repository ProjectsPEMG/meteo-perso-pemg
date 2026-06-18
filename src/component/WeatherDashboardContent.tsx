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

// === Fonction pour colorer dynamiquement la ligne selon la météo ===
const getRowTheme = (code: number, isDayTheme: boolean, isToday: boolean) => {
  let bg = "";
  let border = isDayTheme ? "border-slate-200" : "border-slate-700/50";
  
  const isSun = code === 0 || code === 1;
  const isCloud = code === 2 || code === 3 || code === 45 || code === 48;
  const isRain = [51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code);
  const isSnow = [71,73,75,77,85,86].includes(code);
  const isStorm = [95,96,99].includes(code);

  if (isDayTheme) {
    if (isSun) bg = "bg-orange-50/60 hover:bg-orange-100/80";
    else if (isCloud) bg = "bg-slate-50/80 hover:bg-slate-100";
    else if (isRain) bg = "bg-sky-100/50 hover:bg-sky-100/80";
    else if (isSnow) bg = "bg-indigo-50/80 hover:bg-indigo-100";
    else if (isStorm) bg = "bg-purple-100/50 hover:bg-purple-100/80";
    else bg = "bg-white hover:bg-slate-50";
    
    if (isToday) border = "border-[#38BDF8]/60 shadow-sm";
  } else {
    if (isSun) bg = "bg-[#0D1B2A]/40 hover:bg-[#0D1B2A]/70";
    else if (isCloud) bg = "bg-slate-800/20 hover:bg-slate-800/40";
    else if (isRain) bg = "bg-sky-900/20 hover:bg-sky-900/40";
    else if (isSnow) bg = "bg-indigo-900/20 hover:bg-indigo-900/40";
    else if (isStorm) bg = "bg-purple-900/20 hover:bg-purple-900/40";
    else bg = "bg-[#0D1B2A]/40 hover:bg-[#0D1B2A]/70";

    if (isToday) {
       border = "border-[#38BDF8]/50 shadow-md";
       // On rend le fond de "Aujourd'hui" un tout petit peu plus visible la nuit
       bg = bg.replace('/20', '/40').replace('/40', '/60'); 
    }
  }
  
  return `${bg} ${border}`;
};

export default function WeatherDashboardContent({ daily, hourly, isDayTheme = false }: { daily: any; hourly: any; isDayTheme?: boolean }) {
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

  // Variables de thème
  const themeCardBg = isDayTheme ? "bg-white/70" : "bg-[#1B263B]";
  const themeBorder = isDayTheme ? "border-slate-200" : "border-slate-700";
  const themeTextMuted = isDayTheme ? "text-slate-500" : "text-slate-400";
  const themeToggleBg = isDayTheme ? "bg-white" : "bg-[#0D1B2A]";

  return (
    <section className="lg:col-span-2 flex flex-col gap-6 w-full">
      
      {/* SÉLECTEUR DE PÉRIODE */}
      <div className={`${themeCardBg} backdrop-blur-sm p-4 rounded-3xl border ${themeBorder} shadow-lg flex justify-between items-center transition-colors duration-1000`}>
        <span className={`text-sm font-medium ${themeTextMuted}`}>Période d'analyse :</span>
        <div className={`flex ${themeToggleBg} p-1 rounded-xl border ${themeBorder} text-xs font-semibold`}>
          {[3, 7, 15].map((days) => (
            <button
              key={days}
              onClick={() => setDaysCount(days)}
              className={`px-4 py-2 rounded-lg transition-colors ${daysCount === days ? "bg-[#38BDF8] text-white shadow-sm" : `${themeTextMuted} hover:opacity-70`}`}
            >
              {days} Jours
            </button>
          ))}
        </div>
      </div>

      {/* LISTE DES PRÉVISIONS JOURNALIÈRES */}
      <div className={`${themeCardBg} backdrop-blur-sm p-4 md:p-6 rounded-3xl shadow-lg border ${themeBorder} transition-colors duration-1000`}>
        <h3 className={`text-sm font-bold uppercase ${themeTextMuted} tracking-wider mb-4 flex items-center gap-2`}>
          <Calendar size={16} className="text-[#38BDF8]" />
          Prévisions détaillées
        </h3>
        
        <div className="flex flex-col gap-2 md:gap-3">
          {dailyRows.map((time: string, index: number) => {
            const date = new Date(time);
            const isToday = index === 0;
            const isExpanded = expandedDay === time;

            const dayMin = daily.temperature_2m_min[index];
            const dayMax = daily.temperature_2m_max[index];

            // === ALGORITHME D'IMPACT DE LA MÉTÉO ===
            const datePrefix = time.split('T')[0];
            const daytimeCodes: number[] = [];
            
            hourly.time.forEach((hTime: string, hIndex: number) => {
              if (hTime.startsWith(datePrefix) && hourly.is_day && hourly.is_day[hIndex] === 1) {
                daytimeCodes.push(hourly.weather_code[hIndex]);
              }
            });

            let representativeCode = daily.weather_code[index];
            
            if (daytimeCodes.length > 0) {
              const counts: Record<number, number> = {};
              let maxCount = 0;
              let mostFrequentCode = daytimeCodes[0];
              let badWeatherCount = 0;
              let worstCode = daytimeCodes[0];
              let worstSeverity = -1;

              const getSeverity = (c: number) => {
                if ([95, 96, 99].includes(c)) return 4;
                if ([71, 73, 75, 77, 85, 86].includes(c)) return 3;
                if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(c)) return 2;
                return 0;
              };

              for (const code of daytimeCodes) {
                counts[code] = (counts[code] || 0) + 1;
                if (counts[code] > maxCount) {
                  maxCount = counts[code];
                  mostFrequentCode = code;
                }
                const severity = getSeverity(code);
                if (severity > 0) {
                  badWeatherCount++;
                  if (severity > worstSeverity) {
                    worstSeverity = severity;
                    worstCode = code;
                  }
                }
              }

              if (worstSeverity === 4 || badWeatherCount >= 2) {
                representativeCode = worstCode;
              } else if (badWeatherCount === 1 && mostFrequentCode <= 1) {
                representativeCode = 80;
              } else {
                representativeCode = mostFrequentCode;
              }
            }

            // Calcul du fond coloré de la ligne !
            const rowThemeClass = getRowTheme(representativeCode, isDayTheme, isToday);

            return (
              <div 
                key={time} 
                onClick={() => setExpandedDay(isExpanded ? null : time)}
                className={`flex flex-col p-3 md:p-4 rounded-2xl border transition-all cursor-pointer select-none ${rowThemeClass}`}
              >
                {/* === LIGNE COMPACTE (Bande unique) === */}
                <div className="flex items-center justify-between w-full gap-2">
                  
                  {/* ICON & DATE */}
                  <div className="flex items-center gap-3 w-[100px] md:w-[150px] shrink-0">
                    <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center ${themeToggleBg} rounded-xl border ${themeBorder} shadow-sm text-2xl shrink-0`}>
                      {getWeatherIcon(representativeCode, 1)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold capitalize truncate text-sm md:text-base leading-tight">
                        {isToday ? "Auj." : date.toLocaleDateString("fr-FR", { weekday: "short" })}.
                      </p>
                      <p className={`text-[10px] md:text-xs ${themeTextMuted} truncate hidden sm:block`}>
                        {date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>

                  {/* TEMPS (Min/Max) */}
                  <div className="flex items-center justify-center gap-1.5 w-[65px] md:w-[90px] shrink-0">
                    <span className="font-bold text-base md:text-xl drop-shadow-sm" style={{ color: getTempColor(dayMax) }}>
                      {Math.round(dayMax)}°
                    </span>
                    <span className={`text-[10px] md:text-xs ${themeTextMuted}`}>/</span>
                    <span className="font-semibold text-xs md:text-base opacity-80" style={{ color: getTempColor(dayMin) }}>
                      {Math.round(dayMin)}°
                    </span>
                  </div>

                  {/* STATS COMPACTES (Pluie & Vent) */}
                  <div className={`flex items-center justify-end gap-3 md:gap-6 flex-grow text-[10px] md:text-xs font-medium ${isDayTheme ? 'text-slate-700' : 'text-slate-300'}`}>
                    
                    {/* Pluie */}
                    <div className="flex items-center gap-1">
                      <Droplets size={14} className="text-[#38BDF8] shrink-0" /> 
                      <span className="hidden sm:inline">{daily.precipitation_sum[index]} mm</span>
                      <span className="sm:hidden">{daily.precipitation_probability_max[index]}%</span>
                    </div>
                    
                    {/* Vent */}
                    <div className="flex items-center gap-1">
                      <Wind size={14} className="text-violet-400 shrink-0" />
                      <span>{Math.round(daily.wind_speed_10m_max[index])} <span className="hidden sm:inline">km/h</span></span>
                    </div>
                  </div>

                  {/* CHEVRON INDICATEUR */}
                  <div className="flex items-center justify-center shrink-0 ml-1 md:ml-3">
                    <div className={`p-1.5 rounded-full transition-colors ${isExpanded ? "bg-[#38BDF8] text-white shadow-md" : `${themeToggleBg} ${themeTextMuted} border ${themeBorder}`}`}>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>
                </div>

                {/* === ACCORDÉON : DÉTAIL HEURE PAR HEURE === */}
                {isExpanded && (
                  <div 
                    className={`mt-4 pt-4 border-t ${themeBorder} animate-in slide-in-from-top-2 duration-300`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className={`text-xs font-bold ${themeTextMuted} mb-3 ml-1 uppercase tracking-wider`}>
                      Évolution de la journée - {date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-3 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                      {hourly.time.map((hTime: string, hIndex: number) => {
                        if (!hTime.startsWith(time.split('T')[0])) return null;
                        
                        const hDate = new Date(hTime);
                        const hWindDir = hourly.wind_direction_10m ? getWindDirection(hourly.wind_direction_10m[hIndex]) : { label: '-', rotate: 0 };
                        const hUV = hourly.uv_index ? Math.round(hourly.uv_index[hIndex]) : 0;
                        const hIsDay = hourly.is_day ? hourly.is_day[hIndex] : 1;
                        const hHum = hourly.relative_humidity_2m ? hourly.relative_humidity_2m[hIndex] : null;

                        return (
                          <div key={hTime} className={`flex flex-col items-center justify-start gap-1 min-w-[72px] p-2 rounded-xl transition-colors border ${isDayTheme ? 'bg-white/80 border-slate-200 hover:bg-white' : 'bg-[#0D1B2A]/50 border-slate-700/50 hover:bg-[#0D1B2A]'}`}>
                            
                            <span className={`text-[11px] font-medium ${themeTextMuted}`}>{hDate.getHours()}h</span>
                            
                            <span className="text-2xl my-1">{getWeatherIcon(hourly.weather_code[hIndex], hIsDay)}</span>
                            
                            <span className="text-sm font-bold" style={{ color: getTempColor(hourly.temperature_2m[hIndex]) }}>
                              {Math.round(hourly.temperature_2m[hIndex])}°
                            </span>
                            
                            <div className={`w-full h-px ${themeBorder} my-1`} />
                            
                            {/* NOUVEAU : EMPILEMENT PLUIE / RISQUE / HUMIDITÉ */}
                            <div className="flex flex-col items-center justify-center min-h-[40px] gap-0.5 w-full">
                              {hourly.precipitation[hIndex] > 0 ? (
                                <span className="text-[10px] text-[#38BDF8] font-bold leading-tight">{hourly.precipitation[hIndex]} mm</span>
                              ) : (
                                <Droplets size={10} className={`${themeTextMuted} opacity-50 mb-0.5`} />
                              )}
                              
                              <span className={`text-[9px] ${hourly.precipitation_probability[hIndex] > 0 ? 'text-[#38BDF8]' : themeTextMuted} font-medium leading-tight`}>
                                {hourly.precipitation_probability[hIndex]}% pl.
                              </span>

                              {hHum !== null && (
                                <span className={`text-[9px] ${themeTextMuted} leading-tight`}>{hHum}% hum.</span>
                              )}
                            </div>

                            <div className={`w-full h-px ${themeBorder} my-1`} />

                            <div className="flex flex-col items-center justify-center">
                              <span className="text-[10px] text-violet-400 font-mono">{Math.round(hourly.wind_speed_10m[hIndex])} <span className="text-[8px]">km/h</span></span>
                              <div className={`flex items-center gap-0.5 text-[9px] mt-0.5 ${themeTextMuted}`}>
                                <Navigation size={8} style={{ transform: `rotate(${hWindDir.rotate}deg)` }} />
                                <span>{hWindDir.label}</span>
                              </div>
                            </div>

                            {hUV > 0 && (
                              <>
                                <div className={`w-full h-px ${themeBorder} my-1`} />
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
        <WeatherChart data={chartData} daysCount={daysCount} isDayTheme={isDayTheme} />
      </div>
    </section>
  );
}
