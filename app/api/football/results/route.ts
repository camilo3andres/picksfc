import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  const key  = process.env.FOOTBALL_DATA_API_KEY;

  if (!date || !key) return NextResponse.json([]);

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/matches?status=FINISHED&dateFrom=${date}&dateTo=${date}`,
      { headers: { "X-Auth-Token": key }, next: { revalidate: 300 } }
    );
    if (!res.ok) return NextResponse.json([]);
    const data = await res.json();
    return NextResponse.json(data.matches ?? []);
  } catch {
    return NextResponse.json([]);
  }
}
