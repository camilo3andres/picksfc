import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AdminPickCard from "@/components/picks/admin-pick-card";
import AdminMatchResolver from "@/components/picks/admin-match-resolver";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verificar que sea admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/feed");

  const { data: picks } = await supabase
    .from("picks")
    .select("*, profiles(username)")
    .order("created_at", { ascending: false });

  const pending = picks?.filter((p) => p.status === "pending") ?? [];
  const resolved = picks?.filter((p) => p.status !== "pending") ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-white text-2xl font-bold">Panel de Admin</h1>
        <p className="text-zinc-500 text-sm">Marcá los picks como correctos o incorrectos</p>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-white">{picks?.length ?? 0}</p>
          <p className="text-zinc-500 text-sm mt-1">Total picks</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-yellow-400">{pending.length}</p>
          <p className="text-zinc-500 text-sm mt-1">Pendientes</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{resolved.length}</p>
          <p className="text-zinc-500 text-sm mt-1">Resueltos</p>
        </div>
      </div>

      {/* Resolver por partido */}
      {pending.length > 0 && (
        <div className="space-y-4">
          <div className="border-b border-zinc-800 pb-2">
            <h2 className="text-white font-semibold text-lg">Resolver partidos</h2>
            <p className="text-zinc-500 text-xs mt-0.5">Seleccioná el resultado real y todos los picks de ese partido se marcan automáticamente</p>
          </div>
          <AdminMatchResolver pendingPicks={pending as any} />
        </div>
      )}

      {/* Picks pendientes individuales */}
      {pending.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-lg border-b border-zinc-800 pb-2">
            Pendientes individuales ({pending.length})
          </h2>
          {pending.map((pick) => (
            <AdminPickCard key={pick.id} pick={pick as any} />
          ))}
        </div>
      )}

      {/* Picks resueltos */}
      {resolved.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-lg border-b border-zinc-800 pb-2">
            Resueltos ({resolved.length})
          </h2>
          {resolved.map((pick) => (
            <AdminPickCard key={pick.id} pick={pick as any} />
          ))}
        </div>
      )}

      {picks?.length === 0 && (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-4xl mb-4">📋</p>
          <p>No hay picks todavía</p>
        </div>
      )}
    </div>
  );
}
