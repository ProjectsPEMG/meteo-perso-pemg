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

export default function FavoritesDropdown({ isDayTheme = false }: { isDayTheme?: boolean }) {
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

  const themeBtnBg = isDayTheme ? "bg-white hover:bg-slate-50" : "bg-[#1B263B] hover:bg-slate-700";
  const themeMenuBg = isDayTheme ? "bg-white border-slate-200" : "bg-[#1B263B] border-slate-700";
  const themeHeaderBg = isDayTheme ? "bg-slate-50 border-slate-200" : "bg-[#0D1B2A]/50 border-slate-700/50";
  const themeHover = isDayTheme ? "hover:bg-slate-50" : "hover:bg-[#0D1B2A]";
  const themeText = isDayTheme ? "text-slate-800" : "text-slate-200";
  const themeSubText = isDayTheme ? "text-slate-500" : "text-slate-400";
  const themeDivider = isDayTheme ? "divide-slate-100" : "divide-slate-700/50";

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition shadow-sm relative ${themeBtnBg}`}
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
          
          <div className={`absolute right-[-48px] sm:right-0 top-12 w-[85vw] sm:w-72 max-w-[320px] border rounded-xl shadow-2xl overflow-hidden z-50 transition-colors duration-500 ${themeMenuBg}`}>
            <div className={`px-4 py-2 border-b ${themeHeaderBg}`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${themeSubText}`}>Villes Favorites</p>
            </div>
            
            {favorites.length === 0 ? (
              <p className={`text-xs p-4 text-center ${themeSubText}`}>Aucune ville en favori</p>
            ) : (
              <ul className={`divide-y max-h-60 overflow-y-auto relative z-50 ${themeDivider}`}>
                {favorites.map((city, index) => (
                  <li 
                    key={city?.name || index}
                    onClick={() => handleSelect(city)}
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors group ${themeHover}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin size={14} className="text-[#38BDF8] shrink-0" />
                      <span className={`text-sm font-medium truncate ${themeText}`}>{city?.name}</span>
                    </div>
                    <button 
                      onClick={(e) => deleteFavorite(e, city.name)}
                      className={`p-1 transition-opacity ${isDayTheme ? 'text-slate-400 hover:text-red-500' : 'text-slate-500 hover:text-red-400'} md:opacity-0 md:group-hover:opacity-100`}
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
