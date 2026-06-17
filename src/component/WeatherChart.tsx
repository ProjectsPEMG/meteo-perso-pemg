// src/components/WeatherChart.tsx
"use client";

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Line, ReferenceLine } from 'recharts';

export default function WeatherChart({ data, daysCount, isDayTheme = false }: { data: any[], daysCount: number, isDayTheme?: boolean }) {
  const [activeTab, setActiveTab] = useState<'temp' | 'rain' | 'aq' | 'wind'>('temp');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // === VARIABLES DE THÈME DYNAMIQUE ===
  const themeCardBg = isDayTheme ? "bg-white/70" : "bg-[#1B263B]";
  const themeBorder = isDayTheme ? "border-slate-200" : "border-slate-700";
  const themeText = isDayTheme ? "text-slate-800" : "text-slate-300";
  const themeTextMuted = isDayTheme ? "text-slate-500" : "text-slate-400";
  const themeToggleBg = isDayTheme ? "bg-white" : "bg-[#0D1B2A]";
  const themeTooltipBg = isDayTheme ? "bg-white" : "bg-[#0D1B2A]";
  const themeTooltipBorder = isDayTheme ? "border-slate-200" : "border-slate-700";
  
  // Couleurs de la grille et des axes
  const gridColor = isDayTheme ? "#E2E8F0" : "#334155";
  const axisColor = isDayTheme ? "#64748B" : "#64748B";

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`${themeTooltipBg} p-3 border ${themeTooltipBorder} rounded-lg shadow-xl font-sans z-50 transition-colors`}>
          <p className={`${themeTextMuted} text-xs mb-1`}>{payload[0].payload.dateFull}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-bold">
              {entry.name}: {Math.round(entry.value)} {entry.unit}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const midnightIndexes = data.reduce((acc: number[], curr, index) => {
    if (curr.hour === 0) acc.push(index);
    return acc;
  }, []);

  const isLongPeriod = daysCount > 3;

  return (
    <div className={`w-full ${themeCardBg} backdrop-blur-sm p-5 rounded-3xl shadow-lg border ${themeBorder} flex flex-col h-[400px] transition-colors duration-1000`}>
      
      <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
        <h3 className={`${themeText} font-semibold text-sm transition-colors`}>Analyses Graphiques Dynamiques</h3>
        <div className={`flex flex-wrap ${themeToggleBg} p-1 rounded-xl border ${themeBorder} text-xs font-medium transition-colors`}>
          <button onClick={() => setActiveTab('temp')} className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'temp' ? 'bg-[#F97316] text-white shadow-sm' : `${themeTextMuted} hover:opacity-70`}`}>
            Température
          </button>
          <button onClick={() => setActiveTab('rain')} className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'rain' ? 'bg-[#38BDF8] text-white shadow-sm' : `${themeTextMuted} hover:opacity-70`}`}>
            Pluie & Humidité
          </button>
          <button onClick={() => setActiveTab('wind')} className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'wind' ? 'bg-[#A78BFA] text-white shadow-sm' : `${themeTextMuted} hover:opacity-70`}`}>
            Vent & Rafales
          </button>
          <button onClick={() => setActiveTab('aq')} className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'aq' ? 'bg-[#34D399] text-white shadow-sm' : `${themeTextMuted} hover:opacity-70`}`}>
            Pollution & Pollen
          </button>
        </div>
      </div>

      <div className="flex-grow w-full min-h-0">
        {isMounted && (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <ComposedChart data={data} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
              <XAxis 
                dataKey="uniqueTime" 
                stroke={axisColor} 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                interval={isLongPeriod ? 23 : 5}
                tickFormatter={(val) => {
                  const date = new Date(val);
                  return isLongPeriod 
                    ? date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
                    : date.getHours() + 'h';
                }}
              />
              <YAxis stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} />
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <Tooltip content={<CustomTooltip />} />
              
              {midnightIndexes.map((index) => (
                 <ReferenceLine key={`mid-${index}`} x={data[index].uniqueTime} stroke={axisColor} strokeDasharray="4 4" />
              ))}

              {activeTab === 'temp' && [
                <ReferenceLine key="ref-t1" y={0} stroke="#38BDF8" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Gel (0°C)', fill: '#38BDF8', fontSize: 11 }} />,
                <ReferenceLine key="ref-t2" y={35} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'insideBottomLeft', value: 'Canicule (35°C)', fill: '#EF4444', fontSize: 11 }} />,
                <Area key="a-temp" type="monotone" dataKey="temp" name="Température" unit="°C" stroke="#F97316" strokeWidth={3} fillOpacity={0.15} fill="#F97316" />
              ]}

              {activeTab === 'rain' && [
                <ReferenceLine key="ref-r1" y={10} stroke="#818CF8" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Forte averse (10mm)', fill: '#818CF8', fontSize: 11 }} />,
                <Bar key="b-rain" dataKey="rainQty" name="Précipitations" unit="mm" fill="#38BDF8" radius={[3, 3, 0, 0]} maxBarSize={12} />,
                <Line key="l-prob" type="monotone" dataKey="rainProb" name="Probabilité Pluie" unit="%" stroke="#818CF8" strokeWidth={2} dot={false} />
              ]}

              {activeTab === 'wind' && [
                <ReferenceLine key="ref-w1" y={50} stroke="#FBBF24" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Vigilance (50 km/h)', fill: '#FBBF24', fontSize: 11 }} />,
                <ReferenceLine key="ref-w2" y={80} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Tempête (80 km/h)', fill: '#EF4444', fontSize: 11 }} />,
                <Area key="a-wind" type="monotone" dataKey="wind" name="Vent moyen" unit="km/h" stroke="#A78BFA" strokeWidth={3} fillOpacity={0.2} fill="#A78BFA" />,
                <Line key="l-gusts" type="monotone" dataKey="gusts" name="Rafales" unit="km/h" stroke="#C084FC" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              ]}

              {activeTab === 'aq' && [
                <ReferenceLine key="ref-aq1" y={25} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Mauvaise Qualité Air (>25µg)', fill: '#EF4444', fontSize: 11 }} />,
                <ReferenceLine key="ref-aq2" y={50} stroke="#FBBF24" strokeDasharray="3 3" label={{ position: 'insideBottomLeft', value: 'Pollen Élevé', fill: '#FBBF24', fontSize: 11 }} />,
                <Bar key="b-pm2" dataKey="pm2_5" name="Particules PM2.5" unit="µg/m³" fill="#F87171" radius={[3, 3, 0, 0]} maxBarSize={10} />,
                <Line key="l-pol" type="monotone" dataKey="pollen" name="Pollen Graminées" unit="grains/m³" stroke="#34D399" strokeWidth={2} dot={false} />
              ]}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
