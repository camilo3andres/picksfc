import Link from "next/link";
import { LEGAL } from "@/lib/legal";

// Pie de página con los links legales. Se usa en el inicio, login/registro,
// el dashboard y las páginas legales.
export default function SiteFooter() {
  return (
    <footer className="py-6 px-4 text-center text-xs" style={{ color: "var(--text-dim)" }}>
      <nav className="flex items-center justify-center gap-4 mb-1.5" aria-label="Enlaces legales">
        <Link href="/terminos" className="hover:underline" style={{ color: "var(--text-muted)" }}>Términos</Link>
        <span aria-hidden="true">·</span>
        <Link href="/privacidad" className="hover:underline" style={{ color: "var(--text-muted)" }}>Privacidad</Link>
      </nav>
      <p>
        © {new Date().getFullYear()} {LEGAL.siteName} · Solo para mayores de {LEGAL.minimumAge} años · Los picks son opiniones, no asesoría de apuestas.
      </p>
    </footer>
  );
}
