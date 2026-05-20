import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-server";
import FeedList from "@/components/picks/feed-list";

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const picksQuery = supabase.from("picks").select("*, profiles(username)").order("created_at", { ascending: false });
  const [{ data: picks }, { data: userLikes }, { data: followingData }] = await Promise.all([
    picksQuery,
    user ? supabase.from("likes").select("pick_id").eq("user_id", user.id) : Promise.resolve({ data: [] }),
    user ? supabase.from("follows").select("following_id").eq("follower_id", user.id) : Promise.resolve({ data: [] }),
  ]);

  const likedPickIds = (userLikes ?? []).map((l: any) => l.pick_id);
  const followingIds = (followingData ?? []).map((f: any) => f.following_id);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-white text-2xl font-black tracking-tight flex items-center gap-2">
          <Image src="/icon.png" alt="" width={28} height={28} className="inline-block flex-shrink-0" />
          <span><span className="text-green-400">Picks</span> de la comunidad</span>
        </h1>
        <Link
          href="/picks/new"
          className="flex-shrink-0 whitespace-nowrap text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 4px 14px rgba(34,197,94,0.30)" }}
        >
          + Nuevo pick
        </Link>
      </div>

      <FeedList
        initialPicks={(picks ?? []) as any}
        initialLikedIds={likedPickIds}
        currentUserId={user?.id ?? null}
        followingIds={followingIds}
      />
    </div>
  );
}
