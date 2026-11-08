import { createClient, getSessionUser } from "@/lib/supabase-server";
import Navbar from "@/components/navbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const user = await getSessionUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username, is_admin")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <div className="app-bg min-h-screen">
      <Navbar username={profile?.username ?? null} isAdmin={profile?.is_admin ?? false} isLoggedIn={!!user} />
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>
    </div>
  );
}
