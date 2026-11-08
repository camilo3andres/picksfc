import { NextRequest, NextResponse } from "next/server";
import { fetchTeamLast } from "@/lib/match-results";

// Último partido terminado de un equipo de Liga Dimayor (ID de TheSportsDB),
// para el botón del panel admin. La lógica vive en lib/match-results.ts.
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "";
  return NextResponse.json(await fetchTeamLast(id));
}
