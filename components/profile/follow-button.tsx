"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import FollowToggle from "@/components/ui/follow-toggle";

// Botón de seguir en la página de perfil. El aspecto lo da FollowToggle
// (el mismo de las tarjetas de pick); aquí solo vive la lógica con Supabase.

type Props = {
  currentUserId: string;
  targetUserId: string;
  targetUsername: string;
  initialFollowing: boolean;
};

export default function FollowButton({ currentUserId, targetUserId, targetUsername, initialFollowing }: Props) {
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

  return (
    <FollowToggle
      following={following}
      username={targetUsername}
      onToggle={handleToggle}
      disabled={loading}
      size="md"
    />
  );
}
