// src/app/error.tsx
"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Erreur capturée :", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center p-4 font-sans">
      <div className="bg-[#1B263B] p-8 rounded-3xl border border-slate-700 shadow-2xl max-w-md w-full text-center">
        <AlertTriangle size={64} className="text-[#FBBF24] mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Oups, l'API météo est surchargée !</h2>
        <p className="text-slate-400 mb-8 text-sm leading-relaxed">
          Le service public météo a temporairement bloqué la connexion suite à une trop forte affluence sur notre serveur. Veuillez patienter un instant et réessayer.
        </p>
        <button
          onClick={() => reset()}
          className="w-full bg-[#38BDF8] hover:bg-[#0284C7] text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw size={20} />
          Réessayer
        </button>
      </div>
    </div>
  );
}
