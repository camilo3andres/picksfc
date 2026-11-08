import type { Metadata } from "next";
import { createClient, getSessionUser } from "@/lib/supabase-server";
import { fetchFeedPage } from "@/lib/feed";
import FeedList from "@/components/picks/feed-list";

export const metadata: Metadata = {
  title: "Feed de pronósticos",
  description: "Los últimos pronósticos de fútbol de la comunidad PicksFC: picks, análisis y resultados.",
};

export default async function FeedPage() {
  const supabase = await createClient();
  const user = await getSessionUser();

  // Primera tanda de picks (con tus likes) y a quién sigues, en paralelo
  const [{ picks, likedIds }, { data: followingData }] = await Promise.all([
    fetchFeedPage(supabase, 0, user?.id ?? null),
    user ? supabase.from("follows").select("following_id").eq("follower_id", user.id) : Promise.resolve({ data: [] }),
  ]);

  // El título y el filtro Todos/Siguiendo viven dentro de FeedList (necesitan estado del cliente).
  // "Nuevo pick" ya está en la barra de navegación, por eso no se repite aquí.
  return (
    <div className="space-y-5">
      <FeedList
        initialPicks={picks}
        initialLikedIds={likedIds}
        currentUserId={user?.id ?? null}
        followingIds={(followingData ?? []).map((f) => f.following_id)}
      />
    </div>
  );
}
