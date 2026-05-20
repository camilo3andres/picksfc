import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-server";
import FeedList from "@/components/picks/feed-list";

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: picks }, { data: userLikes }, { data: followingData }] = await Promise.all([
    supabase.from("picks").select("*, profiles(username)").order("created_at", { ascending: false }),
    supabase.from("likes").select("pick_id").eq("user_id", user!.id),
    supabase.from("follows").select("following_id").eq("follower_id", user!.id),
  ]);

  const likedPickIds = userLikes?.map((l) => l.pick_id) ?? [];
  const followingIds = followingData?.map((f) => f.following_id) ?? [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-black tracking-tight flex items-center gap-2">
            <Image src="/icon.png" alt="" width={28} height={28} className="inline-block" />
            <span><span className="text-green-400">Picks</span> de la comunidad</span>
          </h1>
          <p className="text-[#6b7fa3] text-sm mt-0.5">Pronósticos en vivo · Compite con la comunidad</p>
        </div>
        <Link
          href="/picks/new"
          className="bg-green-600 hover:bg-green-500 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-green-900/30 hover:shadow-green-700/30"
        >
          + Nuevo pick
        </Link>
      </div>

      <FeedList
        initialPicks={(picks ?? []) as any}
        initialLikedIds={likedPickIds}
        currentUserId={user!.id}
        followingIds={followingIds}
      />
    </div>
  );
}
