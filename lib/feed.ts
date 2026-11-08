import type { SupabaseClient } from "@supabase/supabase-js";
import { FEED_PAGE_SIZE } from "./picks";
import type { LivePick } from "./use-live-picks";

// Una "página" del feed: picks del más nuevo al más viejo + cuáles tienen like del usuario.
// La usan el servidor (primera carga) y el scroll infinito (siguientes tandas).
//
// Todo sale en UNA sola consulta: dentro de cada pick se pide "my_like", que trae
// solo el like de este usuario (si existe). Antes eran dos viajes a la base:
// primero los picks y después los likes.
export async function fetchFeedPage(
  supabase: SupabaseClient,
  offset: number,
  userId: string | null
): Promise<{ picks: LivePick[]; likedIds: string[] }> {
  let query = supabase
    .from("picks")
    .select(userId ? "*, profiles(username, is_verified), my_like:likes(user_id)" : "*, profiles(username, is_verified)")
    .order("created_at", { ascending: false })
    .range(offset, offset + FEED_PAGE_SIZE - 1);

  if (userId) query = query.eq("my_like.user_id", userId);

  const { data } = await query;
  const rows = (data ?? []) as unknown as (LivePick & { my_like?: { user_id: string }[] })[];

  return {
    likedIds: rows.filter((r) => r.my_like?.length).map((r) => r.id),
    // my_like solo sirve para saber el like; no se guarda en el pick
    picks: rows.map((row) => {
      const pick = { ...row };
      delete pick.my_like;
      return pick;
    }),
  };
}
