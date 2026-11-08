import { NextRequest, NextResponse } from "next/server";
import { SPORTSDB_URL } from "@/lib/sportsdb";
import { fromSportsDb, mapMatches } from "@/lib/api-mappers";
import type { SportsDbEventsResponse } from "@/lib/api-types";

// Próximos partidos de un equipo según TheSportsDB.
// Se usa para equipos que football-data.org no cubre en su plan gratis
// (por ejemplo Liga Dimayor). Recibe el ID de TheSportsDB, no el de football-data.
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json([]);

  try {
    const res = await fetch(`${SPORTSDB_URL}/eventsnext.php?id=${encodeURIComponent(id)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return NextResponse.json([]);

    // Mismo formato que /api/football/matches para que el selector no note la diferencia
    const data: SportsDbEventsResponse = await res.json();
    return NextResponse.json(mapMatches(data.events, fromSportsDb));
  } catch {
    return NextResponse.json([]);
  }
}
