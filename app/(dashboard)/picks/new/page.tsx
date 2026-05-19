"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import TeamSearch from "@/components/picks/team-search";

const LEAGUES = [
  "UEFA Champions League",
  "UEFA Europa League",
  "UEFA Conference League",
  "Premier League",
  "La Liga",
  "Bundesliga",
  "Serie A",
  "Ligue 1",
  "Liga Dimayor",
  "Otra liga",
];

const PREDICTIONS = [
  { value: "home", label: "Local",    emoji: "🏠", gradient: "linear-gradient(135deg, #2563eb, #1d4ed8)", shadow: "rgba(37,99,235,0.35)" },
  { value: "draw", label: "Empate",   emoji: "🤝", gradient: "linear-gradient(135deg, #d97706, #b45309)", shadow: "rgba(217,119,6,0.35)" },
  { value: "away", label: "Visitante",emoji: "✈️", gradient: "linear-gradient(135deg, #7c3aed, #6d28d9)", shadow: "rgba(124,58,237,0.35)" },
] as const;

const pickSchema = z.object({
  league:     z.string().min(1, "Seleccioná una liga"),
  prediction: z.enum(["home", "draw", "away"]),
  match_date: z.string().min(1, "Ingresá la fecha del partido"),
  reasoning:  z.string().max(500, "Máximo 500 caracteres").optional(),
});

type PickForm = z.infer<typeof pickSchema>;

