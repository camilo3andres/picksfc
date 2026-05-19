"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Props = {
  currentUserId: string;
  targetUserId: string;
  initialFollowing: boolean;
};

export default function FollowButton({ currentUserId, targetUserId, initialFollowing }: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleToggle() {
    setLoading(true);
    const { data } = await supabase.rpc("toggle_follow", {
      p_follower_id: currentUserId,
      p_following_id: targetUserId,
    });
    if (data) setFollowing(data.following);
    setLoading(false);
    router.refresh();
  }

  if (loading) return <span className="text-sm" style={{ color: "#5a7a9a" }}>...</span>;

  if (following) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold px-3 py-1.5 rounded-xl"
          style={{ background: "rgba(74,222,128,0.10)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.25)" }}>
          Siguiendo ✓
        </span>
        <button
          onClick={handleToggle}
          className="text-sm font-semibold px-3 py-1.5 rounded-xl transition-all"
          style={{ background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.20)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(248,113,113,0.15)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(248,113,113,0.08)"; }}
        >
          Dejar de seguir
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className="text-sm font-bold px-4 py-1.5 rounded-xl transition-all"
      style={{
        background: "linear-gradient(135deg, #22c55e, #16a34a)",
        color: "#fff",
        border: "1px solid transparent",
        boxShadow: "0 4px 12px rgba(34,197,94,0.25)",
      }}
    >
      + Seguir
    </button>
  );
}
