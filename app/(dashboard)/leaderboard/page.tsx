import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import Avatar from "@/components/ui/avatar";
import VerifiedBadge from "@/components/ui/verified-badge";

// Ranking de pronosticadores. Es un Server Component: el cálculo se hace en el
// servidor y la página llega lista (antes se armaba en el navegador y se veía
// vacía unos instantes).

type Row = {
  username: string;
  is_verified?: boolean;
  resolved: number; // picks ya resueltos (correctos + incorrectos)
  correct: number;
  accuracy: number;
};

// Mínimo de picks resueltos para entrar al ranking.
// Evita que alguien con 1 de 1 (100%) quede por encima de alguien con 40 de 50 (80%).
const MIN_RESOLVED = 5;

const MEDAL = ["🥇", "🥈", "🥉"];
const MEDAL_STYLE = [
  { border: "rgba(251,191,36,0.30)",  bg: "rgba(251,191,36,0.05)"  },
  { border: "rgba(148,163,184,0.25)", bg: "rgba(148,163,184,0.04)" },
  { border: "rgba(180,83,9,0.25)",    bg: "rgba(180,83,9,0.04)"    },
];

async function getRanking() {
  const supabase = await createClient();

  // Se cuenta desde la tabla picks (igual que el perfil) para que el % salga
  // idéntico en ambos lados y los picks pendientes no cuenten.
  const { data } = await supabase
    .from("picks")
    .select("status, profiles(username, is_verified)")
    .in("status", ["correct", "incorrect"]);

  const byUser = new Map<string, Row>();
  for (const pick of data ?? []) {
    const author = Array.isArray(pick.profiles) ? pick.profiles[0] : pick.profiles;
    if (!author) continue;
    const row = byUser.get(author.username) ?? { username: author.username, is_verified: author.is_verified, resolved: 0, correct: 0, accuracy: 0 };
    row.resolved++;
    if (pick.status === "correct") row.correct++;
    byUser.set(author.username, row);
  }

  const all = [...byUser.values()].map((r) => ({ ...r, accuracy: Math.round((r.correct / r.resolved) * 100) }));
  return {
    // Desempate: con igual %, gana quien tiene más aciertos (más muestra)
    ranked: all.filter((r) => r.resolved >= MIN_RESOLVED).sort((a, b) => b.accuracy - a.accuracy || b.correct - a.correct),
    // Los que aún no llegan al mínimo: primero los más cerca de lograrlo
    unranked: all.filter((r) => r.resolved < MIN_RESOLVED).sort((a, b) => b.resolved - a.resolved),
  };
}

export const metadata: Metadata = {
  title: "Ranking de tipsters",
  description: "Los pronosticadores con mejor porcentaje de acierto en PicksFC, con historial verificado.",
};

export default async function LeaderboardPage() {
  const { ranked, unranked } = await getRanking();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-black" style={{ color: "var(--text)" }}>
          🏆 <span style={{ color: "#fbbf24" }}>Ranking</span>
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Los mejores pronosticadores de la comunidad · mínimo {MIN_RESOLVED} picks resueltos
        </p>
      </div>

      {ranked.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ background: "var(--surface)", border: "1px solid rgba(var(--tint-rgb), 0.06)" }}>
          <p className="text-4xl mb-3">🏆</p>
          <p className="font-medium" style={{ color: "var(--text-muted)" }}>
            Nadie llega aún a {MIN_RESOLVED} picks resueltos
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {ranked.map((row, index) => {
            const medal = MEDAL_STYLE[index];
            return (
              <Link key={row.username} href={`/profile/${row.username}`} className="block">
                <div
                  className="flex items-center gap-3 sm:gap-4 rounded-2xl px-4 sm:px-5 py-4 transition-colors duration-200 hover:bg-white/[0.04]"
                  style={{
                    background: medal?.bg,
                    border: `1px solid ${medal?.border ?? "rgba(var(--tint-rgb), 0.06)"}`,
                    boxShadow: index === 0 ? "0 4px 18px rgba(0,0,0,0.20)" : "none",
                  }}
                >
                  <div className="w-8 text-center flex-shrink-0">
                    {index < 3
                      ? <span className="text-2xl">{MEDAL[index]}</span>
                      : <span className="text-base font-black" style={{ color: "var(--text-muted)" }}>#{index + 1}</span>}
                  </div>

                  <Avatar username={row.username} size={40} />

                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm inline-flex items-center gap-1" style={{ color: "var(--text)" }}>
                      @{row.username}
                      {row.is_verified && <VerifiedBadge size={14} />}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {row.correct} correctos de {row.resolved} resueltos
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-black" style={{ color: row.accuracy >= 70 ? "var(--success)" : row.accuracy >= 50 ? "#fbbf24" : "#f87171" }}>
                      {row.accuracy}%
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>precisión</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {unranked.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>En camino al ranking</h2>
          {unranked.map((row) => (
            <Link
              key={row.username}
              href={`/profile/${row.username}`}
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-white/[0.03]"
              style={{ border: "1px solid rgba(var(--tint-rgb), 0.06)" }}
            >
              <Avatar username={row.username} size={32} />
              <p className="flex-1 min-w-0 text-sm font-bold" style={{ color: "var(--text-2)" }}>@{row.username}</p>
              <p className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                {row.resolved}/{MIN_RESOLVED} resueltos
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
