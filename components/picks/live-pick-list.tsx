"use client";

import { useLivePicks, type LivePick } from "@/lib/use-live-picks";
import PickCard from "./pick-card";

// Lista de picks que se actualiza en vivo, para páginas que se arman en el
// servidor (perfil, detalle de un pick). El feed tiene su propia lista con filtros.

type Props = {
  picks: LivePick[];
  channel: string;            // nombre único del canal de Realtime
  filter?: string;            // ej. "user_id=eq.<id>" o "id=eq.<id>"
  acceptInserts?: boolean;
  currentUserId: string | null;
  likedIds: string[];
  isFollowing?: boolean;
  defaultShowComments?: boolean;
};

export default function LivePickList({
  picks: initial, channel, filter, acceptInserts, currentUserId, likedIds, isFollowing, defaultShowComments,
}: Props) {
  const [picks, setPicks] = useLivePicks(initial, { channel, filter, acceptInserts });

  return (
    <>
      {picks.map((pick) => (
        <PickCard
          key={pick.id}
          pick={pick}
          currentUserId={currentUserId}
          userLiked={likedIds.includes(pick.id)}
          isFollowing={isFollowing}
          defaultShowComments={defaultShowComments}
          onDelete={(id) => setPicks((prev) => prev.filter((p) => p.id !== id))}
        />
      ))}
    </>
  );
}
