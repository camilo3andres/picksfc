"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { getAvatarColor } from "@/lib/utils";

type Profile = {
  username: string;
  total_picks: number;
  correct_picks: number;
  accuracy: number;
};

const MEDAL = ["🥇", "🥈", "🥉"];

const MEDAL_STYLE = [
  { border: "rgba(251,191,36,0.30)",  bg: "rgba(251,191,36,0.05)"  },
  { border: "rgba(148,163,184,0.25)", bg: "rgba(148,163,184,0.04)" },
  { border: "rgba(180,83,9,0.25)",    bg: "rgba(180,83,9,0.04)"    },
];

export default function LeaderboardPage() {
  const [ranked, setRanked] = useState<Profile[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("username, total_picks, correct_picks");

      const result = (data ?? [])
        .map((p) => ({
          ...p,
          accuracy: p.total_picks > 0 ? Math.round((p.correct_picks / p.total_picks) * 100) : 0,
        }))
        .filter((p) => p.total_picks > 0)
        .sort((a, b) => b.accuracy - a.accuracy || b.correct_picks - a.correct_picks);

      setRanked(result);
    }
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black" style={{ color: "#f0f6ff" }}>
          🏆 <span style={{ color: "#fbbf24" }}>Ranking</span>
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "#5a7a9a" }}>
          Los mejores pronosticadores de la comunidad
        </p>
      </div>

      {ranked.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{
          background: "#162742",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <p className="text-4xl mb-3">🏆</p>
          <p className="font-medium" style={{ color: "#5a7a9a" }}>
            Aún no hay picks resueltos para rankear
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {ranked.map((profile, index) => {
            const medalStyle = MEDAL_STYLE[index] ?? {
              border: "rgba(255,255,255,0.06)",
              bg: "transparent",
            };

            return (
              <Link key={profile.username} href={`/profile/${profile.username}`} className="block group">
                <div
                  className="flex items-center gap-3 sm:gap-4 rounded-2xl px-4 sm:px-5 py-4 transition-all duration-200"
                  style={{
                    background: index < 3 ? medalStyle.bg : "transparent",
                    border: `1px solid ${medalStyle.border}`,
                    boxShadow: index === 0 ? "0 4px 18px rgba(0,0,0,0.20)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = index < 3 ? medalStyle.bg : "transparent";
                  }}
                >
                  {/* Posición */}
                  <div className="w-8 text-center flex-shrink-0">
                    {index < 3 ? (
                      <span className="text-2xl">{MEDAL[index]}</span>
                    ) : (
                      <span className="text-base font-black" style={{ color: "#5a7a9a" }}>#{index + 1}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                    style={{ background: getAvatarColor(profile.username).bg }}
                  >
                    {profile.username[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm" style={{ color: "#f0f6ff" }}>@{profile.username}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#5a7a9a" }}>
                      {profile.correct_picks} correctos de {profile.total_picks} picks
                    </p>
                  </div>

                  {/* Precisión */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-black" style={{
                      color: profile.accuracy >= 70 ? "#4ade80" : profile.accuracy >= 50 ? "#fbbf24" : "#f87171",
                    }}>
                      {profile.accuracy}%
                    </p>
                    <p className="text-xs" style={{ color: "#5a7a9a" }}>precisión</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
