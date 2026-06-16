// src/component/WeatherChart.tsx
"use client";

import { useState } from "react";
import { ComposedChart, Area, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeatherChart({ data, daysCount, isDay = false }: { data: any, daysCount: number, isDay?: boolean }) {
  // Liste étendue des vues
  const [view, setView] = useState<'all' | 'temp' | 'rain' | 'wind' | 'air'>('all');

  const gridColor = isDay ? "#e2e8f0" : "#334155";
  const textColor = isDay ? "#64748b" : "#94a3b8";
  const tooltipBg = isDay ? "rgba(255, 255, 255, 0.95)" : "rgba(15, 23, 42, 0.95)";
  const tooltipBorder = isDay ? "#cbd5e1" : "#334155";
  const tooltipText = isDay ? "#0f172a" : "#f8fafc";

  const formatXAxis = (tickItem: any) => {
    const date = new Date(tickItem);
    return `${date.getHours()}h`;
  };

  return (
    <div className={`w-full h-[400px] p-4 rounded-3xl border ${isDay ? 'bg-white border-slate-300' : 'bg-[#1B263B] border-slate-700'} shadow-xl transition-colors duration-1000`}>
      
      {/* Sélecteur étendu */}
      <div className="flex gap-2 mb-4 justify-end flex-wrap">
        {(['all', 'temp', 'rain', 'wind', 'air'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors ${
              view === v ? "bg-[#38BDF8] text-white" : isDay ? "bg-slate-200 text-slate-600" : "bg-slate-800 text-slate-400"
            }`}
          >
            {v === 'all' ? 'Complet' : v === 'temp' ? 'Temp°' : v === 'rain' ? 'Pluie' : v === 'wind' ? 'Vent' : 'Air'}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis dataKey="uniqueTime" tickFormatter={formatXAxis} stroke={textColor} tick={{fontSize: 10}} />
          
          {/* Axes dynamiques */}
          <YAxis yAxisId="left" stroke={textColor} tick={{fontSize: 10}} />
          <YAxis yAxisId="right" orientation="right" stroke="#38BDF8" tick={{fontSize: 10}} />
          
          <Tooltip 
            contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderRadius: '0.75rem', fontSize: '12px' }}
          />
          
          {/* SÉRIES DE DONNÉES */}
          
          {/* Température */}
          {(view === 'all' || view === 'temp') && (
            <Area yAxisId="left" type="monotone" dataKey="temp" stroke="#f97316" fill="#f97316" fillOpacity={0.2} name="Température" />
          )}
          
          {/* Pluie */}
          {(view === 'all' || view === 'rain') && (
            <Bar yAxisId="right" dataKey="rainQty" fill="#38BDF8" name="Pluie (mm)" />
          )}
          
          {/* Vent */}
          {(view === 'all' || view === 'wind') && (
            <Line yAxisId="left" type="monotone" dataKey="wind" stroke="#a78bfa" strokeWidth={2} dot={false} name="Vent (km/h)" />
          )}
          
          {/* Pollution/Air */}
          {(view === 'all' || view === 'air') && (
            <Area yAxisId="right" type="step" dataKey="pm2_5" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} name="Particules (PM2.5)" />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
