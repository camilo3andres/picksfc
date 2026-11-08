"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { FinishedMatch, Pick } from "@/lib/types";
import { resolvePick, withCache } from "@/lib/resolve-picks";

type Props = {
  pendingPicks: (Pick & { profiles: { username: string } })[];
};

async function getMatches(url: string): Promise<FinishedMatch[]> {
  try {
    const res = await fetch(url);
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}

export default function AutoResolveButton({ pendingPicks }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<{ resolved: number; skipped: number } | null>(null);
  const router   = useRouter();
  const supabase = createClient();

  async function handleAutoResolve() {
    setLoading(true);
    setResult(null);

    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD en hora local
    const past  = pendingPicks.filter((p) => p.match_date <= today);

    // Desde el navegador se pasa por las rutas /api/football/* (la llave de la API vive en el servidor)
    const loaders = withCache({
      byDate:   (date) => getMatches(`/api/football/results?date=${date}`),
      teamLast: (id)   => getMatches(`/api/football/team-last?id=${id}`),
    });

    let resolved = 0;
    let skipped  = 0;

    for (const pick of past) {
      const resolution = await resolvePick(pick, loaders);
      if (!resolution) {
        skipped++;
        continue;
      }

      const { error } = await supabase.from("picks").update(resolution).eq("id", pick.id);
      if (error) skipped++;
      else resolved++;
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
          style={{ background: "rgba(var(--tint-rgb), 0.04)", border: "1px solid rgba(var(--tint-rgb), 0.08)" }}
        >
          <span style={{ color: "var(--success)" }}>✅ {result.resolved} resueltos</span>
          <span style={{ color: "var(--text-faint)" }}>·</span>
          <span style={{ color: "#fbbf24" }}>⏭ {result.skipped} sin resultado aún</span>
        </div>
      )}
    </div>
  );
}
