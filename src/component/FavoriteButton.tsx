// src/components/FavoriteButton.tsx
"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface City {
  name: string;
  lat: number;
  lon: number;
}

export default function FavoriteButton({ cityName, lat, lon }: { cityName: string; lat: number; lon: number }) {
  const [isFavorite, setIsFavorite] = useState(false);

  // Charger les favoris au démarrage
  useEffect(() => {
    const saved = localStorage.getItem("weather_favorites");
    if (saved) {
      const favorites: City[] = JSON.parse(saved);
      const exists = favorites.some(f => f.name.toLowerCase() === cityName.toLowerCase());
      setIsFavorite(exists);
    }
  }, [cityName]);

  const toggleFavorite = () => {
    const saved = localStorage.getItem("weather_favorites");
    let favorites: City[] = saved ? JSON.parse(saved) : [];

    if (isFavorite) {
      // Retirer des favoris
      favorites = favorites.filter(f => f.name.toLowerCase() !== cityName.toLowerCase());
    } else {
      // Ajouter aux favoris
      favorites.push({ name: cityName, lat, lon });
    }

    localStorage.setItem("weather_favorites", JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
    
    // Déclenche un événement pour avertir le Header qu'il faut se mettre à jour
    window.dispatchEvent(new Event("favorites_updated"));
  };

  return (
    <button onClick={toggleFavorite} className="focus:outline-none transition-transform active:scale-95">
      <Star 
        size={24} 
        className={`transition-colors ${isFavorite ? "text-[#FBBF24] fill-[#FBBF24]" : "text-slate-400 hover:text-[#FBBF24]"}`} 
      />
    </button>
  );
}