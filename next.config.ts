import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Caché del navegador para páginas ya visitadas (como BetPlay/Rushbet):
    // volver a una pestaña abierta hace menos de 30 s es instantáneo, sin ir al
    // servidor. Los datos no quedan viejos porque likes, resultados y
    // comentarios se actualizan en vivo (Supabase Realtime).
    // Por defecto en Next 15+ es 0 = cada cambio de pestaña pedía todo de nuevo.
    staleTimes: {
      dynamic: 30,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.thesportsdb.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "crests.football-data.org",
      },
      {
        protocol: "https",
        hostname: "r2.thesportsdb.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/**",
      },
      {
        protocol: "https",
        hostname: "a.espncdn.com",
      },
    ],
  },
};

export default nextConfig;
