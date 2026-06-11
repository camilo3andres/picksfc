import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import PickCard from "@/components/picks/pick-card";
import FollowButton from "@/components/profile/follow-button";
import VerifiedBadge from "@/components/ui/verified-badge";
import { getAvatarColor } from "@/lib/utils";
import { Music2 } from "lucide-react";

type Props = {
  params: Promise<{ username: string }>;
};


export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  // Ronda 1: user y profile en paralelo (no dependen uno del otro)
  const [authResult, { data: profile }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profiles").select("*").eq("username", username).single(),
  ]);
  const user = authResult.data.user;

  if (!profile) notFound();

  // Ronda 2: todo lo demás en paralelo (ya tenemos profile.id y user.id)
  const [
    { data: picks },
    { data: userLikes },
    { count: followersCount },
    { count: followingCount },
    { data: followData },
  ] = await Promise.all([
    supabase.from("picks").select("*, profiles(username, is_verified)").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(50),
    user ? supabase.from("likes").select("pick_id").eq("user_id", user.id) : Promise.resolve({ data: [] }),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profile.id),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profile.id),
    user
      ? supabase.from("follows").select("follower_id").eq("follower_id", user.id).eq("following_id", profile.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const isFollowing = !!followData;

  const likedPickIds = new Set(userLikes?.map((l) => l.pick_id) ?? []);

  const totalPicks     = picks?.length ?? 0;
  const correctPicks   = picks?.filter((p) => p.status === "correct").length ?? 0;
  const incorrectPicks = picks?.filter((p) => p.status === "incorrect").length ?? 0;
  const pendingPicks   = picks?.filter((p) => p.status === "pending").length ?? 0;
  const resolvedPicks  = correctPicks + incorrectPicks;
  const accuracy       = resolvedPicks > 0 ? Math.round((correctPicks / resolvedPicks) * 100) : 0;

  // Racha actual (picks correctos consecutivos más recientes)
  let streak = 0;
  for (const pick of (picks ?? []).filter((p) => p.status !== "pending")) {
    if (pick.status === "correct") streak++;
    else break;
  }

  // Mejor liga
  const leagueMap: Record<string, { correct: number; total: number }> = {};
  for (const pick of picks ?? []) {
    if (pick.status === "pending") continue;
    if (!leagueMap[pick.league]) leagueMap[pick.league] = { correct: 0, total: 0 };
    leagueMap[pick.league].total++;
    if (pick.status === "correct") leagueMap[pick.league].correct++;
  }
  const bestLeague = Object.entries(leagueMap)
    .filter(([, s]) => s.total >= 2)
    .sort((a, b) => b[1].correct / b[1].total - a[1].correct / a[1].total)[0];

  const isOwnProfile = user?.id === profile.id;

  return (
    <div className="space-y-6">

      {/* HERO — banner del perfil */}
      <div className="rounded-2xl overflow-hidden" style={{
        background: "#162742",
        boxShadow: "0 4px 18px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.05)",
      }}>
        {/* Franja superior decorativa */}
        <div className="h-20" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(34,197,94,0.10) 0%, transparent 55%),
            radial-gradient(circle at 80% 30%, rgba(59,130,246,0.08) 0%, transparent 50%),
            linear-gradient(135deg, #0f1d35 0%, #1a2d4a 50%, #0f1d35 100%)
          `,
          backgroundBlendMode: "soft-light",
        }} />

        {/* Info del usuario */}
        <div className="relative z-10 px-6 pb-6 -mt-10">
          <div className="flex items-end gap-4 mb-5">
            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black flex-shrink-0"
              style={{
                background: getAvatarColor(profile.username).bg,
                boxShadow: `0 0 14px ${getAvatarColor(profile.username).shadow}, 0 4px 10px rgba(0,0,0,0.25)`,
              }}
            >
              {profile.username[0].toUpperCase()}
            </div>

            <div className="pb-1 flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-black inline-flex items-center gap-1.5" style={{ color: "#f0f6ff" }}>
                    @{profile.username}
                    {profile.is_verified && <VerifiedBadge size={18} />}
                  </h1>
                  {streak >= 3 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.30)" }}>
                      🔥 En racha
                    </span>
                  )}
                  {accuracy >= 70 && resolvedPicks >= 5 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }}>
                      ⭐ Top pronosticador
                    </span>
                  )}
                </div>
                {isOwnProfile ? (
                  <a
                    href="/profile/edit"
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: "rgba(255,255,255,0.07)", color: "#8fa8cc", border: "1px solid rgba(255,255,255,0.10)" }}
                  >
                    Editar perfil
                  </a>
                ) : user && (
                  <FollowButton
                    currentUserId={user.id}
                    targetUserId={profile.id}
                    initialFollowing={isFollowing}
                  />
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs" style={{ color: "#5a7a9a" }}>
                  <span className="font-bold" style={{ color: "#8fa8cc" }}>{followersCount ?? 0}</span> seguidores
                </span>
                <span className="text-xs" style={{ color: "#5a7a9a" }}>
                  <span className="font-bold" style={{ color: "#8fa8cc" }}>{followingCount ?? 0}</span> siguiendo
                </span>
              </div>
              {profile.bio && (
                <p className="text-sm mt-0.5" style={{ color: "#6b87ab" }}>{profile.bio}</p>
              )}

              {/* Redes sociales */}
              {(profile.instagram || profile.tiktok || profile.twitter || profile.telegram) && (
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {profile.instagram && (
                    <a
                      href={`https://instagram.com/${profile.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full transition-opacity hover:opacity-75"
                      style={{ background: "rgba(225,48,108,0.12)", color: "#e1306c", border: "1px solid rgba(225,48,108,0.22)" }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <circle cx="12" cy="12" r="3.5"/>
                        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                      </svg>
                      @{profile.instagram}
                    </a>
                  )}
                  {profile.tiktok && (
                    <a
                      href={`https://tiktok.com/@${profile.tiktok}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full transition-opacity hover:opacity-75"
                      style={{ background: "rgba(255,255,255,0.07)", color: "#d1d5db", border: "1px solid rgba(255,255,255,0.12)" }}
                    >
                      <Music2 size={10} />
                      @{profile.tiktok}
                    </a>
                  )}

                  {profile.twitter && (
                    <a
                      href={`https://x.com/${profile.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full transition-opacity hover:opacity-75"
                      style={{ background: "rgba(29,161,242,0.10)", color: "#1da1f2", border: "1px solid rgba(29,161,242,0.22)" }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      @{profile.twitter}
                    </a>
                  )}
                  {profile.telegram && (
                    <a
                      href={`https://t.me/${profile.telegram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full transition-opacity hover:opacity-75"
                      style={{ background: "rgba(0,136,204,0.12)", color: "#29b6f6", border: "1px solid rgba(0,136,204,0.25)" }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.927 14.14l-2.955-.924c-.64-.203-.658-.64.136-.953l11.57-4.461c.537-.194 1.006.131.832.94z"/>
                      </svg>
                      @{profile.telegram}
                    </a>
                  )}
                </div>
              )}

              <p className="text-xs mt-0.5" style={{ color: "#5a7a9a" }}>
                Miembro desde {new Date(profile.created_at).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Stats principales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: totalPicks,     label: "Total picks",  color: "#8fa8cc", bg: "rgba(143,168,204,0.08)", border: "rgba(143,168,204,0.12)" },
              { value: correctPicks,   label: "Correctos",    color: "#4ade80", bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.15)"  },
              { value: incorrectPicks, label: "Incorrectos",  color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.15)" },
              { value: pendingPicks,   label: "Pendientes",   color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.15)"  },
            ].map(({ value, label, color, bg, border }) => (
              <div key={label} className="rounded-xl px-3 py-3 text-center" style={{ background: bg, border: `1px solid ${border}` }}>
                <p className="text-2xl font-black" style={{ color }}>{value}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "#5a7a9a" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Precisión + racha + mejor liga */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">

            {/* Barra de precisión */}
            <div className="sm:col-span-1 rounded-xl px-4 py-3" style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: "#6b87ab" }}>Precisión</span>
                <span className="text-lg font-black" style={{
                  color: accuracy >= 70 ? "#4ade80" : accuracy >= 50 ? "#fbbf24" : "#f87171",
                }}>{accuracy}%</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full transition-all duration-700" style={{
                  width: `${accuracy}%`,
                  background: accuracy >= 70
                    ? "linear-gradient(90deg, #22c55e, #4ade80)"
                    : accuracy >= 50
                    ? "linear-gradient(90deg, #d97706, #fbbf24)"
                    : "linear-gradient(90deg, #dc2626, #f87171)",
                }} />
              </div>
              <p className="text-xs mt-1.5" style={{ color: "#5a7a9a" }}>
                {resolvedPicks} picks resueltos
              </p>
            </div>

            {/* Racha */}
            <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{
              background: streak >= 3 ? "rgba(251,191,36,0.07)" : "rgba(255,255,255,0.03)",
              border: streak >= 3 ? "1px solid rgba(251,191,36,0.18)" : "1px solid rgba(255,255,255,0.06)",
            }}>
              <span className="text-2xl">{streak >= 3 ? "🔥" : streak >= 1 ? "⚡" : "💤"}</span>
              <div>
                <p className="text-lg font-black" style={{ color: streak >= 3 ? "#fbbf24" : "#6b87ab" }}>
                  {streak === 0 ? "Sin racha" : `${streak} correctos`}
                </p>
                <p className="text-xs" style={{ color: "#5a7a9a" }}>
                  {streak === 0 ? "Racha actual" : "en racha"}
                </p>
              </div>
            </div>

            {/* Mejor liga */}
            <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{
              background: bestLeague ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.03)",
              border: bestLeague ? "1px solid rgba(34,197,94,0.14)" : "1px solid rgba(255,255,255,0.06)",
            }}>
              <span className="text-2xl">🏆</span>
              <div className="min-w-0">
                {bestLeague ? (
                  <>
                    <p className="text-sm font-black truncate" style={{ color: "#4ade80" }}>{bestLeague[0]}</p>
                    <p className="text-xs" style={{ color: "#5a7a9a" }}>
                      {bestLeague[1].correct}/{bestLeague[1].total} correctos
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold" style={{ color: "#5a7a9a" }}>Sin datos aún</p>
                    <p className="text-xs" style={{ color: "#5a7a9a" }}>Mejor liga</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Picks del usuario */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h2 className="font-black text-lg" style={{ color: "#f0f6ff" }}>
            Picks de <span style={{ color: "#4ade80" }}>@{profile.username}</span>
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{
            background: "rgba(255,255,255,0.05)",
            color: "#6b87ab",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            {totalPicks} picks
          </span>
        </div>

        {totalPicks === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}>
            <p className="text-4xl mb-3">⚽</p>
            <p className="font-semibold" style={{ color: "#4a6080" }}>
              {isOwnProfile ? "Aún no publicaste picks" : "Este usuario aún no publicó picks"}
            </p>
            {isOwnProfile && (
              <a href="/picks/new" className="inline-block mt-3 text-sm font-bold transition-colors" style={{ color: "#4ade80" }}>
                + Publicar primer pick →
              </a>
            )}
          </div>
        ) : (
          picks?.map((pick) => (
            <PickCard
              key={pick.id}
              pick={pick as any}
              currentUserId={user?.id ?? null}
              userLiked={likedPickIds.has(pick.id)}
              isFollowing={isOwnProfile ? undefined : isFollowing}
            />
          ))
        )}
      </div>
    </div>
  );
}
