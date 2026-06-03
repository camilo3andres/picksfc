"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Pick } from "@/lib/types";

type Props = {
  pendingPicks: (Pick & { profiles: { username: string } })[];
};

function normalize(name: string) {
  return name.toLowerCase().replace(/\s+(fc|cf|sc|ac|bc|afc|utd|united|city|club|de|del|the)$/i, "").trim();
}

function matchTeams(pickName: string, apiName: string) {
  const a = normalize(pickName);
  const b = normalize(apiName);
  return a === b || a.includes(b) || b.includes(a);
}

type ApiMatch = {
  id: number;
  status: string;
  utcDate: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  score: {
    winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
    fullTime: { home: number | null; away: number | null };
  };
};

export default function AutoResolveButton({ pendingPicks }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<{ resolved: number; skipped: number } | null>(null);
  const router  = useRouter();
  const supabase = createClient();

  async function handleAutoResolve() {
    setLoading(true);
    setResult(null);

    const today = new Date().toISOString().split("T")[0];
    const past  = pendingPicks.filter((p) => p.match_date <= today);

    if (past.length === 0) {
      setResult({ resolved: 0, skipped: 0 });
      setLoading(false);
      return;
    }

    // Fechas únicas con picks vencidos
    const dates = [...new Set(past.map((p) => p.match_date))];

    // Fetch resultados por fecha
    const matchesByDate: Record<string, ApiMatch[]> = {};
    for (const date of dates) {
      const res  = await fetch(`/api/football/results?date=${date}`);
      const data = await res.json();
      matchesByDate[date] = data;
    }

    let resolved = 0;
    let skipped  = 0;

    for (const pick of past) {
      const matches = matchesByDate[pick.match_date] ?? [];

      const match = matches.find(
        (m) => matchTeams(pick.home_team, m.homeTeam.name) && matchTeams(pick.away_team, m.awayTeam.name)
      );

      if (!match || match.status !== "FINISHED" || !match.score.winner) {
        skipped++;
        continue;
      }

      const winnerMap = { HOME_TEAM: "home", AWAY_TEAM: "away", DRAW: "draw" } as const;
      const result    = winnerMap[match.score.winner];
      const correct   =
        pick.prediction === "home_draw" ? result === "home" || result === "draw" :
        pick.prediction === "away_draw" ? result === "away" || result === "draw" :
        pick.prediction === result;
      const status = correct ? "correct" : "incorrect";

      await supabase.from("picks").update({
        status,
        home_score: match.score.fullTime.home ?? 0,
        away_score: match.score.fullTime.away ?? 0,
      }).eq("id", pick.id);

      resolved++;
    }

    setResult({ resolved, skipped });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleAutoResolve}
        disabled={loading || pendingPicks.length === 0}
        className="w-full py-3 rounded-xl text-sm font-black transition-all disabled:opacity-40"
        style={{
          background: loading
            ? "rgba(99,179,237,0.3)"
            : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
          color: "#fff",
          boxShadow: loading ? "none" : "0 4px 16px rgba(59,130,246,0.35)",
          border: "1px solid transparent",
        }}
      >
        {loading ? "🔄 Consultando resultados..." : "⚡ Auto-resolver con API"}
      </button>

      {result && (
        <div
          className="flex items-center justify-center gap-4 px-4 py-2.5 rounded-xl text-xs font-semibold"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span style={{ color: "#4ade80" }}>✅ {result.resolved} resueltos</span>
          <span style={{ color: "#4a6080" }}>·</span>
          <span style={{ color: "#fbbf24" }}>⏭ {result.skipped} sin resultado aún</span>
        </div>
      )}
    </div>
  );
}
