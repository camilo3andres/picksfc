"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Pick } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  pick: Pick & { profiles: { username: string } };
};

const STATUS_STYLES = {
  pending: "bg-zinc-700 text-zinc-300",
  correct: "bg-green-900 text-green-400",
  incorrect: "bg-red-900 text-red-400",
};

const STATUS_LABEL = {
  pending: "Pendiente",
  correct: "✓ Correcto",
  incorrect: "✗ Incorrecto",
};

const PREDICTION_LABEL = {
  home: "Local",
  draw: "Empate",
  away: "Visitante",
};

export default function AdminPickCard({ pick }: Props) {
  const [status, setStatus] = useState(pick.status);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function updateStatus(newStatus: "correct" | "incorrect" | "pending") {
    setSaving(true);
    await supabase.from("picks").update({ status: newStatus }).eq("id", pick.id);
    setStatus(newStatus);
    setSaving(false);
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-zinc-300 text-sm font-medium">@{pick.profiles.username}</span>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs bg-zinc-800 px-2 py-1 rounded">{pick.league}</span>
            <span className={`text-xs px-2 py-1 rounded font-medium ${STATUS_STYLES[status]}`}>
              {STATUS_LABEL[status]}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-3">
          <span className="text-white font-semibold text-sm">{pick.home_team}</span>
          <span className="text-zinc-500 text-xs">vs</span>
          <span className="text-white font-semibold text-sm">{pick.away_team}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-400 text-xs">Pronóstico:</span>
          <span className="bg-green-900 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
            {PREDICTION_LABEL[pick.prediction]}
          </span>
          <span className="text-zinc-600 text-xs ml-auto">
            {new Date(pick.match_date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
          </span>
        </div>

        {pick.reasoning && (
          <p className="text-zinc-400 text-sm border-l-2 border-zinc-700 pl-3">{pick.reasoning}</p>
        )}

        {/* Botones de admin */}
        <div className="flex gap-2 pt-1 border-t border-zinc-800">
          <Button
            size="sm"
            disabled={saving || status === "correct"}
            onClick={() => updateStatus("correct")}
            className="flex-1 bg-green-700 hover:bg-green-600 text-white text-xs"
          >
            ✓ Correcto
          </Button>
          <Button
            size="sm"
            disabled={saving || status === "incorrect"}
            onClick={() => updateStatus("incorrect")}
            className="flex-1 bg-red-800 hover:bg-red-700 text-white text-xs"
          >
            ✗ Incorrecto
          </Button>
          <Button
            size="sm"
            disabled={saving || status === "pending"}
            onClick={() => updateStatus("pending")}
            variant="ghost"
            className="text-zinc-400 hover:text-white text-xs"
          >
            Resetear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
