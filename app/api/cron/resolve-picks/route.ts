import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { fetchFinishedByDate, fetchTeamLast } from "@/lib/match-results";
import { resolvePick, withCache } from "@/lib/resolve-picks";
import type { Pick } from "@/lib/types";

// Auto-resolver AUTOMÁTICO: marca ✅/❌ y el marcador de los picks cuyos partidos ya terminaron.
// Hace lo mismo que el botón del panel admin, pero sin que nadie lo toque.
//
// Quién lo llama:
//   - GitHub Actions, cada hora (.github/workflows/resolve-picks.yml)
//   - Vercel Cron, una vez al día como respaldo (vercel.json; el plan gratis no permite más)
//
// Seguridad: solo responde si trae el header  Authorization: Bearer <CRON_SECRET>.
// Vercel Cron lo manda solo si CRON_SECRET existe en sus variables de entorno.

// Solo se revisan picks de los últimos N días: los más viejos ya no tienen
// resultado en la API gratis (y así no se gastan llamadas en vano)
const LOOKBACK_DAYS = 10;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const since = new Date(Date.now() - LOOKBACK_DAYS * 86_400_000).toISOString().slice(0, 10);

  const { data: pending, error } = await supabase
    .from("picks")
    .select("*")
    .eq("status", "pending")
    .gte("match_date", since)
    .lte("match_date", today);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // En el servidor se consulta directo a las APIs de fútbol (sin pasar por /api/football/*)
  const loaders = withCache({ byDate: fetchFinishedByDate, teamLast: fetchTeamLast });

  const resolved: string[] = [];
  let skipped = 0;

  for (const pick of (pending ?? []) as Pick[]) {
    const resolution = await resolvePick(pick, loaders);
    if (!resolution) {
      skipped++;
      continue;
    }

    // .eq("status", "pending") evita pisar un pick que un admin resolvió a mano mientras tanto
    const { error: updateError } = await supabase
      .from("picks")
      .update(resolution)
      .eq("id", pick.id)
      .eq("status", "pending");

    if (updateError) {
      skipped++;
    } else {
      const icon = resolution.status === "correct" ? "✅" : "❌";
      resolved.push(`${icon} ${pick.home_team} ${resolution.home_score}-${resolution.away_score} ${pick.away_team}`);
    }
  }

  return NextResponse.json({
    checked: pending?.length ?? 0,
    resolved: resolved.length,
    skipped,
    picks: resolved,
  });
}
