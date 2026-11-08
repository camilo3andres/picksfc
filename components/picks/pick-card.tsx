"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { Pick } from "@/lib/types";
import { parseLocalDate } from "@/lib/utils";
import { PREDICTION_LABEL } from "@/lib/picks";
import CommentsSection from "./comments-section";
import VerifiedBadge from "@/components/ui/verified-badge";
import { CheckIcon, CommentIcon, HeartIcon, ShareIcon } from "@/components/ui/icons";
import Avatar from "@/components/ui/avatar";
import FollowToggle from "@/components/ui/follow-toggle";
import PickOptionsMenu from "./pick-options-menu";

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
  "Liga Dimayor":           { color: "var(--success)", bg: "rgba(var(--success-strong-rgb), 0.12)",  border: "rgba(var(--success-rgb), 0.25)" },
  "FIFA World Cup":         { color: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.25)" },
  "UEFA Champions League 2024/25": { color: "#93c5fd", bg: "rgba(37,99,235,0.12)", border: "rgba(59,130,246,0.25)" },
};

const STATUS_CONFIG = {
  pending: {
    glow: "0 8px 32px rgba(0,0,0,0.40), 0 0 0 1px rgba(var(--tint-rgb), 0.05)",
    glowHover: "0 16px 44px rgba(0,0,0,0.50), 0 0 0 1px rgba(var(--tint-rgb), 0.09)",
    badge: { background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.25)" },
    label: "⏳ Pendiente",
  },
  correct: {
    glow: "0 8px 32px rgba(0,0,0,0.40), 0 0 18px rgba(var(--success-strong-rgb), 0.09), 0 0 0 1px rgba(var(--success-strong-rgb), 0.14)",
    glowHover: "0 16px 44px rgba(0,0,0,0.50), 0 0 26px rgba(var(--success-strong-rgb), 0.14), 0 0 0 1px rgba(var(--success-strong-rgb), 0.20)",
    badge: { background: "rgba(var(--success-strong-rgb), 0.12)", color: "var(--success)", border: "1px solid rgba(var(--success-strong-rgb), 0.28)" },
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
  const [sharing, setSharing]           = useState(false);
  // true mientras un like viaja al servidor: evita mandar dos a la vez con doble clic
  const likePending = useRef(false);

  // Cuando llega un dato nuevo en vivo (otro usuario dio like o comentó), los
  // contadores se actualizan. Es el patrón que recomienda React para "ajustar
  // estado cuando cambia una prop", sin useEffect: https://react.dev/learn/you-might-not-need-an-effect
  const [synced, setSynced] = useState({ likes: pick.likes_count, comments: pick.comments_count, following: initialIsFollowing });
  if (synced.likes !== pick.likes_count || synced.comments !== pick.comments_count || synced.following !== initialIsFollowing) {
    setSynced({ likes: pick.likes_count, comments: pick.comments_count, following: initialIsFollowing });
    if (synced.likes !== pick.likes_count) setLikesCount(pick.likes_count);
    if (synced.comments !== pick.comments_count) setCommentsCount(pick.comments_count);
    if (synced.following !== initialIsFollowing) setFollowing(initialIsFollowing ?? false);
  }

  const router = useRouter();
  const supabase = createClient();

  const status   = STATUS_CONFIG[pick.status];
  const league   = LEAGUE_STYLE[pick.league] ?? { color: "var(--text-2)", bg: "rgba(var(--tint-rgb), 0.05)", border: "rgba(var(--tint-rgb), 0.10)" };
  const hasResult = pick.home_score !== null && pick.away_score !== null;

  async function handleFollow() {
    if (!currentUserId) { router.push("/login"); return; }
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

  // Compartir: en celular manda la imagen del pick + el link (WhatsApp, historias...).
  // Si el navegador no puede compartir archivos, comparte solo el link; y si no puede
  // compartir nada (computador), copia el link — al pegarlo, WhatsApp muestra la imagen igual.
  async function handleShare() {
    const url = `${window.location.origin}/picks/${pick.id}`;
    const text = `Mi pick para ${pick.home_team} vs ${pick.away_team} en PicksFC`;
    setSharing(true);

    try {
      if (navigator.share) {
        const file = await fetchShareImage();
        if (file && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], text: `${text}\n${url}` });
        } else {
          await navigator.share({ title: text, url });
        }
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // AbortError = el usuario cerró el menú de compartir; no es un error real
      if ((err as Error).name !== "AbortError") console.error("No se pudo compartir:", err);
    } finally {
      setSharing(false);
    }
  }

  async function fetchShareImage(): Promise<File | null> {
    try {
      const res = await fetch(`/api/picks/${pick.id}/image`);
      if (!res.ok) return null;
      const blob = await res.blob();
      return new File([blob], `pick-${pick.home_team}-vs-${pick.away_team}.png`.replace(/\s+/g, "-"), { type: "image/png" });
    } catch {
      return null;
    }
  }

  async function handleDelete() {
    if (!confirm("¿Seguro que quieres eliminar este pick? No se puede deshacer.")) return;
    await supabase.from("picks").delete().eq("id", pick.id);
    onDelete?.(pick.id);
    router.refresh();
  }

  async function handleLike() {
    if (!currentUserId) { router.push("/login"); return; }
    if (likePending.current) return;
    likePending.current = true;

    // Actualización optimista: el corazón y el número cambian YA, sin esperar
    // al servidor (~0.5 s). Guardamos el estado anterior por si hay que revertir.
    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!prevLiked);
    setLikesCount(prevCount + (prevLiked ? -1 : 1));
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    const { data, error } = await supabase.rpc("toggle_like", {
      p_pick_id: pick.id,
      p_user_id: currentUserId,
    });

    if (error || !data?.[0]) {
      // Falló: volvemos a como estaba antes del clic
      setLiked(prevLiked);
      setLikesCount(prevCount);
    } else {
      // Éxito: usamos el valor real del servidor (por si otro usuario dio like a la vez)
      setLiked(data[0].liked);
      setLikesCount(data[0].new_count);
    }
    likePending.current = false;
  }

  return (
    <div
      className="rounded-2xl overflow-hidden group"
      style={{
        background: "linear-gradient(160deg, var(--card-top) 0%, var(--card-bottom) 100%)",
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
          <Avatar username={pick.profiles.username} size={36} glow />
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
              <Link href={`/profile/${pick.profiles.username}`} className="text-xs transition-colors leading-tight hover:underline" style={{ color: "var(--primary-light)" }}>
                Ver perfil →
              </Link>
              {pick.user_id !== currentUserId && initialIsFollowing !== undefined && (
                <FollowToggle following={following} username={pick.profiles.username} onToggle={handleFollow} />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={status.badge}>
            {status.label}
          </span>
          {pick.user_id === currentUserId && <PickOptionsMenu onDelete={handleDelete} />}
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
        background: "linear-gradient(160deg, rgba(var(--tint-rgb), 0.04) 0%, rgba(var(--tint-rgb), 0.02) 100%)",
        border: "1px solid rgba(var(--tint-rgb), 0.07)",
      }}>
        <div className="flex items-center justify-between px-3 pt-4 pb-3 gap-1">

          {/* Home */}
          <div className="flex-1 flex flex-col items-center gap-2 text-center min-w-0">
            {pick.home_team_logo ? (
              <Image src={pick.home_team_logo} alt={pick.home_team} width={48} height={48}
                className="object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-lg" unoptimized />
            ) : (
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                style={{ background: "rgba(var(--tint-rgb), 0.06)" }}>⚽</div>
            )}
            <p className="text-white font-black text-xs sm:text-sm leading-tight truncate w-full px-1">{pick.home_team}</p>
            <p className="text-[10px] font-semibold" style={{ color: "var(--text-3)" }}>Local</p>
          </div>

          {/* Score / VS */}
          <div className="flex flex-col items-center px-1 flex-shrink-0">
            {hasResult ? (
              <div className="score-pop text-center">
                <div className="flex items-center gap-1.5">
                  <span className="font-black tabular-nums leading-none text-2xl sm:text-3xl" style={{ color: "var(--text)", textShadow: "0 0 16px rgba(var(--tint-rgb), 0.12)" }}>
                    {pick.home_score}
                  </span>
                  <span className="font-black text-base" style={{ color: "#7a9ab8" }}>-</span>
                  <span className="font-black tabular-nums leading-none text-2xl sm:text-3xl" style={{ color: "var(--text)", textShadow: "0 0 16px rgba(var(--tint-rgb), 0.12)" }}>
                    {pick.away_score}
                  </span>
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase mt-1 block" style={{ color: "var(--text-3)" }}>Final</span>
              </div>
            ) : (
              <div className="text-center">
                <span className="font-black" style={{ fontSize: "1rem", color: "#7a9ab8", letterSpacing: "0.12em" }}>VS</span>
                <span className="block text-[10px] mt-1" style={{ color: "#7a9ab8" }}>
                  {parseLocalDate(pick.match_date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
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
                style={{ background: "rgba(var(--tint-rgb), 0.06)" }}>⚽</div>
            )}
            <p className="text-white font-black text-xs sm:text-sm leading-tight truncate w-full px-1">{pick.away_team}</p>
            <p className="text-[10px] font-semibold" style={{ color: "var(--text-3)" }}>Visitante</p>
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
          <p className="text-sm leading-relaxed px-3 py-2 rounded-xl"
            style={{
              color: "var(--text-2)",
              background: "rgba(var(--tint-rgb), 0.04)",
              border: "1px solid rgba(var(--tint-rgb), 0.07)",
              fontWeight: 500,
            }}>
            {pick.reasoning}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center flex-wrap px-4 pb-4 pt-3 gap-2"
        style={{ borderTop: "1px solid rgba(var(--tint-rgb), 0.05)" }}>
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition-all duration-200 px-2.5 py-1 rounded-lg ${animating ? "scale-125" : "scale-100"} ${liked ? "like-glow" : ""}`}
          aria-label={liked ? "Quitar me gusta" : "Me gusta"}
          aria-pressed={liked}
          style={{ color: liked ? "var(--like)" : "var(--text-faint)" }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.color = "var(--like)";
            el.style.background = "rgba(var(--like-rgb), 0.08)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.color = liked ? "var(--like)" : "var(--text-faint)";
            el.style.background = "transparent";
          }}
        >
          <HeartIcon size={20} filled={liked} />
          <span className="text-sm font-bold">{likesCount}</span>
        </button>

        <button
          onClick={() => { if (!currentUserId) { router.push("/login"); return; } setShowComments((v) => !v); }}
          className="flex items-center gap-1.5 text-sm transition-all duration-200 px-2.5 py-1 rounded-lg"
          style={{ color: showComments ? "var(--primary-light)" : "var(--text-faint)" }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.color = "var(--primary-light)";
            el.style.background = "rgba(var(--primary-light-rgb), 0.08)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.color = showComments ? "var(--primary-light)" : "var(--text-faint)";
            el.style.background = "transparent";
          }}
        >
          <CommentIcon size={20} />
          <span className="font-semibold">{commentsCount > 0 ? commentsCount : "Comentar"}</span>
        </button>

        <button
          onClick={handleShare}
          disabled={sharing}
          className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
          style={{ color: copied ? "var(--primary-light)" : "var(--text-3)", background: "rgba(var(--tint-rgb), 0.03)", border: "1px solid rgba(var(--tint-rgb), 0.06)" }}
          onMouseEnter={(e) => { if (!copied) { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.background = "rgba(var(--tint-rgb), 0.06)"; } }}
          onMouseLeave={(e) => { if (!copied) { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.background = "rgba(var(--tint-rgb), 0.03)"; } }}
        >
          <span className="inline-flex items-center gap-1.5">
            {copied ? <><CheckIcon size={13} /> Link copiado</> : sharing ? <>Preparando…</> : <><ShareIcon size={13} /> Compartir</>}
          </span>
        </button>

        <Link
          href={`/picks/${pick.id}`}
          className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
          style={{ color: "var(--text-2)", background: "rgba(var(--tint-rgb), 0.04)", border: "1px solid rgba(var(--tint-rgb), 0.08)" }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.color = "var(--primary-light)";
            el.style.background = "rgba(var(--primary-light-rgb), 0.08)";
            el.style.borderColor = "rgba(var(--primary-light-rgb), 0.20)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.color = "var(--text-2)";
            el.style.background = "rgba(var(--tint-rgb), 0.04)";
            el.style.borderColor = "rgba(var(--tint-rgb), 0.08)";
          }}
        >
          Ver pick →
        </Link>
      </div>

      {/* Desplegable estilo Instagram: link para abrir los comentarios */}
      {!showComments && commentsCount > 0 && (
        <button
          onClick={() => { if (!currentUserId) { router.push("/login"); return; } setShowComments(true); }}
          className="block px-4 pb-4 -mt-1 text-sm font-semibold hover:underline"
          style={{ color: "var(--text-3)" }}
        >
          {commentsCount === 1 ? "Ver 1 comentario" : `Ver los ${commentsCount} comentarios`}
        </button>
      )}

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
