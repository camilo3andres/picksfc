import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-server";

export default async function HomePage() {
  const supabase = await createClient();
  const [{ count: picksCount }, { count: usersCount }] = await Promise.all([
    supabase.from("picks").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="min-h-screen flex flex-col" style={{
      background: "linear-gradient(90deg, #081120 0%, #0d1b33 20%, #10203d 50%, #0d1b33 80%, #081120 100%)",
    }}>
      {/* Navbar simple */}
      <nav className="border-b border-white/5 px-4" style={{ background: "rgba(15,29,53,0.85)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <Image src="/icon.png" alt="PicksFC" width={36} height={36} className="rounded-xl" />
            <span className="text-lg font-black" style={{ color: "#f0f6ff" }}>Picks<span style={{ color: "#4ade80" }}>FC</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Link href="/login" className="text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl whitespace-nowrap"
              style={{ color: "#8fa8cc", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              Iniciar sesión
            </Link>
            <Link href="/register" className="text-xs sm:text-sm font-bold px-2.5 sm:px-3 py-1.5 rounded-xl whitespace-nowrap"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", boxShadow: "0 2px 10px rgba(34,197,94,0.25)" }}>
              Registrate gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
        <Image src="/icon.png" alt="PicksFC" width={96} height={96} className="rounded-3xl mb-6" style={{ boxShadow: "0 8px 40px rgba(34,197,94,0.25)" }} />

        <h1 className="text-2xl sm:text-5xl font-black mb-4 leading-tight" style={{ color: "#f0f6ff" }}>
          Pronosticá, compite y <span style={{ color: "#4ade80" }}>demuestra que sabés</span>
        </h1>

        <p className="text-lg mb-8 max-w-md" style={{ color: "#6b87ab" }}>
          La comunidad de pronósticos de fútbol. Publicá tus picks, seguí a los mejores y subí al ranking.
        </p>

        {/* Stats */}
        <div className="flex items-center gap-6 mb-10">
          <div className="text-center">
            <p className="text-2xl font-black" style={{ color: "#4ade80" }}>{picksCount ?? 0}</p>
            <p className="text-xs" style={{ color: "#4a6080" }}>Picks publicados</p>
          </div>
          <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="text-center">
            <p className="text-2xl font-black" style={{ color: "#4ade80" }}>{usersCount ?? 0}</p>
            <p className="text-xs" style={{ color: "#4a6080" }}>Pronosticadores</p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/register" className="px-8 py-3.5 rounded-2xl text-base font-black transition-all"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", boxShadow: "0 6px 24px rgba(34,197,94,0.35)" }}>
            ⚡ Registrate gratis
          </Link>
          <Link href="/feed" className="px-8 py-3.5 rounded-2xl text-base font-semibold transition-all"
            style={{ background: "rgba(255,255,255,0.05)", color: "#8fa8cc", border: "1px solid rgba(255,255,255,0.10)" }}>
            Ver picks →
          </Link>
        </div>

        <p className="text-xs mt-6" style={{ color: "#3a5070" }}>
          Sin spam. Solo autenticación segura para tu cuenta.
        </p>
      </div>
    </div>
  );
}