export default function NewPickPage() {
  const router = useRouter();
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [homeTeam, setHomeTeam] = useState({ name: "", logo: "" });
  const [awayTeam, setAwayTeam] = useState({ name: "", logo: "" });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PickForm>({
    resolver: zodResolver(pickSchema),
  });

  const [leagueOpen, setLeagueOpen] = useState(false);
  const selectedPrediction = watch("prediction");
  const selectedLeague     = watch("league");
  const selectedDate       = watch("match_date");
  const selectedLeagueData = LEAGUES.find(l => l === selectedLeague);

  async function onSubmit(data: PickForm) {
    if (!homeTeam.name) { setError("Seleccioná el equipo local"); return; }
    if (!awayTeam.name) { setError("Seleccioná el equipo visitante"); return; }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { error: err } = await supabase.from("picks").insert({
      user_id:        user.id,
      home_team:      homeTeam.name,
      home_team_logo: homeTeam.logo || null,
      away_team:      awayTeam.name,
      away_team_logo: awayTeam.logo || null,
      league:         data.league,
      prediction:     data.prediction,
      match_date:     data.match_date,
      reasoning:      data.reasoning || null,
    });

    if (err) {
      setError("Error al publicar el pick. Intentá de nuevo.");
      setLoading(false);
      return;
    }

    router.push("/feed");
    router.refresh();
  }

  const predInfo = PREDICTIONS.find(p => p.value === selectedPrediction);

  return (
    <div className="max-w-xl mx-auto">

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-black" style={{ color: "#f0f6ff" }}>
          ⚽ <span style={{ color: "#4ade80" }}>Nuevo</span> pick
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "#4a6080" }}>Publicá tu pronóstico y compite con la comunidad</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Preview del partido */}
        <div className="rounded-2xl p-4" style={{
          background: "linear-gradient(160deg, #1f2f48 0%, #182438 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        }}>
          <div className="flex items-center justify-between gap-4">

            {/* Local */}
            <div className="flex-1 text-center">
              {homeTeam.logo ? (
                <Image src={homeTeam.logo} alt={homeTeam.name} width={52} height={52} className="object-contain mx-auto mb-2 drop-shadow-md" unoptimized />
              ) : (
                <div className="w-13 h-13 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl" style={{ background: "rgba(255,255,255,0.04)", width: 52, height: 52 }}>⚽</div>
              )}
              <p className="text-sm font-black" style={{ color: homeTeam.name ? "#f0f6ff" : "#2a3d5a" }}>
                {homeTeam.name || "Local"}
              </p>
            </div>

            {/* VS / predicción */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              {predInfo ? (
                <span className="px-4 py-1 rounded-full text-xs font-black"
                  style={{ background: predInfo.gradient, color: "#fff", boxShadow: `0 2px 10px ${predInfo.shadow}` }}>
                  {predInfo.emoji} {predInfo.label}
                </span>
              ) : (
                <span className="font-black text-sm" style={{ color: "#1e3050", letterSpacing: "0.15em" }}>VS</span>
              )}
              {selectedDate && (
                <span className="text-xs" style={{ color: "#3a5070" }}>
                  {new Date(selectedDate).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                </span>
              )}
            </div>

            {/* Visitante */}
            <div className="flex-1 text-center">
              {awayTeam.logo ? (
                <Image src={awayTeam.logo} alt={awayTeam.name} width={52} height={52} className="object-contain mx-auto mb-2 drop-shadow-md" unoptimized />
              ) : (
                <div className="w-13 h-13 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl" style={{ background: "rgba(255,255,255,0.04)", width: 52, height: 52 }}>⚽</div>
              )}
              <p className="text-sm font-black" style={{ color: awayTeam.name ? "#f0f6ff" : "#2a3d5a" }}>
                {awayTeam.name || "Visitante"}
              </p>
            </div>
          </div>
        </div>

        {/* Equipos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TeamSearch label="Equipo local" placeholder="Buscar equipo..." onSelect={(name, logo) => setHomeTeam({ name, logo })} />
          <TeamSearch label="Equipo visitante" placeholder="Buscar equipo..." onSelect={(name, logo) => setAwayTeam({ name, logo })} />
        </div>

        {/* Liga + Fecha en la misma fila */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          {/* Liga — dropdown custom */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold" style={{ color: "#8fa8cc" }}>Liga</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setLeagueOpen(v => !v)}
                onBlur={() => setTimeout(() => setLeagueOpen(false), 150)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: leagueOpen ? "1px solid rgba(34,197,94,0.45)" : "1px solid rgba(255,255,255,0.09)",
                  color: selectedLeague ? "#f0f6ff" : "#4a6080",
                  boxShadow: leagueOpen ? "0 0 0 3px rgba(34,197,94,0.07)" : "none",
                }}
              >
                  <span className="flex-1 truncate">{selectedLeague || "Seleccionar liga"}</span>
                <span style={{ color: "#3a5070" }}>▾</span>
              </button>

              {leagueOpen && (
                <div
                  className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl overflow-hidden"
                  style={{
                    background: "linear-gradient(160deg, #1c2d45 0%, #162035 100%)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    boxShadow: "0 16px 48px rgba(0,0,0,0.55)",
                    maxHeight: "260px",
                    overflowY: "auto",
                    animation: "dropdownIn 0.18s ease-out forwards",
                  }}
                >
                  {LEAGUES.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onMouseDown={() => { setValue("league", l); setLeagueOpen(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-left transition-all"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        background: selectedLeague === l ? "rgba(34,197,94,0.10)" : "transparent",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(34,197,94,0.08)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = selectedLeague === l ? "rgba(34,197,94,0.10)" : "transparent"; }}
                    >
                      <span className="text-sm font-semibold" style={{ color: "#e8f0fe" }}>{l}</span>
                      {selectedLeague === l && <span className="ml-auto text-xs" style={{ color: "#4ade80" }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.league && <p className="text-red-400 text-xs">{errors.league.message}</p>}
          </div>

          {/* Fecha */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold" style={{ color: "#8fa8cc" }}>Fecha</label>
            <input
              type="date"
              className="w-full text-sm outline-none rounded-xl px-3 py-2.5 transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                color: "#f0f6ff",
                colorScheme: "dark",
              }}
              {...register("match_date")}
            />
            {errors.match_date && <p className="text-red-400 text-xs">{errors.match_date.message}</p>}
          </div>
        </div>

        {/* Predicción */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold" style={{ color: "#8fa8cc" }}>Tu pronóstico</label>
          <div className="grid grid-cols-3 gap-2">
            {PREDICTIONS.map((opt) => {
              const active = selectedPrediction === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue("prediction", opt.value)}
                  className="py-3 rounded-xl text-sm font-black transition-all"
                  style={active ? {
                    background: opt.gradient,
                    color: "#fff",
                    boxShadow: `0 4px 16px ${opt.shadow}`,
                    transform: "scale(1.03)",
                    border: "1px solid transparent",
                  } : {
                    background: "rgba(255,255,255,0.04)",
                    color: "#4a6080",
                    border: "1px solid rgba(255,255,255,0.08)",
                    transform: "scale(1)",
                  }}
                >
                  {opt.emoji} {opt.label}
                </button>
              );
            })}
          </div>
          {errors.prediction && <p className="text-red-400 text-xs">{errors.prediction.message}</p>}
        </div>

        {/* Análisis */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold" style={{ color: "#8fa8cc" }}>
            Análisis <span style={{ color: "#2e4060", fontWeight: 400 }}>(opcional)</span>
          </label>
          <textarea
            placeholder="¿Por qué apostás a este resultado? Compartí tu análisis..."
            rows={3}
            className="w-full text-sm outline-none rounded-xl px-3 py-2.5 resize-none transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#f0f6ff",
            }}
            onFocus={(e) => { e.target.style.border = "1px solid rgba(34,197,94,0.40)"; e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.07)"; }}
            onBlur={(e)  => { e.target.style.border = "1px solid rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
            {...register("reasoning")}
          />
          {errors.reasoning && <p className="text-red-400 text-xs">{errors.reasoning.message}</p>}
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        {/* Acciones */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "rgba(255,255,255,0.04)", color: "#6b87ab", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-black transition-all"
            style={{
              background: loading ? "rgba(34,197,94,0.4)" : "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "#fff",
              boxShadow: loading ? "none" : "0 4px 16px rgba(34,197,94,0.30)",
              border: "1px solid transparent",
            }}
          >
            {loading ? "Publicando..." : "⚡ Publicar pick"}
          </button>
        </div>
      </form>
    </div>
  );
}
