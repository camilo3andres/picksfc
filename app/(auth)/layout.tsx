import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: "linear-gradient(90deg, #081120 0%, #0d1b33 20%, #10203d 50%, #0d1b33 80%, #081120 100%)",
    }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-2 mb-3">
            <Image src="/icon.png" alt="PicksFC" width={90} height={90} className="rounded-3xl" style={{ boxShadow: "0 8px 32px rgba(34,197,94,0.30)" }} />
            <span className="text-3xl font-black tracking-tight" style={{ color: "#f0f6ff" }}>
              Picks<span style={{ color: "#4ade80" }}>FC</span>
            </span>
          </div>
          <p className="text-sm" style={{ color: "#5a7a9a" }}>La comunidad de pronosticadores</p>
        </div>

        {children}
      </div>
    </div>
  );
}
