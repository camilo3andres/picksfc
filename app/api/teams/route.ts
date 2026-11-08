import { NextResponse } from "next/server";
import { SPORTSDB_URL } from "@/lib/sportsdb";
import type { SportsDbTeamsResponse } from "@/lib/api-types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ teams: [] });
  }

  try {
    const res = await fetch(
      `${SPORTSDB_URL}/searchteams.php?t=${encodeURIComponent(query)}`,
      { next: { revalidate: 3600 } }
    );

    const data: SportsDbTeamsResponse = await res.json();

    const teams = (data.teams ?? [])
      .filter((t) => t.strTeamBadge && (t.strSport === "Soccer" || t.strSport === "Football"))
      .slice(0, 7)
      .map((t) => ({
        id: String(t.idTeam),
        name: t.strTeam,
        logo: t.strTeamBadge,
        league: t.strLeague ?? "",
      }));

    return NextResponse.json({ teams });
  } catch {
    return NextResponse.json({ teams: [] });
  }
}
