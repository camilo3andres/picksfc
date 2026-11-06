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
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{
        background: "linear-gradient(90deg, #081120 0%, #0d1b33 20%, #10203d 50%, #0d1b33 80%, #081120 100%)",
      }}
    >
      <Image
        src="/icon.png"
        alt="PicksFC"
        width={88}
        height={88}
        className="rounded-3xl mb-6"
        style={{ boxShadow: "0 8px 40px rgba(34,197,94,0.25)" }}
      />
      <h1 className="text-2xl sm:text-4xl font-black mb-3" style={{ color: "#f0f6ff" }}>
        Estamos mejorando <span style={{ color: "#4ade80" }}>PicksFC</span>
      </h1>
      <p className="max-w-md" style={{ color: "#6b87ab" }}>
        Volvemos pronto con novedades. ⚽
      </p>
    </div>
  );
}
