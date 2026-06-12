// src/app/error.tsx
"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionnel : Enregistrer l'erreur dans la console
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#0D1B2A] flex flex-col items-center justify-center p-4 text-center text-slate-200">
      <div className="bg-[#1B263B] p-8 rounded-3xl border border-slate-700 max-w-md w-full shadow-2xl">
        <AlertTriangle className="text-[#FBBF24] w-16 h-16 mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-4">Oups, l'API météo est surchargée !</h2>
        <p className="text-slate-400 mb-8 text-sm">
          L'environnement de développement a mis trop de temps à répondre (Timeout). 
          Ce problème de réseau disparaîtra une fois le site mis en ligne sur Vercel.
        </p>
        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 w-full bg-[#38BDF8] hover:bg-[#0284C7] text-white py-3 rounded-full font-semibold transition-colors"
        >
          <RefreshCcw size={18} />
          Réessayer
        </button>
      </div>
    </main>
  );
}