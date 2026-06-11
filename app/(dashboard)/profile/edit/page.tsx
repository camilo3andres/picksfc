import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import EditProfileForm from "@/components/profile/edit-profile-form";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, bio, instagram, tiktok, twitter, telegram")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/feed");

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black" style={{ color: "#f0f6ff" }}>Editar perfil</h1>
        <p className="text-sm mt-1" style={{ color: "#5a7a9a" }}>
          Así te verán los demás en tu perfil público.
        </p>
      </div>

      <div className="rounded-2xl p-6" style={{
        background: "#162742",
        boxShadow: "0 4px 18px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.05)",
      }}>
        <EditProfileForm
          userId={user.id}
          username={profile.username}
          currentBio={profile.bio}
          currentInstagram={profile.instagram}
          currentTiktok={profile.tiktok}
          currentTwitter={profile.twitter}
          currentTelegram={profile.telegram}
        />
      </div>
    </div>
  );
}
