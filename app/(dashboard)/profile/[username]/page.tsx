import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import PickCard from "@/components/picks/pick-card";
import FollowButton from "@/components/profile/follow-button";

type Props = {
  params: Promise<{ username: string }>;
};

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const { data: picks } = await supabase
    .from("picks")
    .select("*, profiles(username)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const { data: userLikes } = await supabase
    .from("likes")
    .select("pick_id")
    .eq("user_id", user!.id);

  const likedPickIds = new Set(userLikes?.map((l) => l.pick_id) ?? []);

  const totalPicks    = picks?.length ?? 0;
  const correctPicks  = picks?.filter((p) => p.status === "correct").length ?? 0;
  const incorrectPicks = picks?.filter((p) => p.status === "incorrect").length ?? 0;
  const pendingPicks  = picks?.filter((p) => p.status === "pending").length ?? 0;
  const resolvedPicks = correctPicks + incorrectPicks;
  const accuracy      = resolvedPicks > 0 ? Math.round((correctPicks / resolvedPicks) * 100) : 0;

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

  const [{ count: followersCount }, { count: followingCount }, { data: followData }] = await Promise.all([
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profile.id),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profile.id),
    supabase.from("follows").select("follower_id").eq("follower_id", user!.id).eq("following_id", profile.id).maybeSingle(),
  ]);

  const isFollowing = !!followData;

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
                background: "linear-gradient(135deg, #22c55e, #15803d)",
                boxShadow: "0 0 14px rgba(34,197,94,0.25), 0 4px 10px rgba(0,0,0,0.25)",
              }}
            >
              {profile.username[0].toUpperCase()}
            </div>

            <div className="pb-1 flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-black" style={{ color: "#f0f6ff" }}>@{profile.username}</h1>
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
                {!isOwnProfile && (
                  <FollowButton
                    currentUserId={user!.id}
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
              currentUserId={user!.id}
              userLiked={likedPickIds.has(pick.id)}
              isFollowing={isOwnProfile ? undefined : isFollowing}
            />
          ))
        )}
      </div>
    </div>
  );
}
