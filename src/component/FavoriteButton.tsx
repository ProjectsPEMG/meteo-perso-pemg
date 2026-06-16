// src/component/FavoriteButton.tsx
"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

export default function FavoriteButton({ cityName, lat, lon }: { cityName: string; lat: number; lon: number }) {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("weather_favorites");
    if (saved) {
      const parsed = JSON.parse(saved);
      setIsFav(parsed.some((f: any) => f.name === cityName));
    }
  }, [cityName]);

  const toggleFavorite = () => {
    const saved = localStorage.getItem("weather_favorites");
    let parsed = saved ? JSON.parse(saved) : [];
    
    if (isFav) {
      parsed = parsed.filter((f: any) => f.name !== cityName);
    } else {
      parsed.push({ name: cityName, lat, lon });
    }
    
    localStorage.setItem("weather_favorites", JSON.stringify(parsed));
    setIsFav(!isFav);
    window.dispatchEvent(new Event("favorites_updated"));
  };

  return (
    <button 
      onClick={toggleFavorite}
      className="p-1.5 rounded-full hover:bg-slate-500/20 transition-colors"
      title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Star size={24} className={isFav ? "text-[#FBBF24] fill-[#FBBF24] drop-shadow-sm" : "text-slate-400/80"} />
    </button>
  );
}
