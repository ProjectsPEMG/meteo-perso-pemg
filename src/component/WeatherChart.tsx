// src/component/WeatherChart.tsx
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function WeatherChart({ data, isDay }: { data: any, isDay: boolean }) {
  const textColor = isDay ? "#475569" : "#94a3b8";
  const gridColor = isDay ? "#e2e8f0" : "#334155";

  return (
    <div className={`w-full h-[400px] p-6 rounded-3xl border ${isDay ? 'bg-white border-slate-300' : 'bg-[#1B263B] border-slate-700'}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="uniqueTime" tickFormatter={(t) => new Date(t).getHours() + "h"} stroke={textColor} />
          <YAxis stroke={textColor} />
          <Tooltip contentStyle={{ backgroundColor: isDay ? '#fff' : '#0D1B2A', borderColor: gridColor }} />
          <Legend />
          <Line type="monotone" dataKey="temp" stroke="#f97316" name="Temp (°C)" strokeWidth={2} />
          <Line type="monotone" dataKey="rainQty" stroke="#38BDF8" name="Pluie (mm)" strokeWidth={2} />
          <Line type="monotone" dataKey="wind" stroke="#a78bfa" name="Vent (km/h)" strokeWidth={2} />
          <Line type="monotone" dataKey="pm2_5" stroke="#94a3b8" name="Air (PM2.5)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
