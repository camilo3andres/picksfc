import Link from "next/link";
import Image from "next/image";
import SiteFooter from "@/components/site-footer";

// Diseño de lectura para las páginas legales: columna angosta y texto cómodo.
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-bg min-h-screen flex flex-col">
      <header className="max-w-3xl w-full mx-auto px-4 pt-6">
        <Link href="/" className="inline-flex items-center gap-2 font-black text-lg" style={{ color: "var(--text)" }}>
          <Image src="/icon.png" alt="" width={28} height={28} />
          Picks<span style={{ color: "var(--primary-light)" }}>FC</span>
        </Link>
      </header>

      <main className="legal-text max-w-3xl w-full mx-auto px-4 py-8 flex-1">{children}</main>

      <SiteFooter />
    </div>
  );
}
