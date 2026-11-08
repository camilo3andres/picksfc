import { createClient, getSessionUser } from "@/lib/supabase-server";
import { FEED_PAGE_SIZE } from "@/lib/picks";
import FeedList from "@/components/picks/feed-list";
import type { LivePick } from "@/lib/use-live-picks";

export default async function FeedPage() {
  const supabase = await createClient();
  const user = await getSessionUser();

  // Solo la primera tanda de picks; el resto llega con "Cargar más"
  const [{ data: picks }, { data: followingData }] = await Promise.all([
    supabase
      .from("picks")
      .select("*, profiles(username, is_verified)")
      .order("created_at", { ascending: false })
      .range(0, FEED_PAGE_SIZE - 1),
    user ? supabase.from("follows").select("following_id").eq("follower_id", user.id) : Promise.resolve({ data: [] }),
  ]);

  // Likes del usuario solo para los picks que se van a mostrar (no todos los de su historia)
  const pickIds = (picks ?? []).map((p) => p.id);
  const { data: userLikes } = user && pickIds.length
    ? await supabase.from("likes").select("pick_id").eq("user_id", user.id).in("pick_id", pickIds)
    : { data: [] as { pick_id: string }[] };

  // El título y el filtro Todos/Siguiendo viven dentro de FeedList (necesitan estado del cliente).
  // "Nuevo pick" ya está en la barra de navegación, por eso no se repite aquí.
  return (
    <div className="space-y-5">
      <FeedList
        initialPicks={(picks ?? []) as LivePick[]}
        initialLikedIds={(userLikes ?? []).map((l) => l.pick_id)}
        currentUserId={user?.id ?? null}
        followingIds={(followingData ?? []).map((f) => f.following_id)}
      />
    </div>
  );
}
