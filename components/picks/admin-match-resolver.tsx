"use client";

import { useState } from "react";
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

function getResult(homeScore: number, awayScore: number): "home" | "draw" | "away" {
  if (homeScore > awayScore) return "home";
  if (homeScore < awayScore) return "away";
  return "draw";
}

export default function AdminMatchResolver({ pendingPicks }: Props) {
  const [resolvedKeys, setResolvedKeys] = useState<Set<string>>(new Set());
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({});
  const [resolving, setResolving] = useState<string | null>(null);
  const supabase = createClient();

  const allMatches = groupByMatch(pendingPicks);
  const matches = allMatches.filter((m) => !resolvedKeys.has(m.key));

  function setScore(key: string, side: "home" | "away", value: string) {
    setScores((prev) => ({
      ...prev,
      [key]: { home: "", away: "", ...prev[key], [side]: value },
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
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 text-sm">
        No hay partidos pendientes por resolver.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => {
        const score = scores[match.key] ?? { home: "", away: "" };
        const canResolve = score.home !== "" && score.away !== "";

        return (
          <div key={match.key} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
            {/* Encabezado */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded-full">🏆 {match.league}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-zinc-500">
                  {new Date(match.match_date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                </span>
                <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">
                  {match.picks.length} pick{match.picks.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Partido + marcador */}
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2">
                {match.home_team_logo && (
                  <Image src={match.home_team_logo} alt={match.home_team} width={28} height={28} className="object-contain flex-shrink-0" unoptimized />
                )}
                <span className="text-white font-bold text-sm truncate">{match.home_team}</span>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={score.home}
                  onChange={(e) => setScore(match.key, "home", e.target.value)}
                  placeholder="0"
                  className="w-12 text-center bg-zinc-800 border border-zinc-700 text-white text-lg font-black rounded-lg py-1.5 outline-none focus:border-green-500 transition-colors"
                />
                <span className="text-zinc-500 font-bold">-</span>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={score.away}
                  onChange={(e) => setScore(match.key, "away", e.target.value)}
                  placeholder="0"
                  className="w-12 text-center bg-zinc-800 border border-zinc-700 text-white text-lg font-black rounded-lg py-1.5 outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <div className="flex-1 flex items-center gap-2 justify-end">
                <span className="text-white font-bold text-sm truncate text-right">{match.away_team}</span>
                {match.away_team_logo && (
                  <Image src={match.away_team_logo} alt={match.away_team} width={28} height={28} className="object-contain flex-shrink-0" unoptimized />
                )}
              </div>
            </div>

            {/* Botón confirmar */}
            <button
              disabled={!canResolve || resolving === match.key}
              onClick={() => resolveMatch(match)}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm py-2 rounded-lg transition-colors"
            >
              {resolving === match.key ? "Guardando..." : "✓ Confirmar resultado"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
