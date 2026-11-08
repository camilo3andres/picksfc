import { NextRequest, NextResponse } from "next/server";
import { fromFootballData, mapMatches } from "@/lib/api-mappers";
import type { FootballDataMatchesResponse } from "@/lib/api-types";

// Próximos partidos de una competición (PL, PD, CL...), desde football-data.org.
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const key  = process.env.FOOTBALL_DATA_API_KEY;

  if (!code || !key) return NextResponse.json([]);

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/competitions/${code}/matches?status=SCHEDULED`,
      { headers: { "X-Auth-Token": key }, next: { revalidate: 300 } }
    );
    if (!res.ok) return NextResponse.json([]);

    const data: FootballDataMatchesResponse = await res.json();
    return NextResponse.json(mapMatches(data.matches, fromFootballData));
  } catch {
    return NextResponse.json([]);
  }
}
