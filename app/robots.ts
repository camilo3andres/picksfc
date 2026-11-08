import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Genera /robots.txt: le dice a Google y Bing qué rutas NO revisar.
// Login y registro NO van aquí: si se bloquean, el buscador no puede leer su
// "noindex" (en app/(auth)/layout.tsx) y podría seguir mostrándolas.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/auth/", "/picks/new", "/profile/edit", "/mantenimiento"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
