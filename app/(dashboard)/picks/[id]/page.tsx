import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient, getSessionUser } from "@/lib/supabase-server";
import LivePickList from "@/components/picks/live-pick-list";
import type { LivePick } from "@/lib/use-live-picks";
import Avatar from "@/components/ui/avatar";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PickDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const user = await getSessionUser();

  const { data: pick } = await supabase
    .from("picks")
    .select("*, profiles(username)")
    .eq("id", id)
    .single();

  if (!pick) notFound();

  const { data: userLikes } = user
    ? await supabase.from("likes").select("pick_id").eq("user_id", user.id).eq("pick_id", id)
    : { data: [] };

  const userLiked = (userLikes?.length ?? 0) > 0;

  // Stats del autor
  const { data: authorPicks } = await supabase
    .from("picks")
    .select("status")
    .eq("user_id", pick.user_id);

  const total     = authorPicks?.length ?? 0;
  const correct   = authorPicks?.filter(p => p.status === "correct").length ?? 0;
  const resolved  = authorPicks?.filter(p => p.status !== "pending").length ?? 0;
  const accuracy  = resolved > 0 ? Math.round((correct / resolved) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Back */}
      <Link
        href="/feed"
        className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
        style={{ color: "var(--text-muted)" }}
      >
        ← Volver al feed
      </Link>

      {/* Pick */}
      <LivePickList
        picks={[pick as LivePick]}
        channel={`pick-${pick.id}`}
        filter={`id=eq.${pick.id}`}
        acceptInserts={false}
        currentUserId={user?.id ?? null}
        likedIds={userLiked ? [pick.id] : []}
        defaultShowComments
      />

      {/* Autor */}
      <div className="rounded-2xl px-5 py-4" style={{
        background: "var(--surface)",
        border: "1px solid rgba(var(--tint-rgb), 0.06)",
      }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
          Sobre el autor
        </p>
        <div className="flex items-center gap-3 mb-4">
          <Avatar username={pick.profiles.username} size={40} glow />
          <div>
            <p className="font-black text-sm" style={{ color: "var(--text)" }}>@{pick.profiles.username}</p>
            <Link
              href={`/profile/${pick.profiles.username}`}
              className="text-xs transition-colors"
              style={{ color: "var(--primary-light)" }}
            >
              Ver perfil completo →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Total picks", value: total,    color: "var(--text-2)" },
            { label: "Correctos",   value: correct,  color: "var(--success)" },
            { label: "Precisión",   value: `${accuracy}%`, color: accuracy >= 70 ? "var(--success)" : accuracy >= 50 ? "#fbbf24" : "#f87171" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl px-3 py-2.5 text-center" style={{
              background: "rgba(var(--tint-rgb), 0.03)",
              border: "1px solid rgba(var(--tint-rgb), 0.06)",
            }}>
              <p className="text-lg font-black" style={{ color }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
