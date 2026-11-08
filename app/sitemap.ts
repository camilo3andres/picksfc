import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Genera /sitemap.xml: la lista de páginas públicas que queremos que los buscadores encuentren.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE_URL,                  lastModified: now, changeFrequency: "weekly",  priority: 1 },
    { url: `${SITE_URL}/feed`,        lastModified: now, changeFrequency: "hourly",  priority: 0.9 },
    { url: `${SITE_URL}/leaderboard`, lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${SITE_URL}/privacidad`,  lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
    { url: `${SITE_URL}/terminos`,    lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
  ];
}
