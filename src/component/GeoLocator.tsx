// src/component/GeoLocator.tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function GeoLocator() {
  const router = useRouter();
  const hasAttempted = useRef(false);

  useEffect(() => {
    // Empêcher la boucle : on n'essaie qu'une seule fois au chargement
    if (hasAttempted.current) return;
    hasAttempted.current = true;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Si l'utilisateur accepte, on recharge la page avec ses coordonnées !
          router.replace(`/?lat=${position.coords.latitude}&lon=${position.coords.longitude}&city=Ma Position`);
        },
        (error) => {
          console.warn("Géolocalisation ignorée ou refusée par défaut.", error);
          // On échoue silencieusement, la page restera sur Lons-le-Saunier (par défaut)
        },
        { timeout: 5000, maximumAge: 60000 }
      );
    }
  }, [router]);

  return null; // Ce composant est invisible !
}
