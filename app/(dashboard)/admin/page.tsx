import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AdminMatchResolver from "@/components/picks/admin-match-resolver";
import AdminPickCard from "@/components/picks/admin-pick-card";
import AutoResolveButton from "@/components/picks/auto-resolve-button";
import VerifyTipsterButton from "@/components/picks/verify-tipster-button";

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

  const [{ data: picks }, { data: users }] = await Promise.all([
    supabase
      .from("picks")
      .select("*, profiles(username)")
      .order("match_date", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, username, total_picks, correct_picks, is_verified, created_at")
      .order("total_picks", { ascending: false }),
  ]);

  const allPicks   = picks ?? [];
  const allUsers   = users ?? [];
  const pending    = allPicks.filter((p) => p.status === "pending");
  const correct    = allPicks.filter((p) => p.status === "correct");
  const incorrect  = allPicks.filter((p) => p.status === "incorrect");
  const resolved   = correct.length + incorrect.length;
  const accuracy   = resolved > 0 ? Math.round((correct.length / resolved) * 100) : 0;
  const today      = new Date().toISOString().split("T")[0];
  const overdue    = pending.filter((p) => p.match_date <= today);

  // Picks por liga (top 5)
  const leagueCounts: Record<string, number> = {};
  for (const p of allPicks) {
    leagueCounts[p.league] = (leagueCounts[p.league] ?? 0) + 1;
  }
  const topLeagues = Object.entries(leagueCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: "#f0f6ff" }}>
            ⚙️ <span style={{ color: "#4ade80" }}>Panel</span> Admin
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#4a6080" }}>
            Gestión completa de picks y comunidad
          </p>
        </div>
        {overdue.length > 0 && (
          <span className="text-xs font-bold px-3 py-1.5 rounded-full animate-pulse" style={{
            background: "rgba(251,191,36,0.15)",
            color: "#fbbf24",
            border: "1px solid rgba(251,191,36,0.35)",
          }}>
            ⚠️ {overdue.length} pick{overdue.length !== 1 ? "s" : ""} vencido{overdue.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { label: "Total picks",  value: allPicks.length, color: "#8fa8cc", border: "rgba(143,168,204,0.15)" },
          { label: "Pendientes",   value: pending.length,  color: "#fbbf24", border: "rgba(251,191,36,0.20)"  },
          { label: "Correctos",    value: correct.length,  color: "#4ade80", border: "rgba(74,222,128,0.20)"  },
          { label: "Incorrectos",  value: incorrect.length,color: "#f87171", border: "rgba(248,113,113,0.20)" },
          { label: "% Acierto",    value: `${accuracy}%`,  color: accuracy >= 60 ? "#4ade80" : accuracy >= 45 ? "#fbbf24" : "#f87171", border: "rgba(255,255,255,0.10)" },
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

      {/* Auto-resolve */}
      {pending.length > 0 && (
        <div className="rounded-2xl p-4 space-y-3" style={{
          background: "linear-gradient(160deg, #1a2d48 0%, #131e35 100%)",
          border: "1px solid rgba(59,130,246,0.20)",
        }}>
          <div>
            <h2 className="font-black text-base" style={{ color: "#f0f6ff" }}>
              🤖 Auto-resolver
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#4a6080" }}>
              Consulta football-data.org y resuelve automáticamente los picks con partido terminado
            </p>
          </div>
          <AutoResolveButton pendingPicks={pending as any} />
        </div>
      )}

      {/* Resolver manualmente */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div>
              <h2 className="font-black text-lg" style={{ color: "#f0f6ff" }}>
                ⚡ Resolver manualmente
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#4a6080" }}>
                Ingresá el marcador y todos los picks del partido se actualizan
              </p>
            </div>
          </div>
          <AdminMatchResolver pendingPicks={pending as any} />
        </div>
      )}

      {/* Picks pendientes individuales */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-black text-base pb-3 flex items-center gap-2" style={{ color: "#f0f6ff", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            ⏳ Pendientes individuales
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
              {pending.length}
            </span>
          </h2>
          {pending.map((pick) => (
            <AdminPickCard key={pick.id} pick={pick as any} />
          ))}
        </div>
      )}

      {/* Top ligas */}
      {topLeagues.length > 0 && (
        <div className="rounded-2xl p-4 space-y-3" style={{
          background: "linear-gradient(160deg, #1f2f48 0%, #182438 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
          <h2 className="font-black text-base" style={{ color: "#f0f6ff" }}>📊 Picks por liga</h2>
          <div className="space-y-2">
            {topLeagues.map(([league, count]) => {
              const pct = Math.round((count / allPicks.length) * 100);
              return (
                <div key={league} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold truncate" style={{ color: "#8fa8cc", maxWidth: "70%" }}>{league}</span>
                    <span className="font-black" style={{ color: "#f0f6ff" }}>{count} <span style={{ color: "#4a6080" }}>({pct}%)</span></span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #3b82f6, #1d4ed8)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Usuarios */}
      {allUsers.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-black text-base pb-3 flex items-center gap-2" style={{ color: "#f0f6ff", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            👥 Tipsters
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "#6b87ab" }}>
              {allUsers.length}
            </span>
          </h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            {allUsers.map((u, i) => {
              const userAcc = u.total_picks > 0 ? Math.round((u.correct_picks / u.total_picks) * 100) : 0;
              return (
                <div
                  key={u.id}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{
                    background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                    borderBottom: i < allUsers.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}
                >
                  <span className="text-sm font-black w-5 text-center" style={{ color: "#2a4060" }}>#{i + 1}</span>
                  <span className="flex-1 text-sm font-bold" style={{ color: "#e8f0fe" }}>@{u.username}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span style={{ color: "#4a6080" }}>{u.total_picks} picks</span>
                    <span className="font-black" style={{ color: userAcc >= 60 ? "#4ade80" : userAcc >= 45 ? "#fbbf24" : "#f87171" }}>
                      {userAcc}%
                    </span>
                    <VerifyTipsterButton userId={u.id} isVerified={u.is_verified ?? false} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Picks resueltos */}
      {resolved > 0 && (
        <div className="space-y-3">
          <h2 className="font-black text-base pb-3 flex items-center gap-2" style={{ color: "#f0f6ff", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            ✅ Resueltos
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(74,222,128,0.10)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.20)" }}>
              {resolved}
            </span>
          </h2>
          {[...correct, ...incorrect].sort((a, b) => b.created_at.localeCompare(a.created_at)).map((pick) => (
            <AdminPickCard key={pick.id} pick={pick as any} />
          ))}
        </div>
      )}

      {allPicks.length === 0 && (
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
