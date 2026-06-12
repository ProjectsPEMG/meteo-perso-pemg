// src/components/SearchBar.tsx
"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRouting, setIsRouting] = useState(false); // Nouveau: état de chargement de la page
  const router = useRouter();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const fetchCities = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=fr&format=json`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (error) {
        console.error("Erreur de recherche", error);
      }
      setIsSearching(false);
    };

    const delayDebounce = setTimeout(() => { fetchCities(); }, 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (lat: number, lon: number, name: string) => {
    setQuery(name); // Laisse le nom dans la barre
    setResults([]);
    setIsRouting(true); // Active le spinner
    
    // Simule une petite transition UI et lance la navigation
    router.push(`/?lat=${lat}&lon=${lon}&city=${name}`);
    
    // Désactive le spinner après 2 secondes (le temps que la page charge)
    setTimeout(() => setIsRouting(false), 2000);
  };

  return (
    <div className="relative w-full md:w-1/3 z-50">
      {/* On remet l'icône de recherche classique */}
      <Search className="absolute left-3 top-3 text-slate-400" size={20} />
      
      <input
      
        type="text" 
        placeholder="Rechercher une ville..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-[#1B263B] border border-slate-700 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-[#38BDF8] transition-colors"
      />
      
      {results.length > 0 && (
        <ul className="absolute top-12 left-0 w-full bg-[#1B263B] border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          {results.map((city) => (
            <li 
              key={city.id} 
              onClick={() => handleSelect(city.latitude, city.longitude, city.name)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 cursor-pointer transition-colors border-b border-slate-700/50 last:border-none"
            >
              <MapPin size={16} className="text-[#38BDF8]" />
              <div>
                <p className="text-sm font-semibold text-slate-200">{city.name}</p>
                <p className="text-xs text-slate-400">{city.admin1}, {city.country}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}