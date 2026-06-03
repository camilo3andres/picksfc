"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import MatchSelector, { type SelectedMatch } from "@/components/picks/match-selector";

const PREDICTIONS_ROW1 = [
  { value: "home", label: "Gana Local",     gradient: "linear-gradient(135deg, #2563eb, #1d4ed8)", shadow: "rgba(37,99,235,0.35)" },
  { value: "draw", label: "Empate",          gradient: "linear-gradient(135deg, #d97706, #b45309)", shadow: "rgba(217,119,6,0.35)" },
  { value: "away", label: "Gana Visitante",  gradient: "linear-gradient(135deg, #7c3aed, #6d28d9)", shadow: "rgba(124,58,237,0.35)" },
] as const;

const PREDICTIONS_ROW2 = [
  { value: "home_draw", label: "Local o Empate",     gradient: "linear-gradient(135deg, #0891b2, #0e7490)", shadow: "rgba(8,145,178,0.35)" },
  { value: "away_draw", label: "Visitante o Empate", gradient: "linear-gradient(135deg, #059669, #047857)", shadow: "rgba(5,150,105,0.35)" },
] as const;

const PREDICTIONS = [...PREDICTIONS_ROW1, ...PREDICTIONS_ROW2];

const pickSchema = z.object({
  league:     z.string().min(1, "Seleccioná un partido"),
  prediction: z.enum(["home", "draw", "away", "home_draw", "away_draw"]),
  match_date: z.string().min(1, "Seleccioná un partido"),
  reasoning:  z.string().max(500, "Máximo 500 caracteres").optional(),
});

type PickForm = z.infer<typeof pickSchema>;

