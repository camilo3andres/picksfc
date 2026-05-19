import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Navbar from "@/components/navbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, is_admin")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen" style={{
      background: "linear-gradient(90deg, #081120 0%, #0d1b33 20%, #10203d 50%, #0d1b33 80%, #081120 100%)",
    }}>
      <Navbar username={profile?.username ?? null} isAdmin={profile?.is_admin ?? false} />
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>
    </div>
  );
}
