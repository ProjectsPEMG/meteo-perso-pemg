// src/component/FavoritesDropdown.tsx
"use client";

import { useState, useEffect } from "react";
import { Star, MapPin, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface City {
  name: string;
  lat: number;
  lon: number;
}

// L'autorisation TypeScript est ici aussi !
export default function FavoritesDropdown({ isDay = false }: { isDay?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [favorites, setFavorites] = useState<City[]>([]);
  const router = useRouter();

  const loadFavorites = () => {
    const saved = localStorage.getItem("weather_favorites");
    if (saved) {
      const parsedFavorites = JSON.parse(saved);
      const validFavorites = parsedFavorites.filter((f: any) => f && f.name && f.name.trim() !== "");
      setFavorites(validFavorites);
    }
  };

  useEffect(() => {
    loadFavorites();
    window.addEventListener("favorites_updated", loadFavorites);
    return () => window.removeEventListener("favorites_updated", loadFavorites);
  }, []);

  const handleSelect = (city: City) => {
    setIsOpen(false);
    router.push(`/?lat=${city.lat}&lon=${city.lon}&city=${city?.name || "Inconnu"}`);
  };

  const deleteFavorite = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    const updated = favorites.filter(f => f?.name !== name);
    localStorage.setItem("weather_favorites", JSON.stringify(updated));
    setFavorites(updated);
    window.dispatchEvent(new Event("favorites_updated"));
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition relative shadow-sm ${isOpen ? (isDay ? 'bg-slate-300' : 'bg-slate-700') : (isDay ? 'bg-slate-200/60 hover:bg-slate-300' : 'bg-[#1B263B] hover:bg-slate-700')}`}
      >
        <Star size={20} className="text-[#FBBF24] fill-[#FBBF24]" />
        {favorites.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#38BDF8] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
            {favorites.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setIsOpen(false)}></div>
          
          <div className={`absolute right-[-48px] sm:right-0 top-12 w-[85vw] sm:w-72 max-w-[320px] border rounded-xl shadow-2xl overflow-hidden z-50 transition-colors duration-500 ${isDay ? 'bg-white border-slate-200' : 'bg-[#1B263B] border-slate-700'}`}>
            <div className={`px-4 py-2 border-b ${isDay ? 'bg-slate-50 border-slate-200' : 'bg-[#0D1B2A]/50 border-slate-700/50'}`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${isDay ? 'text-slate-500' : 'text-slate-400'}`}>Villes Favorites</p>
            </div>
            
            {favorites.length === 0 ? (
              <p className={`text-xs p-4 text-center ${isDay ? 'text-slate-500' : 'text-slate-400'}`}>Aucune ville en favori</p>
            ) : (
              <ul className={`divide-y max-h-60 overflow-y-auto relative z-50 ${isDay ? 'divide-slate-200' : 'divide-slate-700/50'}`}>
                {favorites.map((city, index) => (
                  <li 
                    key={city?.name || index}
                    onClick={() => handleSelect(city)}
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors group ${isDay ? 'hover:bg-slate-100' : 'hover:bg-slate-800'}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin size={14} className="text-[#38BDF8] shrink-0" />
                      <span className={`text-sm font-medium truncate ${isDay ? 'text-slate-800' : 'text-slate-200'}`}>{city?.name}</span>
                    </div>
                    <button 
                      onClick={(e) => deleteFavorite(e, city.name)}
                      className="text-slate-500 hover:text-red-400 p-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
