import { NextRequest, NextResponse } from "next/server";

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

    const data = await res.json();
    const matches = (data.matches ?? []).map((m: any) => ({
      idEvent:          String(m.id),
      strHomeTeam:      m.homeTeam.name,
      strAwayTeam:      m.awayTeam.name,
      strLeague:        m.competition.name,
      dateEvent:        m.utcDate.split("T")[0],
      strTime:          m.utcDate.split("T")[1]?.slice(0, 5) ?? null,
      strHomeTeamBadge: m.homeTeam.crest ?? null,
      strAwayTeamBadge: m.awayTeam.crest ?? null,
    }));

    return NextResponse.json(matches);
  } catch {
    return NextResponse.json([]);
  }
}
