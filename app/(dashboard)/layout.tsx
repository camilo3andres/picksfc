import { createClient, getSessionUser } from "@/lib/supabase-server";
import Navbar from "@/components/navbar";
import SiteFooter from "@/components/site-footer";
import { ViewerProvider } from "@/components/viewer-context";

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

  const isAdmin = profile?.is_admin ?? false;

  return (
    <ViewerProvider isAdmin={isAdmin}>
      <div className="app-bg min-h-screen">
        <Navbar username={profile?.username ?? null} isAdmin={isAdmin} isLoggedIn={!!user} />
        <main className="max-w-4xl mx-auto px-4 py-6">
          {children}
        </main>
        {/* pb-20 en móvil: espacio para la barra de navegación inferior */}
        <div className="pb-20 md:pb-0">
          <SiteFooter />
        </div>
      </div>
    </ViewerProvider>
  );
}
