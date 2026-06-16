// src/component/WeatherChart.tsx
"use client";

import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeatherChart({ data, daysCount, isDay = false }: { data: any, daysCount: number, isDay?: boolean }) {
  // Variables CSS adaptées au thème pour Recharts
  const gridColor = isDay ? "#e2e8f0" : "#334155";
  const textColor = isDay ? "#64748b" : "#94a3b8";
  const tooltipBg = isDay ? "rgba(255, 255, 255, 0.95)" : "rgba(15, 23, 42, 0.95)";
  const tooltipBorder = isDay ? "#cbd5e1" : "#334155";
  const tooltipText = isDay ? "#0f172a" : "#f8fafc";

  // Formatage de l'axe X pour afficher "14h"
  const formatXAxis = (tickItem: any) => {
    const date = new Date(tickItem);
    return `${date.getHours()}h`;
  };

  return (
    <div className={`w-full h-[300px] md:h-[400px] p-4 rounded-3xl border ${isDay ? 'bg-white border-slate-300' : 'bg-[#1B263B] border-slate-700'} shadow-xl transition-colors duration-1000`}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          
          <XAxis 
            dataKey="uniqueTime" 
            tickFormatter={formatXAxis} 
            stroke={textColor} 
            tick={{fontSize: 12}} 
            tickMargin={10} 
            minTickGap={20} 
          />
          <YAxis 
            yAxisId="left" 
            stroke={textColor} 
            tick={{fontSize: 12}} 
            unit="°" 
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#38BDF8" 
            tick={{fontSize: 12}} 
            unit="mm" 
          />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: tooltipBg, 
              borderColor: tooltipBorder, 
              color: tooltipText, 
              borderRadius: '0.75rem', 
              fontSize: '12px' 
            }}
            labelFormatter={(label) => new Date(label).toLocaleString('fr-FR', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
          />
          
          {/* Précipitations (Barres bleues) */}
          <Bar yAxisId="right" dataKey="rainQty" fill="#38BDF8" name="Pluie" radius={[4, 4, 0, 0]} maxBarSize={20} />
          
          {/* Températures (Ligne et gradient orange) */}
          <Area yAxisId="left" type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" name="Température" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
