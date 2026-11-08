"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { FEED_PAGE_SIZE } from "@/lib/picks";
import { useLivePicks, type LivePick } from "@/lib/use-live-picks";
import PickCard from "./pick-card";
import Image from "next/image";

type PickWithProfile = LivePick;

type Props = {
  initialPicks: PickWithProfile[];
  initialLikedIds: string[];
  currentUserId: string | null;
  followingIds: string[];
};

const LEAGUES = ["FIFA World Cup", "UEFA Champions League", "UEFA Europa League", "UEFA Conference League", "Premier League", "La Liga", "Bundesliga", "Serie A", "Ligue 1", "Liga Dimayor"];

const LEAGUE_ICON: Record<string, string> = {
  "FIFA World Cup":         "🌍",
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
  // Picks en vivo: likes, resultados, picks nuevos y borrados llegan sin recargar
  const [picks, setPicks] = useLivePicks(initialPicks, { channel: "feed-picks" });
  const [likedIds, setLikedIds] = useState<string[]>(initialLikedIds);
  const [hasMore, setHasMore] = useState(initialPicks.length === FEED_PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [league, setLeague] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [feedTab, setFeedTab] = useState<"all" | "following">("all");
  const [followingIds, setFollowingIds] = useState<string[]>(initialFollowingIds);

  // Si alguien sigue/deja de seguir desde otra pestaña, el filtro "Siguiendo" se entera
  useEffect(() => {
    if (!currentUserId) return;
    const supabase = createClient();
    supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", currentUserId)
      .then(({ data }) => {
        if (data) setFollowingIds(data.map((f) => f.following_id));
      });
  }, [currentUserId]);

  // Siguiente tanda de picks (más viejos) + los likes del usuario en esa tanda
  async function loadMore() {
    setLoadingMore(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("picks")
      .select("*, profiles(username, is_verified)")
      .order("created_at", { ascending: false })
      .range(picks.length, picks.length + FEED_PAGE_SIZE - 1);

    const page = (data ?? []) as PickWithProfile[];
    if (currentUserId && page.length) {
      const { data: likes } = await supabase
        .from("likes")
        .select("pick_id")
        .eq("user_id", currentUserId)
        .in("pick_id", page.map((p) => p.id));
      setLikedIds((prev) => [...prev, ...(likes ?? []).map((l) => l.pick_id)]);
    }

    // Evita duplicados si mientras tanto llegó un pick nuevo en vivo
    setPicks((prev) => [...prev, ...page.filter((p) => !prev.some((q) => q.id === p.id))]);
    setHasMore(page.length === FEED_PAGE_SIZE);
    setLoadingMore(false);
  }

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

      {/* Encabezado: título + selector Todos / Siguiendo */}
      <div className="flex items-center justify-between gap-3 flex-wrap pb-2">
        <h1 className="text-white text-2xl font-black tracking-tight flex items-center gap-2">
          <Image src="/icon.png" alt="" width={28} height={28} className="inline-block flex-shrink-0" />
          <span><span style={{ color: "var(--primary-light)" }}>Picks</span> de la comunidad</span>
        </h1>

        {currentUserId && (
          <div
            role="tablist"
            aria-label="Filtrar picks"
            className="flex p-1 rounded-xl"
            style={{ background: "rgba(var(--tint-rgb), 0.06)", border: "1px solid rgba(var(--tint-rgb), 0.10)" }}
          >
            {([["all", "Todos"], ["following", "Siguiendo"]] as const).map(([tab, label]) => {
              const active = feedTab === tab;
              return (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFeedTab(tab)}
                  className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
                  style={active
                    ? { background: "linear-gradient(135deg, var(--primary), var(--primary-strong))", color: "#fff", boxShadow: "0 2px 10px rgba(var(--primary-rgb), 0.28)" }
                    : { color: "var(--text-3)" }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

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
                background: "linear-gradient(135deg, var(--primary), var(--primary-strong))",
                color: "#fff",
                boxShadow: "0 2px 10px rgba(var(--primary-rgb), 0.28)",
                border: "1px solid transparent",
              } : {
                background: isToday ? "rgba(var(--primary-rgb), 0.07)" : "rgba(var(--tint-rgb), 0.04)",
                color: isToday ? "var(--primary-light)" : "var(--text-3)",
                border: isToday ? "1px solid rgba(var(--primary-rgb), 0.18)" : "1px solid rgba(var(--tint-rgb), 0.08)",
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
                background: "linear-gradient(135deg, var(--primary), var(--primary-strong))",
                color: "#fff",
                boxShadow: "0 2px 10px rgba(var(--primary-rgb), 0.28)",
                border: "1px solid transparent",
              } : {
                background: "rgba(var(--tint-rgb), 0.04)",
                color: "var(--text-3)",
                border: "1px solid rgba(var(--tint-rgb), 0.08)",
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
              <p className="font-medium" style={{ color: "var(--text-faint)" }}>
                Aún no sigues a nadie
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>
                Entra a un perfil y dale «+ Seguir»
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl mb-3">🔍</p>
              <p className="font-medium" style={{ color: "var(--text-faint)" }}>No hay picks con estos filtros</p>
              <button
                onClick={() => { setLeague(null); setDateFilter(null); setFeedTab("all"); }}
                className="mt-3 text-sm transition-colors"
                style={{ color: "var(--primary)" }}
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
              userLiked={likedIds.includes(pick.id)}
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

      {/* Paginación: los filtros trabajan sobre los picks ya cargados */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
            style={{ color: "var(--text-2)", background: "rgba(var(--tint-rgb), 0.06)", border: "1px solid rgba(var(--tint-rgb), 0.12)" }}
          >
            {loadingMore ? "Cargando…" : "Cargar más picks"}
          </button>
        </div>
      )}
    </div>
  );
}
