import { NextRequest, NextResponse } from "next/server";
import { SPORTSDB_URL } from "@/lib/sportsdb";
import { normalizeLeague } from "@/lib/leagues";

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

    const data = await res.json();
    // Mismo formato que /api/football/matches para que el selector no note la diferencia
    const matches = (data.events ?? [])
      .filter((e: any) => e.strSport === "Soccer" && e.strHomeTeam && e.strAwayTeam)
      .map((e: any) => ({
        idEvent:          String(e.idEvent),
        strHomeTeam:      e.strHomeTeam,
        strAwayTeam:      e.strAwayTeam,
        strLeague:        normalizeLeague(e.strLeague),
        dateEvent:        e.dateEvent,
        strTime:          e.strTime?.slice(0, 5) ?? null,
        strHomeTeamBadge: e.strHomeTeamBadge ?? null,
        strAwayTeamBadge: e.strAwayTeamBadge ?? null,
      }));

    return NextResponse.json(matches);
  } catch {
    return NextResponse.json([]);
  }
}
