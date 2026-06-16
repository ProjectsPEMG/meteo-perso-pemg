// src/app/layout.tsx

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. On importe le composant de barre de chargement
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Météo Perso",
  description: "Votre application météo ultra-précise",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0D1B2A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
