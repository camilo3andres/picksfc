import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

// Outfit es una fuente "variable": UN solo archivo trae todos los grosores
// (400 a 900). Antes se pedían 6 grosores por separado = 6 archivos.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PicksFC · Pronósticos",
  description: "La comunidad de pronosticadores de fútbol",
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
