// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. On importe le composant de barre de chargement
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkyDash - Ma Météo Personnalisée",
  description: "Tableau de bord météo complet et dynamique",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {/* 2. On configure la barre pour qu'elle soit bleue (couleur accent) et fine */}
        <NextTopLoader 
          color="#38BDF8" 
          height={3} 
          showSpinner={false} 
          shadow="0 0 10px #38BDF8,0 0 5px #38BDF8" 
        />
        {children}
      </body>
    </html>
  );
}