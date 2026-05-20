import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AdminMatchResolver from "@/components/picks/admin-match-resolver";
import AdminPickCard from "@/components/picks/admin-pick-card";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/feed");

  const { data: picks } = await supabase
    .from("picks")
    .select("*, profiles(username)")
    .order("created_at", { ascending: false });

  const pending  = picks?.filter((p) => p.status === "pending")  ?? [];
  const resolved = picks?.filter((p) => p.status !== "pending")  ?? [];
  const correct  = picks?.filter((p) => p.status === "correct")  ?? [];
  const incorrect = picks?.filter((p) => p.status === "incorrect") ?? [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: "#f0f6ff" }}>
          ⚙️ <span style={{ color: "#4ade80" }}>Panel</span> Admin
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "#4a6080" }}>
          Resolvé partidos y gestioná picks de la comunidad
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Total",       value: picks?.length ?? 0, color: "#8fa8cc", border: "rgba(143,168,204,0.15)" },
          { label: "Pendientes",  value: pending.length,     color: "#fbbf24", border: "rgba(251,191,36,0.20)"  },
          { label: "Correctos",   value: correct.length,     color: "#4ade80", border: "rgba(74,222,128,0.20)"  },
          { label: "Incorrectos", value: incorrect.length,   color: "#f87171", border: "rgba(248,113,113,0.20)" },
        ].map(({ label, value, color, border }) => (
          <div key={label} className="rounded-xl px-3 py-3 text-center" style={{
            background: "linear-gradient(160deg, #1f2f48 0%, #182438 100%)",
            border: `1px solid ${border}`,
          }}>
            <p className="text-2xl font-black" style={{ color }}>{value}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: "#4a6080" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Resolver partidos */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div>
              <h2 className="font-black text-lg" style={{ color: "#f0f6ff" }}>
                ⚡ Resolver partidos
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#4a6080" }}>
                Ingresá el marcador final y todos los picks del partido se actualizan automáticamente
              </p>
            </div>
          </div>
          <AdminMatchResolver pendingPicks={pending as any} />
        </div>
      )}

      {/* Picks pendientes */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-black text-base pb-3" style={{ color: "#f0f6ff", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            ⏳ Pendientes individuales
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
              {pending.length}
            </span>
          </h2>
          {pending.map((pick) => (
            <AdminPickCard key={pick.id} pick={pick as any} />
          ))}
        </div>
      )}

      {/* Picks resueltos */}
      {resolved.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-black text-base pb-3" style={{ color: "#f0f6ff", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            ✅ Resueltos
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(74,222,128,0.10)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.20)" }}>
              {resolved.length}
            </span>
          </h2>
          {resolved.map((pick) => (
            <AdminPickCard key={pick.id} pick={pick as any} />
          ))}
        </div>
      )}

      {picks?.length === 0 && (
        <div className="text-center py-20 rounded-2xl" style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}>
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium" style={{ color: "#4a6080" }}>No hay picks todavía</p>
        </div>
      )}
    </div>
  );
}
