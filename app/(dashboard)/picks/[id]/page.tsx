import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import PickCard from "@/components/picks/pick-card";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PickDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: pick } = await supabase
    .from("picks")
    .select("*, profiles(username)")
    .eq("id", id)
    .single();

  if (!pick) notFound();

  const { data: userLikes } = await supabase
    .from("likes")
    .select("pick_id")
    .eq("user_id", user!.id)
    .eq("pick_id", id);

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
        style={{ color: "#5a7a9a" }}
      >
        ← Volver al feed
      </Link>

      {/* Pick */}
      <PickCard
        pick={pick as any}
        currentUserId={user!.id}
        userLiked={userLiked}
        defaultShowComments={true}
      />

      {/* Autor */}
      <div className="rounded-2xl px-5 py-4" style={{
        background: "#162742",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#5a7a9a" }}>
          Sobre el autor
        </p>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black"
            style={{ background: "linear-gradient(135deg, #22c55e, #15803d)" }}
          >
            {pick.profiles.username[0].toUpperCase()}
          </div>
          <div>
            <p className="font-black text-sm" style={{ color: "#f0f6ff" }}>@{pick.profiles.username}</p>
            <Link
              href={`/profile/${pick.profiles.username}`}
              className="text-xs transition-colors"
              style={{ color: "#4ade80" }}
            >
              Ver perfil completo →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Total picks", value: total,    color: "#8fa8cc" },
            { label: "Correctos",   value: correct,  color: "#4ade80" },
            { label: "Precisión",   value: `${accuracy}%`, color: accuracy >= 70 ? "#4ade80" : accuracy >= 50 ? "#fbbf24" : "#f87171" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl px-3 py-2.5 text-center" style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <p className="text-lg font-black" style={{ color }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: "#5a7a9a" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
