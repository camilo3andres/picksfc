"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { Pick } from "@/lib/types";

type PickWithProfile = Pick & { profiles: { username: string } };

type Match = {
  key: string;
  home_team: string;
  away_team: string;
  home_team_logo: string | null;
  away_team_logo: string | null;
  match_date: string;
  league: string;
  picks: PickWithProfile[];
};

type Props = {
  pendingPicks: PickWithProfile[];
};

function groupByMatch(picks: PickWithProfile[]): Match[] {
  const map = new Map<string, Match>();
  for (const pick of picks) {
    const key = `${pick.home_team}|${pick.away_team}|${pick.match_date}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        home_team: pick.home_team,
        away_team: pick.away_team,
        home_team_logo: pick.home_team_logo,
        away_team_logo: pick.away_team_logo,
        match_date: pick.match_date,
        league: pick.league,
        picks: [],
      });
    }
    map.get(key)!.picks.push(pick);
  }
  return Array.from(map.values());
}

function getResult(home: number, away: number): "home" | "draw" | "away" {
  if (home > away) return "home";
  if (home < away) return "away";
  return "draw";
}

export default function AdminMatchResolver({ pendingPicks }: Props) {
  const [resolvedKeys, setResolvedKeys] = useState<Set<string>>(new Set());
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({});
  const [resolving, setResolving] = useState<string | null>(null);
  const supabase = createClient();
  const router   = useRouter();
  const [, startTransition] = useTransition();

  // Solo mostrar partidos cuyos picks NO tienen marcador — los que ya tienen marcador
  // se resuelven directo desde la tarjeta individual con ✓ / ✗ / ✏️
  const matches = groupByMatch(pendingPicks)
    .filter((m) => !resolvedKeys.has(m.key))
    .filter((m) => m.picks.every((p) => p.home_score === null));

  function setScore(key: string, side: "home" | "away", value: string) {
    setScores((prev) => ({
      ...prev,
      [key]: { ...{ home: "", away: "" }, ...prev[key], [side]: value },
    }));
  }

  async function resolveMatch(match: Match) {
    const score = scores[match.key];
    if (!score || score.home === "" || score.away === "") return;
    const homeScore = parseInt(score.home);
    const awayScore = parseInt(score.away);
    if (isNaN(homeScore) || isNaN(awayScore)) return;

    const result = getResult(homeScore, awayScore);
    setResolving(match.key);

    for (const pick of match.picks) {
      await supabase.from("picks").update({
        status: pick.prediction === result ? "correct" : "incorrect",
        home_score: homeScore,
        away_score: awayScore,
      }).eq("id", pick.id);
    }

    setResolvedKeys((prev) => new Set(prev).add(match.key));
    setResolving(null);
    startTransition(() => router.refresh());
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8 rounded-2xl" style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}>
        <p className="text-sm" style={{ color: "#4a6080" }}>No hay partidos pendientes por resolver</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => {
        const score = scores[match.key] ?? { home: "", away: "" };
        const canResolve = score.home !== "" && score.away !== "";

        return (
          <div key={match.key} className="rounded-2xl p-4 space-y-3" style={{
            background: "linear-gradient(160deg, #1f2f48 0%, #182438 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            {/* Liga + fecha + conteo */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "#6b87ab" }}>
                🏆 {match.league}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "#4a6080" }}>
                  {new Date(match.match_date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
                  {match.picks.length} pick{match.picks.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Equipos + inputs */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 min-w-0">
                {match.home_team_logo && (
                  <Image src={match.home_team_logo} alt={match.home_team} width={28} height={28} className="object-contain flex-shrink-0" unoptimized />
                )}
                <span className="font-black text-sm truncate" style={{ color: "#f0f6ff" }}>{match.home_team}</span>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <input
                  type="number" min={0} max={99}
                  value={score.home}
                  onChange={(e) => setScore(match.key, "home", e.target.value)}
                  placeholder="0"
                  className="w-12 text-center text-white font-black text-lg rounded-xl py-1.5 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                />
                <span className="font-black text-sm" style={{ color: "#3a5070" }}>-</span>
                <input
                  type="number" min={0} max={99}
                  value={score.away}
                  onChange={(e) => setScore(match.key, "away", e.target.value)}
                  placeholder="0"
                  className="w-12 text-center text-white font-black text-lg rounded-xl py-1.5 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                />
              </div>

              <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
                <span className="font-black text-sm truncate text-right" style={{ color: "#f0f6ff" }}>{match.away_team}</span>
                {match.away_team_logo && (
                  <Image src={match.away_team_logo} alt={match.away_team} width={28} height={28} className="object-contain flex-shrink-0" unoptimized />
                )}
              </div>
            </div>

            {/* Picks de este partido */}
            <div className="flex flex-wrap gap-1.5">
              {match.picks.map((p) => (
                <span key={p.id} className="text-xs px-2 py-0.5 rounded-lg font-semibold" style={{ background: "rgba(255,255,255,0.05)", color: "#6b87ab" }}>
                  @{p.profiles.username} → {p.prediction === "home" ? "Local" : p.prediction === "away" ? "Visitante" : "Empate"}
                </span>
              ))}
            </div>

            {/* Confirmar */}
            <button
              disabled={!canResolve || resolving === match.key}
              onClick={() => resolveMatch(match)}
              className="w-full py-2.5 rounded-xl text-sm font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={canResolve ? {
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#fff",
                boxShadow: "0 4px 14px rgba(34,197,94,0.28)",
              } : {
                background: "rgba(255,255,255,0.05)",
                color: "#4a6080",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {resolving === match.key ? "Guardando..." : "⚡ Confirmar resultado"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
