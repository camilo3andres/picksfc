import { NextRequest, NextResponse } from "next/server";
import { fetchFinishedByDate } from "@/lib/match-results";

// Resultados finales de un día (ligas europeas y Mundial) para el botón del panel admin.
// La lógica vive en lib/match-results.ts porque el cron también la usa.
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") ?? "";
  return NextResponse.json(await fetchFinishedByDate(date));
}
