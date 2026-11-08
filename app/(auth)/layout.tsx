import Image from "next/image";
import SiteFooter from "@/components/site-footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-2 mb-3">
            <Image src="/icon.png" alt="PicksFC" width={90} height={90} className="rounded-3xl" style={{ boxShadow: "0 8px 32px rgba(var(--primary-rgb), 0.30)" }} />
            <span className="text-3xl font-black tracking-tight" style={{ color: "var(--text)" }}>
              Picks<span style={{ color: "var(--primary-light)" }}>FC</span>
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>La comunidad de pronosticadores</p>
        </div>

        {children}

        <SiteFooter />
      </div>
    </div>
  );
}
