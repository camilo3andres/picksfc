import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PicksFC · En mantenimiento",
  robots: { index: false },
};

// Pantalla que ve todo el mundo cuando MAINTENANCE_MODE=true (ver proxy.ts)
export default function MantenimientoPage() {
  return (
    <div
      className="app-bg min-h-screen flex flex-col items-center justify-center text-center px-4"
    >
      <Image
        src="/icon.png"
        alt="PicksFC"
        width={88}
        height={88}
        className="rounded-3xl mb-6"
        style={{ boxShadow: "0 8px 40px rgba(var(--primary-rgb), 0.25)" }}
      />
      <h1 className="text-2xl sm:text-4xl font-black mb-3" style={{ color: "var(--text)" }}>
        Estamos mejorando <span style={{ color: "var(--primary-light)" }}>PicksFC</span>
      </h1>
      <p className="max-w-md" style={{ color: "var(--text-3)" }}>
        Volvemos pronto con novedades. ⚽
      </p>
    </div>
  );
}
