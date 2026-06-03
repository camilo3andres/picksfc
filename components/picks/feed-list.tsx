"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Pick } from "@/lib/types";
import PickCard from "./pick-card";
import Link from "next/link";

type PickWithProfile = Pick & { profiles: { username: string } };

type Props = {
  initialPicks: PickWithProfile[];
  initialLikedIds: string[];
  currentUserId: string | null;
  followingIds: string[];
};

const LEAGUES = ["UEFA Champions League", "UEFA Europa League", "UEFA Conference League", "Premier League", "La Liga", "Bundesliga", "Serie A", "Ligue 1", "Liga Dimayor"];

const LEAGUE_ICON: Record<string, string> = {
  "UEFA Champions League":  "⭐",
  "UEFA Europa League":     "🟠",
  "UEFA Conference League": "🔵",
  "Premier League":         "🦁",
  "La Liga":                "🇪🇸",
  "Bundesliga":             "🦅",
  "Serie A":                "🇮🇹",
  "Ligue 1":                "🇫🇷",
  "Liga Dimayor":           "🇨🇴",
};

const WEEKDAY_ES = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

function getDateDays(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

function buildDateRange() {
  const days = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split("T")[0];
    const label = i === 0 ? "Hoy" : i === -1 ? "Ayer" : i === 1 ? "Mañana"
      : `${WEEKDAY_ES[d.getDay()]} ${d.getDate()}`;
    days.push({ iso, label });
  }
  return days;
}

export default function FeedList({ initialPicks, initialLikedIds, currentUserId, followingIds: initialFollowingIds }: Props) {
  const DATE_RANGE = buildDateRange();
  const [picks, setPicks] = useState<PickWithProfile[]>(initialPicks);
  const [league, setLeague] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [feedTab, setFeedTab] = useState<"all" | "following">("all");
  const [followingIds, setFollowingIds] = useState<string[]>(initialFollowingIds);

  useEffect(() => {
    if (!currentUserId) return;
    async function fetchFollowing() {
      const { data } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentUserId);
      if (data) setFollowingIds(data.map((f) => f.following_id));
    }
    fetchFollowing();
  }, [currentUserId]);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("picks-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "picks" },
        (payload) => {
          setPicks((current) =>
            current.map((pick) =>
              pick.id === payload.new.id ? { ...pick, ...payload.new } : pick
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "picks" },
        async () => {
          const { data } = await supabase
            .from("picks")
            .select("*, profiles(username)")
            .order("created_at", { ascending: false });
          if (data) setPicks(data as PickWithProfile[]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Racha por usuario: picks resueltos consecutivos más recientes
  const streakMap: Record<string, number> = {};
  const byUser: Record<string, PickWithProfile[]> = {};
  for (const p of picks) {
    if (!byUser[p.user_id]) byUser[p.user_id] = [];
    byUser[p.user_id].push(p);
  }
  for (const [userId, userPicks] of Object.entries(byUser)) {
    const sorted = [...userPicks]
      .filter((p) => p.status !== "pending")
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    let streak = 0;
    for (const p of sorted) {
      if (p.status === "correct") streak++;
      else break;
    }
    streakMap[userId] = streak;
  }

  const followingSet = new Set(followingIds);
  const filtered = picks.filter((p) => {
    if (feedTab === "following" && !followingSet.has(p.user_id)) return false;
    if (league && p.league !== league) return false;
    if (dateFilter && p.match_date.split("T")[0] !== dateFilter) return false;
    return true;
  });

  return (
    <div className="space-y-3">

      {/* Fila 1: Siguiendo */}
      {currentUserId && (
        <div>
          <button
            onClick={() => setFeedTab(feedTab === "following" ? "all" : "following")}
            className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
            style={feedTab === "following" ? {
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "#fff",
              boxShadow: "0 2px 10px rgba(34,197,94,0.28)",
              border: "1px solid transparent",
            } : {
              background: "rgba(255,255,255,0.04)",
              color: "#6b87ab",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            👥 Siguiendo
          </button>
        </div>
      )}

      {/* Fila 2: Fecha */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {DATE_RANGE.map(({ iso, label }) => {
          const active = dateFilter === iso;
          const isToday = iso === getDateDays(0);
          return (
            <button
              key={String(iso)}
              onClick={() => setDateFilter(active ? null : iso)}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200"
              style={active ? {
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#fff",
                boxShadow: "0 2px 10px rgba(34,197,94,0.28)",
                border: "1px solid transparent",
              } : {
                background: isToday ? "rgba(34,197,94,0.07)" : "rgba(255,255,255,0.04)",
                color: isToday ? "#4ade80" : "#6b87ab",
                border: isToday ? "1px solid rgba(34,197,94,0.18)" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Fila 3: Liga (scroll horizontal) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {LEAGUES.map((l) => {
          const active = league === l;
          const icon = LEAGUE_ICON[l];
          return (
            <button
              key={l}
              onClick={() => setLeague(active ? null : l)}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200"
              style={active ? {
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#fff",
                boxShadow: "0 2px 10px rgba(34,197,94,0.28)",
                border: "1px solid transparent",
              } : {
                background: "rgba(255,255,255,0.04)",
                color: "#6b87ab",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span>{icon}</span>
              <span>{l}</span>
            </button>
          );
        })}
      </div>

      {/* Resultados */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          {feedTab === "following" && followingIds.length === 0 ? (
            <>
              <p className="text-3xl mb-3">👥</p>
              <p className="font-medium" style={{ color: "#4a6080" }}>
                Aún no seguís a nadie
              </p>
              <p className="text-sm mt-1" style={{ color: "#3a5070" }}>
                Entrá a un perfil y dale "+ Seguir"
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl mb-3">🔍</p>
              <p className="font-medium" style={{ color: "#4a6080" }}>No hay picks con estos filtros</p>
              <button
                onClick={() => { setLeague(null); setDateFilter(null); setFeedTab("all"); }}
                className="mt-3 text-sm transition-colors"
                style={{ color: "#22c55e" }}
              >
                Limpiar filtros
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((pick) => (
            <PickCard
              key={pick.id}
              pick={pick}
              currentUserId={currentUserId}
              userLiked={initialLikedIds.includes(pick.id)}
              isFollowing={followingIds.includes(pick.user_id)}
              streak={streakMap[pick.user_id] ?? 0}
              onFollowChange={(userId, nowFollowing) => {
                setFollowingIds((prev) =>
                  nowFollowing ? [...prev, userId] : prev.filter((id) => id !== userId)
                );
              }}
              onDelete={(pickId) => setPicks((prev) => prev.filter((p) => p.id !== pickId))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
