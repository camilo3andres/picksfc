import { NextRequest, NextResponse } from "next/server";
import { fromFootballData, mapMatches } from "@/lib/api-mappers";
import type { FootballDataMatchesResponse } from "@/lib/api-types";

// Próximos 5 partidos de un equipo, desde football-data.org.
// Recibe el ID de football-data del equipo (el de lib/teams.ts).
export async function GET(req: NextRequest) {
  const id  = req.nextUrl.searchParams.get("id");
  const key = process.env.FOOTBALL_DATA_API_KEY;

  if (!id || !key) return NextResponse.json([]);

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/teams/${id}/matches?status=SCHEDULED&limit=5`,
      { headers: { "X-Auth-Token": key }, next: { revalidate: 300 } }
    );
    if (!res.ok) return NextResponse.json([]);

    const data: FootballDataMatchesResponse = await res.json();
    return NextResponse.json(mapMatches(data.matches, fromFootballData));
  } catch {
    return NextResponse.json([]);
  }
}
