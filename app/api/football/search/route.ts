import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json([]);

  try {
    const res  = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(name)}`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    const teams = (data.teams ?? []).slice(0, 8);
    return NextResponse.json(teams);
  } catch {
    return NextResponse.json([]);
  }
}
