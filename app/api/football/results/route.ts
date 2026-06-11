import { NextRequest, NextResponse } from "next/server";

type SportsDBEvent = {
  idEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
};

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json([]);

  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${date}&s=Soccer`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return NextResponse.json([]);

    const data = await res.json();
    const events: SportsDBEvent[] = data.events ?? [];

    // Solo partidos con marcador final cargado (= terminados)
    const matches = events
      .filter((e) => e.intHomeScore != null && e.intAwayScore != null)
      .map((e) => {
        const home = parseInt(e.intHomeScore!);
        const away = parseInt(e.intAwayScore!);
        return {
          id: parseInt(e.idEvent),
          status: "FINISHED",
          homeTeam: { name: e.strHomeTeam },
          awayTeam: { name: e.strAwayTeam },
          score: {
            winner: home > away ? "HOME_TEAM" : away > home ? "AWAY_TEAM" : "DRAW",
            fullTime: { home, away },
          },
        };
      });

    return NextResponse.json(matches);
  } catch {
    return NextResponse.json([]);
  }
}
