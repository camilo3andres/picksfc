import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Outfit es una fuente "variable": UN solo archivo trae todos los grosores
// (400 a 900). Antes se pedían 6 grosores por separado = 6 archivos.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // Base para que los enlaces de imágenes y canonical salgan con el dominio completo
  metadataBase: new URL(SITE_URL),
  title: {
    // "default" se usa en las páginas sin título propio (ej. el inicio).
    // "template" arma el de las demás: "Ranking" → "Ranking · PicksFC".
    default: "PicksFC · Pronósticos de fútbol",
    template: "%s · PicksFC",
  },
  description:
    "Publica tus pronósticos de fútbol, compite con la comunidad y demuestra que sabes. Historial verificado y ranking de los mejores tipsters.",
  openGraph: {
    siteName: "PicksFC",
    locale: "es_CO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
