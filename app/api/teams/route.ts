import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ teams: [] });
  }

  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(query)}`,
      { next: { revalidate: 3600 } }
    );

    const data = await res.json();

    const teams = (data.teams ?? [])
      .filter((t: any) => t.strTeamBadge && (t.strSport === "Soccer" || t.strSport === "Football"))
      .slice(0, 7)
      .map((t: any) => ({
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
