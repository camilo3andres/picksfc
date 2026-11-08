"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Pick } from "@/lib/types";
import { parseLocalDate } from "@/lib/utils";

type Props = {
  pick: Pick & { profiles: { username: string } };
};

const PREDICTION_LABEL = {
  home:      "Gana Local",
  draw:      "Empate",
  away:      "Gana Visitante",
  home_draw: "Local o Empate",
  away_draw: "Visitante o Empate",
};
const PREDICTION_STYLE = {
  home:      { background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff" },
  draw:      { background: "linear-gradient(135deg, #d97706, #b45309)", color: "#fff" },
  away:      { background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff" },
  home_draw: { background: "linear-gradient(135deg, #0891b2, #0e7490)", color: "#fff" },
  away_draw: { background: "linear-gradient(135deg, #059669, #047857)", color: "#fff" },
};

function getResult(home: number, away: number): "home" | "draw" | "away" {
  if (home > away) return "home";
  if (home < away) return "away";
  return "draw";
}

function isCorrectPrediction(prediction: string, result: "home" | "draw" | "away"): boolean {
  if (prediction === "home_draw") return result === "home" || result === "draw";
  if (prediction === "away_draw") return result === "away" || result === "draw";
  return prediction === result;
}

export default function AdminPickCard({ pick }: Props) {
  const [status, setStatus]         = useState(pick.status);
  const [saving, setSaving]         = useState(false);
  const [editScore, setEditScore]   = useState(false);
  const [homeScore, setHomeScore]   = useState(String(pick.home_score ?? ""));
  const [awayScore, setAwayScore]   = useState(String(pick.away_score ?? ""));
  const supabase = createClient();
  const router   = useRouter();
  const [, startTransition] = useTransition();

  const [deleted, setDeleted] = useState(false);

  async function deletePick() {
    if (!confirm(`¿Eliminar este pick de @${pick.profiles.username}?`)) return;
    setSaving(true);
    await supabase.from("picks").delete().eq("id", pick.id);
    setDeleted(true);
    startTransition(() => router.refresh());
  }

  async function updateStatus(newStatus: "correct" | "incorrect" | "pending") {
    setSaving(true);
    // Solo actualiza el estado, nunca toca el marcador
    await supabase.from("picks").update({ status: newStatus }).eq("id", pick.id);
    setStatus(newStatus);
    if (newStatus === "pending") setEditScore(false);
    setSaving(false);
    startTransition(() => router.refresh());
  }

  async function saveScore() {
    const h = parseInt(homeScore);
    const a = parseInt(awayScore);
    if (isNaN(h) || isNaN(a)) return;
    setSaving(true);
    const newStatus = isCorrectPrediction(pick.prediction, getResult(h, a)) ? "correct" : "incorrect";
    await supabase.from("picks").update({
      home_score: h,
      away_score: a,
      status: newStatus,
    }).eq("id", pick.id);
    setStatus(newStatus);
    setEditScore(false);
    setSaving(false);
    startTransition(() => router.refresh());
  }

  const statusBadge = {
    pending:   { label: "⏳ Pendiente",  style: { background: "rgba(251,191,36,0.12)",  color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)"  } },
    correct:   { label: "✅ Correcto",   style: { background: "rgba(var(--success-rgb), 0.12)",  color: "var(--success)", border: "1px solid rgba(var(--success-rgb), 0.25)"   } },
    incorrect: { label: "❌ Incorrecto", style: { background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)"  } },
  }[status];

  const hasScore = pick.home_score !== null && pick.away_score !== null;

  if (deleted) return null;

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{
      background: "linear-gradient(160deg, var(--card-top) 0%, var(--card-bottom) 100%)",
      border: "1px solid rgba(var(--tint-rgb), 0.07)",
    }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: "var(--text-2)" }}>@{pick.profiles.username}</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(var(--tint-rgb), 0.05)", color: "var(--text-faint)" }}>
            {pick.league}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={statusBadge.style}>
            {statusBadge.label}
          </span>
          <button
            onClick={deletePick}
            disabled={saving}
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all disabled:opacity-40"
            title="Eliminar pick"
            style={{ background: "rgba(248,113,113,0.10)", color: "#f87171", border: "1px solid rgba(248,113,113,0.20)" }}
          >
            🗑
          </button>
        </div>
      </div>

      {/* Partido + marcador actual */}
      <div className="flex items-center justify-between rounded-xl px-4 py-3 gap-3" style={{
        background: "rgba(var(--tint-rgb), 0.04)",
        border: "1px solid rgba(var(--tint-rgb), 0.06)",
      }}>
        <span className="font-black text-sm flex-1" style={{ color: "var(--text)" }}>{pick.home_team}</span>
        {hasScore ? (
          <span className="font-black text-base flex-shrink-0" style={{ color: "var(--text)" }}>
            {pick.home_score} - {pick.away_score}
          </span>
        ) : (
          <span className="font-black text-xs flex-shrink-0" style={{ color: "var(--text-dim)" }}>VS</span>
        )}
        <span className="font-black text-sm flex-1 text-right" style={{ color: "var(--text)" }}>{pick.away_team}</span>
      </div>

      {/* Pronóstico + fecha */}
      <div className="flex items-center gap-2">
        <span className="text-xs px-3 py-1 rounded-full font-black" style={PREDICTION_STYLE[pick.prediction]}>
          {PREDICTION_LABEL[pick.prediction]}
        </span>
        <span className="text-xs ml-auto" style={{ color: "var(--text-faint)" }}>
          {parseLocalDate(pick.match_date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      </div>

      {pick.reasoning && (
        <p className="text-xs italic pl-3" style={{ color: "var(--text-3)", borderLeft: "2px solid rgba(var(--tint-rgb), 0.08)" }}>
          {pick.reasoning}
        </p>
      )}

      {/* Editor de marcador (solo si ya tiene score) */}
      {hasScore && editScore && (
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{
          background: "rgba(var(--tint-rgb), 0.04)",
          border: "1px solid rgba(var(--tint-rgb), 0.10)",
        }}>
          <span className="text-xs font-semibold flex-1" style={{ color: "var(--text-3)" }}>Corregir marcador:</span>
          <input
            type="number" min={0} max={99}
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            className="w-10 text-center font-black text-sm rounded-lg py-1 outline-none"
            style={{ background: "rgba(var(--tint-rgb), 0.08)", border: "1px solid rgba(var(--tint-rgb), 0.15)", color: "var(--text)" }}
          />
          <span className="font-black text-xs" style={{ color: "var(--text-dim)" }}>-</span>
          <input
            type="number" min={0} max={99}
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            className="w-10 text-center font-black text-sm rounded-lg py-1 outline-none"
            style={{ background: "rgba(var(--tint-rgb), 0.08)", border: "1px solid rgba(var(--tint-rgb), 0.15)", color: "var(--text)" }}
          />
          <button
            onClick={saveScore}
            disabled={saving}
            className="px-3 py-1 rounded-lg text-xs font-black transition-all disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-strong))", color: "#fff" }}
          >
            {saving ? "..." : "Guardar"}
          </button>
          <button
            onClick={() => { setEditScore(false); setHomeScore(String(pick.home_score ?? "")); setAwayScore(String(pick.away_score ?? "")); }}
            className="text-xs" style={{ color: "var(--text-faint)" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Botones — solo para picks pendientes */}
      {status === "pending" && (
        <div className="flex gap-2 pt-1" style={{ borderTop: "1px solid rgba(var(--tint-rgb), 0.06)" }}>
          <button
            disabled={saving}
            onClick={() => updateStatus("correct")}
            className="flex-1 py-2 rounded-xl text-xs font-black transition-all disabled:opacity-40"
            style={{ background: "rgba(var(--success-rgb), 0.10)", color: "var(--success)", border: "1px solid rgba(var(--success-rgb), 0.25)" }}
          >
            ✓ Correcto
          </button>
          <button
            disabled={saving}
            onClick={() => updateStatus("incorrect")}
            className="flex-1 py-2 rounded-xl text-xs font-black transition-all disabled:opacity-40"
            style={{ background: "rgba(248,113,113,0.10)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}
          >
            ✗ Incorrecto
          </button>
        </div>
      )}
    </div>
  );
}
