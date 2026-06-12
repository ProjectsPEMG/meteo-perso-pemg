// src/components/FavoritesDropdown.tsx
"use client";

import { useState, useEffect } from "react";
import { Star, MapPin, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface City {
  name: string;
  lat: number;
  lon: number;
}

export default function FavoritesDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [favorites, setFavorites] = useState<City[]>([]);
  const router = useRouter();

  const loadFavorites = () => {
    const saved = localStorage.getItem("weather_favorites");
    if (saved) setFavorites(JSON.parse(saved));
  };

  useEffect(() => {
    loadFavorites();
    // Écoute si l'utilisateur ajoute un favori depuis la page pour actualiser le menu
    window.addEventListener("favorites_updated", loadFavorites);
    return () => window.removeEventListener("favorites_updated", loadFavorites);
  }, []);

  const handleSelect = (city: City) => {
    setIsOpen(false);
    router.push(`/?lat=${city.lat}&lon=${city.lon}&city=${city.name}`);
  };

  const deleteFavorite = (e: React.MouseEvent, name: string) => {
    e.stopPropagation(); // Empêche de cliquer sur la ville en voulant la supprimer
    const updated = favorites.filter(f => f.name !== name);
    localStorage.setItem("weather_favorites", JSON.stringify(updated));
    setFavorites(updated);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition relative ${isOpen ? 'bg-slate-700' : 'bg-[#1B263B] hover:bg-slate-700'}`}
      >
        <Star size={20} className="text-[#FBBF24] fill-[#FBBF24]" />
        {favorites.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#38BDF8] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
            {favorites.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-64 bg-[#1B263B] border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-2 border-b border-slate-700/50 bg-[#0D1B2A]/50">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Villes Favorites</p>
          </div>
          
          {favorites.length === 0 ? (
            <p className="text-xs text-slate-400 p-4 text-center">Aucune ville en favori</p>
          ) : (
            <ul className="divide-y divide-slate-700/50 max-h-60 overflow-y-auto">
              {favorites.map((city) => (
                <li 
                  key={city.name}
                  onClick={() => handleSelect(city)}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-800 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin size={14} className="text-[#38BDF8] shrink-0" />
                    <span className="text-sm font-medium text-slate-200 truncate">{city.name}</span>
                  </div>
                  <button 
                    onClick={(e) => deleteFavorite(e, city.name)}
                    className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}