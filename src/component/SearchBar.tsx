// src/component/SearchBar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

// C'est ICI que l'on déclare à TypeScript qu'on accepte isDay !
export default function SearchBar({ isDay = false }: { isDay?: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const fetchCities = async () => {
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=fr&format=json`);
        const data = await res.json();
        setResults(data.results || []);
        setIsOpen(true);
      } catch (e) {
        console.error("Erreur de recherche", e);
      }
    };
    const timeoutId = setTimeout(fetchCities, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (city: any) => {
    setQuery("");
    setIsOpen(false);
    router.push(`/?lat=${city.latitude}&lon=${city.longitude}&city=${city.name}`);
  };

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDay ? 'text-slate-400' : 'text-slate-500'}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une ville..."
          className={`w-full pl-10 pr-4 py-2.5 rounded-full border outline-none transition-colors duration-500 ${
            isDay 
              ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-[#38BDF8] focus:bg-white shadow-inner' 
              : 'bg-[#0D1B2A] border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#38BDF8] focus:bg-[#1B263B]'
          }`}
        />
      </div>
      
      {isOpen && results.length > 0 && (
        <ul className={`absolute mt-2 w-full rounded-xl border shadow-xl overflow-hidden z-50 transition-colors duration-500 ${isDay ? 'bg-white border-slate-200' : 'bg-[#1B263B] border-slate-700'}`}>
          {results.map((city: any, idx: number) => (
            <li 
              key={idx} 
              onClick={() => handleSelect(city)} 
              className={`px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors ${isDay ? 'hover:bg-slate-100' : 'hover:bg-[#0D1B2A]'}`}
            >
              <MapPin size={16} className="text-[#38BDF8]" />
              <div>
                <p className={`text-sm font-medium ${isDay ? 'text-slate-800' : 'text-slate-200'}`}>{city.name}</p>
                <p className={`text-xs ${isDay ? 'text-slate-500' : 'text-slate-400'}`}>
                  {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
