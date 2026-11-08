import { NextRequest, NextResponse } from "next/server";
import { SPORTSDB_URL } from "@/lib/sportsdb";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json([]);

  try {
    const res  = await fetch(
      `${SPORTSDB_URL}/searchteams.php?t=${encodeURIComponent(name)}`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    const teams = (data.teams ?? []).slice(0, 8);
    return NextResponse.json(teams);
  } catch {
    return NextResponse.json([]);
  }
}
