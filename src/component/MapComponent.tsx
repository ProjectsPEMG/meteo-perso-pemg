// src/components/MapComponent.tsx
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getWeatherIcon } from "@/lib/weather";
import { Wind, Droplets, Sun, Umbrella } from "lucide-react";

interface CityData {
  name: string;
  lat: number;
  lon: number;
  temp: number;
  code: number;
  humidity: number;
  wind: number;
  uv: number;
  rain: number; // NOUVEAU
}

export default function MapComponent() {
  const [cities, setCities] = useState<CityData[]>([]);

  useEffect(() => {
    const loadCityWeather = async () => {
      const saved = localStorage.getItem("weather_favorites");
      if (!saved) return;
      
      const favorites = JSON.parse(saved);
      
      const cityDataPromises = favorites.map(async (city: any) => {
        try {
          // Ajout de "precipitation" à la fin de la ligne current=
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,precipitation&daily=uv_index_max&timezone=auto&forecast_days=1`);
          const data = await res.json();
          
          return {
            name: city.name,
            lat: city.lat,
            lon: city.lon,
            temp: data.current.temperature_2m,
            code: data.current.weather_code,
            humidity: data.current.relative_humidity_2m,
            wind: data.current.wind_speed_10m,
            rain: data.current.precipitation, // NOUVEAU
            uv: data.daily.uv_index_max[0] || 0
          };
        } catch (e) {
          console.error("Erreur météo pour la ville :", city.name);
          return null;
        }
      });

      const results = await Promise.all(cityDataPromises);
      setCities(results.filter(c => c !== null) as CityData[]);
    };

    loadCityWeather();
  }, []);

  const getMarkerColor = (code: number) => {
    if (code <= 2) return "#FBBF24"; 
    if (code === 3 || (code >= 45 && code <= 48)) return "#94A3B8"; 
    if (code >= 51 && code <= 67) return "#38BDF8"; 
    if (code >= 71 && code <= 77) return "#FFFFFF"; 
    if (code >= 95) return "#EF4444"; 
    return "#34D399";
  };

  return (
    <div className="h-[600px] w-full rounded-3xl overflow-hidden border border-slate-700 shadow-xl z-0 relative">
      <MapContainer center={[46.6, 2.5]} zoom={6} className="h-full w-full bg-[#0D1B2A]" zoomControl={false}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OSM contributors'
        />
        
        {cities.map((city, idx) => (
          <CircleMarker
            key={idx}
            center={[city.lat, city.lon]}
            radius={9}
            fillColor={getMarkerColor(city.code)}
            color={getMarkerColor(city.code)}
            weight={2}
            opacity={0.8}
            fillOpacity={0.8}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <div className="p-2 font-sans bg-[#0D1B2A] text-slate-100 rounded-xl min-w-[145px]">
                <p className="font-bold text-center text-sm border-b border-slate-700 pb-1.5 mb-2 text-white">{city.name}</p>
                
                <div className="flex items-center justify-center gap-2 text-xl font-bold mb-3 text-white">
                  {getWeatherIcon(city.code)} <span>{Math.round(city.temp)}°C</span>
                </div>

                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1"><Wind size={12} className="text-violet-400"/> Vent</span>
                    <span className="font-mono font-semibold">{Math.round(city.wind)} km/h</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1"><Umbrella size={12} className="text-indigo-400"/> Pluie</span>
                    <span className="font-mono font-semibold">{city.rain} mm</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1"><Droplets size={12} className="text-[#38BDF8]"/> Humidité</span>
                    <span className="font-mono font-semibold">{city.humidity}%</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1"><Sun size={12} className="text-[#FBBF24]"/> Indice UV</span>
                    <span className="font-mono font-semibold">{city.uv}</span>
                  </div>
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}