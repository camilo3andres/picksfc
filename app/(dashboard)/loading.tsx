// Esqueleto que se muestra AL INSTANTE mientras carga cualquier página del
// dashboard (feed, ranking, perfil, pick). Next.js lo usa solo gracias al nombre
// del archivo: así navegar se siente inmediato en vez de quedarse "pegado".

export default function DashboardLoading() {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Cargando">
      <div className="h-8 w-56 rounded-lg" style={{ background: "rgba(var(--tint-rgb), 0.08)" }} />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl p-4 space-y-4"
          style={{ background: "linear-gradient(160deg, var(--card-top) 0%, var(--card-bottom) 100%)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full" style={{ background: "rgba(var(--tint-rgb), 0.10)" }} />
            <div className="h-3 w-28 rounded" style={{ background: "rgba(var(--tint-rgb), 0.10)" }} />
          </div>
          <div className="h-28 rounded-2xl" style={{ background: "rgba(var(--tint-rgb), 0.06)" }} />
          <div className="h-3 w-40 rounded" style={{ background: "rgba(var(--tint-rgb), 0.08)" }} />
        </div>
      ))}
    </div>
  );
}
