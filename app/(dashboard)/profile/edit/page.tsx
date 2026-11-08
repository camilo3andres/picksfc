import { redirect } from "next/navigation";
import { createClient, getSessionUser } from "@/lib/supabase-server";
import EditProfileForm from "@/components/profile/edit-profile-form";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const user = await getSessionUser();

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
        <h1 className="text-2xl font-black" style={{ color: "var(--text)" }}>Editar perfil</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Así te verán los demás en tu perfil público.
        </p>
      </div>

      <div className="rounded-2xl p-6" style={{
        background: "var(--surface)",
        boxShadow: "0 4px 18px rgba(0,0,0,0.28), 0 0 0 1px rgba(var(--tint-rgb), 0.05)",
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
