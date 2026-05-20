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
const STATUSES = [
  { value: "pending",   label: "⏳ Pendientes" },
  { value: "correct",   label: "✅ Correctos" },
  { value: "incorrect", label: "❌ Incorrectos" },
];

function getDateDays(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

function buildDateRange() {
  const days = [];
  for (let i = -3; i <= 3; i++) {
    const iso = getDateDays(i);
    const d = new Date(iso + "T12:00:00");
    const label = i === 0 ? "Hoy" : i === -1 ? "Ayer" : i === 1 ? "Mañana"
      : d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" });
    days.push({ iso, label });
  }
  return days;
}

const DATE_RANGE = buildDateRange();

export default function FeedList({ initialPicks, initialLikedIds, currentUserId, followingIds: initialFollowingIds }: Props) {
  const [picks, setPicks] = useState<PickWithProfile[]>(initialPicks);
  const [league, setLeague] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
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

  const followingSet = new Set(followingIds);
  const filtered = picks.filter((p) => {
    if (feedTab === "following" && !followingSet.has(p.user_id)) return false;
    if (league && p.league !== league) return false;
    if (status && p.status !== status) return false;
    if (dateFilter && p.match_date.split("T")[0] !== dateFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Total picks", value: picks.length, color: "#8fa8cc" },
          { label: "Correctos", value: picks.filter(p => p.status === "correct").length, color: "#4ade80" },
          { label: "Pendientes", value: picks.filter(p => p.status === "pending").length, color: "#fbbf24" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl px-3 py-2.5 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-lg font-black" style={{ color }}>{value}</p>
            <p className="text-xs font-medium" style={{ color: "#3a5070" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Toggle Siguiendo — solo para usuarios con sesión */}
      {currentUserId && <div>
        <button
          onClick={() => setFeedTab(feedTab === "following" ? "all" : "following")}
          className="text-sm font-bold px-4 py-1.5 rounded-xl transition-all"
          style={feedTab === "following" ? {
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "#fff",
            boxShadow: "0 4px 12px rgba(34,197,94,0.25)",
            border: "1px solid transparent",
          } : {
            background: "rgba(255,255,255,0.04)",
            color: "#6b87ab",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          👥 Siguiendo
        </button>
      </div>}

      {/* Filtro por fecha */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {[{ iso: null, label: "Todos" }, ...DATE_RANGE].map(({ iso, label }) => {
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

      {/* Filtro por liga */}
      <div className="flex flex-wrap gap-1.5">
        {["Todas", ...LEAGUES].map((l) => {
          const active = l === "Todas" ? league === null : league === l;
          const icon = l === "Todas" ? "⚽" : LEAGUE_ICON[l];
          return (
            <button
              key={l}
              onClick={() => setLeague(l === "Todas" ? null : (league === l ? null : l))}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200"
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

      {/* Filtro por estado */}
      <div className="flex flex-wrap gap-2">
        {[{ value: null, label: "⚽ Todos" }, ...STATUSES.map(s => ({ value: s.value, label: s.label }))].map((s) => {
          const active = status === s.value;
          return (
            <button
              key={String(s.value)}
              onClick={() => setStatus(active ? null : s.value)}
              className="text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200"
              style={active ? {
                background: "rgba(255,255,255,0.10)",
                color: "#f0f6ff",
                border: "1px solid rgba(255,255,255,0.16)",
              } : {
                background: "rgba(255,255,255,0.03)",
                color: "#4a6080",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {s.label}
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
                onClick={() => { setLeague(null); setStatus(null); setDateFilter(null); }}
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
