// src/app/map/page.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ArrowLeft, Map as MapIcon, Loader2 } from "lucide-react";

const WeatherMap = dynamic(() => import("@/component/MapComponent"), { ssr: false });

export default function MapPage() {
  const [isLeaving, setIsLeaving] = useState(false);
  const router = useRouter();

  const handleBack = () => {
    setIsLeaving(true);
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[#0D1B2A] text-slate-100 font-sans p-4 md:p-8">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-10 gap-4">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <span className="text-[#38BDF8]">Ma</span> Météo
        </div>
        
        {/* Bouton optimisé avec un état de chargement */}
        <button 
          onClick={handleBack}
          disabled={isLeaving}
          className="flex items-center gap-2 bg-[#1B263B] px-4 py-2 rounded-full hover:bg-slate-700 transition border border-slate-700 disabled:opacity-50"
        >
          {isLeaving ? (
            <Loader2 size={18} className="text-[#38BDF8] animate-spin" />
          ) : (
            <ArrowLeft size={18} className="text-[#38BDF8]" />
          )}
          <span className="text-sm font-medium">
            {isLeaving ? "Chargement..." : "Retour au Dashboard"}
          </span>
        </button>
      </header>

      <section className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <MapIcon className="text-[#34D399]" size={32} />
            Carte de vos Favoris
          </h1>
          <p className="text-slate-400">
            Visualisez en temps réel la météo des villes que vous avez sauvegardées. 
            La couleur des points change selon les conditions climatiques.
          </p>
        </div>

        <WeatherMap />
      </section>
    </main>
  );
}