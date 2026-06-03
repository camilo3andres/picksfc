"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { Pick } from "@/lib/types";
import { getAvatarColor } from "@/lib/utils";
import CommentsSection from "./comments-section";
import VerifiedBadge from "@/components/ui/verified-badge";

type Props = {
  pick: Pick & { profiles: { username: string; is_verified?: boolean } };
  currentUserId: string | null;
  userLiked: boolean;
  defaultShowComments?: boolean;
  isFollowing?: boolean;
  streak?: number;
  onFollowChange?: (userId: string, nowFollowing: boolean) => void;
  onDelete?: (pickId: string) => void;
};

const PREDICTION_LABEL = {
  home:      "Gana Local",
  draw:      "Empate",
  away:      "Gana Visitante",
  home_draw: "Local o Empate",
  away_draw: "Visitante o Empate",
};

const PREDICTION_STYLE = {
  home:      { background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", border: "1px solid rgba(96,165,250,0.3)",   boxShadow: "0 2px 12px rgba(37,99,235,0.35)"  },
  draw:      { background: "linear-gradient(135deg, #d97706, #b45309)", color: "#fff", border: "1px solid rgba(251,191,36,0.3)",   boxShadow: "0 2px 12px rgba(217,119,6,0.35)"   },
  away:      { background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", border: "1px solid rgba(167,139,250,0.3)", boxShadow: "0 2px 12px rgba(124,58,237,0.35)"  },
  home_draw: { background: "linear-gradient(135deg, #0891b2, #0e7490)", color: "#fff", border: "1px solid rgba(34,211,238,0.3)",   boxShadow: "0 2px 12px rgba(8,145,178,0.35)"   },
  away_draw: { background: "linear-gradient(135deg, #059669, #047857)", color: "#fff", border: "1px solid rgba(52,211,153,0.3)",   boxShadow: "0 2px 12px rgba(5,150,105,0.35)"   },
};

const LEAGUE_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  "UEFA Champions League":  { color: "#93c5fd", bg: "rgba(37,99,235,0.12)",  border: "rgba(59,130,246,0.25)" },
  "UEFA Europa League":     { color: "#fb923c", bg: "rgba(234,88,12,0.12)",  border: "rgba(249,115,22,0.25)" },
  "UEFA Conference League": { color: "#2dd4bf", bg: "rgba(13,148,136,0.12)", border: "rgba(45,212,191,0.25)" },
  "Premier League":         { color: "#c084fc", bg: "rgba(124,58,237,0.12)", border: "rgba(167,139,250,0.25)" },
  "La Liga":                { color: "#f87171", bg: "rgba(220,38,38,0.12)",  border: "rgba(248,113,113,0.25)" },
  "Bundesliga":             { color: "#fca5a5", bg: "rgba(185,28,28,0.12)",  border: "rgba(252,165,165,0.25)" },
  "Serie A":                { color: "#60a5fa", bg: "rgba(29,78,216,0.12)",  border: "rgba(96,165,250,0.25)" },
  "Ligue 1":                { color: "#38bdf8", bg: "rgba(14,165,233,0.12)", border: "rgba(56,189,248,0.25)" },
  "Liga Dimayor":           { color: "#4ade80", bg: "rgba(22,163,74,0.12)",  border: "rgba(74,222,128,0.25)" },
  "FIFA World Cup":         { color: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.25)" },
  "UEFA Champions League 2024/25": { color: "#93c5fd", bg: "rgba(37,99,235,0.12)", border: "rgba(59,130,246,0.25)" },
};

const STATUS_CONFIG = {
  pending: {
    glow: "0 8px 32px rgba(0,0,0,0.40), 0 0 0 1px rgba(255,255,255,0.05)",
    glowHover: "0 16px 44px rgba(0,0,0,0.50), 0 0 0 1px rgba(255,255,255,0.09)",
    badge: { background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.25)" },
    label: "⏳ Pendiente",
  },
  correct: {
    glow: "0 8px 32px rgba(0,0,0,0.40), 0 0 18px rgba(34,197,94,0.09), 0 0 0 1px rgba(34,197,94,0.14)",
    glowHover: "0 16px 44px rgba(0,0,0,0.50), 0 0 26px rgba(34,197,94,0.14), 0 0 0 1px rgba(34,197,94,0.20)",
    badge: { background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.28)" },
    label: "✅ Correcto",
  },
  incorrect: {
    glow: "0 8px 32px rgba(0,0,0,0.40), 0 0 18px rgba(239,68,68,0.08), 0 0 0 1px rgba(239,68,68,0.12)",
    glowHover: "0 16px 44px rgba(0,0,0,0.50), 0 0 26px rgba(239,68,68,0.13), 0 0 0 1px rgba(239,68,68,0.18)",
    badge: { background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" },
    label: "❌ Incorrecto",
  },
};

export default function PickCard({ pick, currentUserId, userLiked, defaultShowComments = false, isFollowing: initialIsFollowing, streak = 0, onFollowChange, onDelete }: Props) {
  const [liked, setLiked]               = useState(userLiked);
  const [likesCount, setLikesCount]     = useState(pick.likes_count);
  const [commentsCount, setCommentsCount] = useState(pick.comments_count);
  const [animating, setAnimating]       = useState(false);
  const [showComments, setShowComments] = useState(defaultShowComments);
  const [following, setFollowing]       = useState(initialIsFollowing ?? false);
  const [copied, setCopied]             = useState(false);
  useEffect(() => { setFollowing(initialIsFollowing ?? false); }, [initialIsFollowing]);
  const [followAnim, setFollowAnim]     = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const status   = STATUS_CONFIG[pick.status];
  const league   = LEAGUE_STYLE[pick.league] ?? { color: "#8fa8cc", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.10)" };
  const hasResult = pick.home_score !== null && pick.away_score !== null;

  async function handleFollow() {
    if (!currentUserId) { router.push("/login"); return; }
    setFollowAnim(true);
    setTimeout(() => setFollowAnim(false), 400);
    const { data } = await supabase.rpc("toggle_follow", {
      p_follower_id: currentUserId,
      p_following_id: pick.user_id,
    });
    if (data) {
      setFollowing(data.following);
      onFollowChange?.(pick.user_id, data.following);
    }
    router.refresh();
  }

  async function handleShare() {
    const url = `${window.location.origin}/picks/${pick.id}`;
    if (navigator.share) {
      await navigator.share({ title: `Pick de @${pick.profiles.username} en PicksFC`, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleDelete() {
    if (!confirm("¿Seguro que querés borrar este pick?")) return;
    await supabase.from("picks").delete().eq("id", pick.id);
    onDelete?.(pick.id);
    router.refresh();
  }

  async function handleLike() {
    if (!currentUserId) { router.push("/login"); return; }
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
    const { data } = await supabase.rpc("toggle_like", {
      p_pick_id: pick.id,
      p_user_id: currentUserId,
    });
    if (data?.[0]) {
      setLiked(data[0].liked);
      setLikesCount(data[0].new_count);
    }
  }

  return (
    <div
      className="rounded-2xl overflow-hidden group"
      style={{
        background: "linear-gradient(160deg, #1f2f48 0%, #182438 100%)",
        boxShadow: status.glow,
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        willChange: "transform",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(-4px)";
        el.style.boxShadow = status.glowHover;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = status.glow;
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3 gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
            style={{ background: getAvatarColor(pick.profiles.username).bg, boxShadow: `0 2px 8px ${getAvatarColor(pick.profiles.username).shadow}` }}
          >
            {pick.profiles.username[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 text-white text-sm font-bold">
              @{pick.profiles.username}
              {pick.profiles.is_verified && <VerifiedBadge size={15} />}
              {streak >= 3 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
                  🔥 {streak}
                </span>
              )}
            </span>
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
              <Link href={`/profile/${pick.profiles.username}`} className="text-green-400/70 hover:text-green-400 text-xs transition-colors leading-tight">
                Ver perfil →
              </Link>
              {pick.user_id !== currentUserId && initialIsFollowing !== undefined && (
                following ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                      style={{ color: "#4ade80", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.20)" }}>
                      Siguiendo ✓
                    </span>
                    <button
                      onClick={handleFollow}
                      className="text-xs font-semibold px-2 py-0.5 rounded-lg transition-all"
                      style={{ color: "#f87171", background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.18)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(248,113,113,0.14)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(248,113,113,0.07)"; }}
                    >
                      Dejar de seguir
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleFollow}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
                    style={{ color: "#8fa8cc", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.color = "#4ade80";
                      el.style.background = "rgba(74,222,128,0.08)";
                      el.style.borderColor = "rgba(74,222,128,0.20)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.color = "#8fa8cc";
                      el.style.background = "rgba(255,255,255,0.04)";
                      el.style.borderColor = "rgba(255,255,255,0.08)";
                    }}
                  >
                    + Seguir
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={status.badge}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Liga */}
      <div className="px-4 pb-3">
        <span
          className="text-xs px-2.5 py-1 rounded-full font-semibold"
          style={{ color: league.color, background: league.bg, border: `1px solid ${league.border}` }}
        >
          🏆 {pick.league}
        </span>
      </div>

      {/* Match card */}
      <div className="mx-3 mb-3 rounded-2xl overflow-hidden" style={{
        background: "linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div className="flex items-center justify-between px-3 pt-4 pb-3 gap-1">

          {/* Home */}
          <div className="flex-1 flex flex-col items-center gap-2 text-center min-w-0">
            {pick.home_team_logo ? (
              <Image src={pick.home_team_logo} alt={pick.home_team} width={48} height={48}
                className="object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-lg" unoptimized />
            ) : (
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                style={{ background: "rgba(255,255,255,0.06)" }}>⚽</div>
            )}
            <p className="text-white font-black text-xs sm:text-sm leading-tight truncate w-full px-1">{pick.home_team}</p>
            <p className="text-[10px] font-semibold" style={{ color: "#6b87ab" }}>Local</p>
          </div>

          {/* Score / VS */}
          <div className="flex flex-col items-center px-1 flex-shrink-0">
            {hasResult ? (
              <div className="score-pop text-center">
                <div className="flex items-center gap-1.5">
                  <span className="font-black tabular-nums leading-none text-2xl sm:text-3xl" style={{ color: "#f0f6ff", textShadow: "0 0 16px rgba(255,255,255,0.12)" }}>
                    {pick.home_score}
                  </span>
                  <span className="font-black text-base" style={{ color: "#7a9ab8" }}>-</span>
                  <span className="font-black tabular-nums leading-none text-2xl sm:text-3xl" style={{ color: "#f0f6ff", textShadow: "0 0 16px rgba(255,255,255,0.12)" }}>
                    {pick.away_score}
                  </span>
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase mt-1 block" style={{ color: "#6b87ab" }}>Final</span>
              </div>
            ) : (
              <div className="text-center">
                <span className="font-black" style={{ fontSize: "1rem", color: "#7a9ab8", letterSpacing: "0.12em" }}>VS</span>
                <span className="block text-[10px] mt-1" style={{ color: "#7a9ab8" }}>
                  {new Date(pick.match_date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                </span>
              </div>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 flex flex-col items-center gap-2 text-center min-w-0">
            {pick.away_team_logo ? (
              <Image src={pick.away_team_logo} alt={pick.away_team} width={48} height={48}
                className="object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-lg" unoptimized />
            ) : (
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                style={{ background: "rgba(255,255,255,0.06)" }}>⚽</div>
            )}
            <p className="text-white font-black text-xs sm:text-sm leading-tight truncate w-full px-1">{pick.away_team}</p>
            <p className="text-[10px] font-semibold" style={{ color: "#6b87ab" }}>Visitante</p>
          </div>
        </div>

        {/* Predicción */}
        <div className="flex justify-center pb-4">
          <span className="px-4 py-1.5 rounded-full text-xs font-black tracking-wide"
            style={PREDICTION_STYLE[pick.prediction]}>
            {PREDICTION_LABEL[pick.prediction]}
          </span>
        </div>
      </div>

      {/* Razonamiento */}
      {pick.reasoning && (
        <div className="px-4 mb-3">
          <p className="text-sm leading-relaxed pl-3 italic"
            style={{ color: "#6b87ab", borderLeft: "2px solid rgba(255,255,255,0.08)" }}>
            "{pick.reasoning}"
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center flex-wrap px-4 pb-4 pt-3 gap-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition-all duration-200 px-2.5 py-1 rounded-lg ${animating ? "scale-125" : "scale-100"}`}
          style={{ color: liked ? "#4ade80" : "#4a6080" }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.color = "#4ade80";
            el.style.background = "rgba(74,222,128,0.08)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.color = liked ? "#4ade80" : "#4a6080";
            el.style.background = "transparent";
          }}
        >
          <span className="text-xl">{liked ? "⚽" : "🤍"}</span>
          <span className="text-sm font-bold">{likesCount}</span>
        </button>

        <button
          onClick={() => { if (!currentUserId) { router.push("/login"); return; } setShowComments((v) => !v); }}
          className="flex items-center gap-1.5 text-sm transition-all duration-200 px-2.5 py-1 rounded-lg"
          style={{ color: showComments ? "#4ade80" : "#4a6080" }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.color = "#4ade80";
            el.style.background = "rgba(74,222,128,0.08)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.color = showComments ? "#4ade80" : "#4a6080";
            el.style.background = "transparent";
          }}
        >
          <span>💬</span>
          <span className="font-semibold">{commentsCount > 0 ? commentsCount : "Comentar"}</span>
        </button>

        {pick.user_id === currentUserId && (
          <button
            onClick={handleDelete}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
            style={{ color: "#6b87ab", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#f87171";
              e.currentTarget.style.background = "rgba(248,113,113,0.08)";
              e.currentTarget.style.borderColor = "rgba(248,113,113,0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#6b87ab";
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
            }}
          >
            🗑 Borrar
          </button>
        )}

        <button
          onClick={handleShare}
          className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
          style={{ color: copied ? "#4ade80" : "#6b87ab", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          onMouseEnter={(e) => { if (!copied) { e.currentTarget.style.color = "#8fa8cc"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; } }}
          onMouseLeave={(e) => { if (!copied) { e.currentTarget.style.color = "#6b87ab"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; } }}
        >
          {copied ? "✓ Copiado" : "🔗 Compartir"}
        </button>

        <Link
          href={`/picks/${pick.id}`}
          className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
          style={{ color: "#8fa8cc", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.color = "#4ade80";
            el.style.background = "rgba(74,222,128,0.08)";
            el.style.borderColor = "rgba(74,222,128,0.20)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.color = "#8fa8cc";
            el.style.background = "rgba(255,255,255,0.04)";
            el.style.borderColor = "rgba(255,255,255,0.08)";
          }}
        >
          Ver pick →
        </Link>
      </div>

      {showComments && currentUserId && (
        <CommentsSection
          pickId={pick.id}
          currentUserId={currentUserId}
          onCountChange={(delta) => setCommentsCount((c) => c + delta)}
        />
      )}
    </div>
  );
}