export default function NewPickPage() {
  const router = useRouter();
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [homeTeam, setHomeTeam] = useState({ name: "", logo: "" });
  const [awayTeam, setAwayTeam] = useState({ name: "", logo: "" });
  const [league, setLeague]     = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace("/login");
    });
  }, [router]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PickForm>({
    resolver: zodResolver(pickSchema),
  });

  const selectedPrediction = watch("prediction");
  const selectedDate       = watch("match_date");

  function handleMatchSelect(match: SelectedMatch) {
    setHomeTeam({ name: match.homeTeam, logo: match.homeTeamLogo });
    setAwayTeam({ name: match.awayTeam, logo: match.awayTeamLogo });
    setLeague(match.league);
    setValue("league",     match.league);
    setValue("match_date", match.matchDate);
    setError(null);
  }

  function handleMatchClear() {
    setHomeTeam({ name: "", logo: "" });
    setAwayTeam({ name: "", logo: "" });
    setLeague("");
    setValue("league",     "");
    setValue("match_date", "");
  }

  async function onSubmit(data: PickForm) {
    if (!homeTeam.name) { setError("Seleccioná un partido primero"); return; }

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

  const predInfo = PREDICTIONS.find((p) => p.value === selectedPrediction);

  return (
    <div className="max-w-xl mx-auto">

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: "#f0f6ff" }}>
          <Image src="/icon.png" alt="" width={28} height={28} className="inline-block" />
          <span><span style={{ color: "#4ade80" }}>Nuevo</span> pick</span>
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "#4a6080" }}>Publicá tu pronóstico y compite con la comunidad</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Preview del partido */}
        <div className="rounded-2xl p-4" style={{
          background: "linear-gradient(160deg, #1f2f48 0%, #182438 100%)",
          border:     "1px solid rgba(255,255,255,0.07)",
          boxShadow:  "0 8px 32px rgba(0,0,0,0.35)",
        }}>
          <div className="flex items-center justify-between gap-4">

            {/* Local */}
            <div className="flex-1 text-center">
              {homeTeam.logo ? (
                <Image src={homeTeam.logo} alt={homeTeam.name} width={52} height={52} className="object-contain mx-auto mb-2 drop-shadow-md" unoptimized />
              ) : (
                <div className="rounded-full mx-auto mb-2 flex items-center justify-center text-2xl" style={{ background: "rgba(255,255,255,0.04)", width: 52, height: 52 }}>⚽</div>
              )}
              <p className="text-sm font-black" style={{ color: homeTeam.name ? "#f0f6ff" : "#2a3d5a" }}>
                {homeTeam.name || "Local"}
              </p>
            </div>

            {/* VS / predicción / info */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              {predInfo ? (
                <span className="px-4 py-1 rounded-full text-xs font-black"
                  style={{ background: predInfo.gradient, color: "#fff", boxShadow: `0 2px 10px ${predInfo.shadow}` }}>
                  {predInfo.label}
                </span>
              ) : (
                <span className="font-black text-sm" style={{ color: "#1e3050", letterSpacing: "0.15em" }}>VS</span>
              )}
              {selectedDate && (
                <span className="text-xs" style={{ color: "#3a5070" }}>
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                </span>
              )}
              {league && (
                <span className="text-xs text-center px-2" style={{ color: "#2a4565", maxWidth: 100, lineHeight: 1.2 }}>
                  {league}
                </span>
              )}
            </div>

            {/* Visitante */}
            <div className="flex-1 text-center">
              {awayTeam.logo ? (
                <Image src={awayTeam.logo} alt={awayTeam.name} width={52} height={52} className="object-contain mx-auto mb-2 drop-shadow-md" unoptimized />
              ) : (
                <div className="rounded-full mx-auto mb-2 flex items-center justify-center text-2xl" style={{ background: "rgba(255,255,255,0.04)", width: 52, height: 52 }}>⚽</div>
              )}
              <p className="text-sm font-black" style={{ color: awayTeam.name ? "#f0f6ff" : "#2a3d5a" }}>
                {awayTeam.name || "Visitante"}
              </p>
            </div>
          </div>
        </div>

        {/* Match Selector */}
        <MatchSelector onSelect={handleMatchSelect} onClear={handleMatchClear} />
        {(errors.league || errors.match_date) && !homeTeam.name && (
          <p className="text-red-400 text-xs -mt-2">Seleccioná un partido primero</p>
        )}

        {/* Predicción */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold" style={{ color: "#8fa8cc" }}>¿Quién va a ganar?</label>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {PREDICTIONS_ROW1.map((opt) => {
                const active = selectedPrediction === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue("prediction", opt.value)}
                    className="py-3 rounded-xl text-sm font-black transition-all"
                    style={active ? {
                      background: opt.gradient,
                      color:      "#fff",
                      boxShadow:  `0 4px 16px ${opt.shadow}`,
                      transform:  "scale(1.03)",
                      border:     "1px solid transparent",
                    } : {
                      background: "rgba(255,255,255,0.04)",
                      color:      "#4a6080",
                      border:     "1px solid rgba(255,255,255,0.08)",
                      transform:  "scale(1)",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PREDICTIONS_ROW2.map((opt) => {
                const active = selectedPrediction === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue("prediction", opt.value)}
                    className="py-2.5 rounded-xl text-sm font-black transition-all"
                    style={active ? {
                      background: opt.gradient,
                      color:      "#fff",
                      boxShadow:  `0 4px 16px ${opt.shadow}`,
                      transform:  "scale(1.03)",
                      border:     "1px solid transparent",
                    } : {
                      background: "rgba(255,255,255,0.04)",
                      color:      "#4a6080",
                      border:     "1px solid rgba(255,255,255,0.08)",
                      transform:  "scale(1)",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
          {errors.prediction && <p className="text-red-400 text-xs">{errors.prediction.message}</p>}
        </div>

        {/* Análisis */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold" style={{ color: "#8fa8cc" }}>
            ¿Qué más va a pasar? <span style={{ color: "#2e4060", fontWeight: 400 }}>(opcional)</span>
          </label>
          <textarea
            placeholder="Ej: +2.5 goles, más de 9 esquinas, ambos anotan... compartí tu análisis"
            rows={3}
            className="w-full text-sm outline-none rounded-xl px-3 py-2.5 resize-none transition-all placeholder:text-[#4a6080]"
            style={{
              background: "rgba(255,255,255,0.08)",
              border:     "1px solid rgba(255,255,255,0.12)",
              color:      "#f0f6ff",
            }}
            {...register("reasoning")}
            onFocus={(e) => { e.target.style.border = "1px solid rgba(34,197,94,0.40)"; e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.07)"; }}
            onBlur={(e)  => { e.target.style.border = "1px solid rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
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
              color:      "#fff",
              boxShadow:  loading ? "none" : "0 4px 16px rgba(34,197,94,0.30)",
              border:     "1px solid transparent",
            }}
          >
            {loading ? "Publicando..." : "⚡ Publicar pick"}
          </button>
        </div>
      </form>
    </div>
  );
}
