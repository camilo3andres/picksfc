// Consulta de resultados finales a las APIs de fútbol. SOLO SERVIDOR
// (usa FOOTBALL_DATA_API_KEY, que nunca debe llegar al navegador).
//
// La usan:
//   - /api/football/results y /api/football/team-last → para el botón del panel admin
//   - /api/cron/resolve-picks → el auto-resolver automático (cada hora)
import type { FinishedMatch } from "./types";
import { SPORTSDB_URL } from "./sportsdb";

function addDays(ymd: string, days: number): string {
  const d = new Date(`${ymd}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Partidos terminados de un día (ligas europeas y Mundial), desde football-data.org.
// Se consulta fecha → fecha+1 porque un partido nocturno en América ya es "mañana" en UTC.
export async function fetchFinishedByDate(date: string): Promise<FinishedMatch[]> {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/matches?status=FINISHED&dateFrom=${date}&dateTo=${addDays(date, 1)}`,
      { headers: { "X-Auth-Token": key }, next: { revalidate: 300 } }
    );
    if (!res.ok) return [];

    const data = await res.json();
    return (data.matches ?? [])
      .filter((m: any) => m.score?.fullTime?.home != null && m.score?.fullTime?.away != null)
      .map((m: any) => ({
        home: m.homeTeam.name,
        away: m.awayTeam.name,
        date: m.utcDate.slice(0, 10),
        homeScore: m.score.fullTime.home,
        awayScore: m.score.fullTime.away,
      }));
  } catch {
    return [];
  }
}

// Último partido terminado de un equipo (Liga Dimayor), desde TheSportsDB.
// Límite del plan gratis: solo el último → hay que resolver antes de que el equipo vuelva a jugar.
export async function fetchTeamLast(teamId: string): Promise<FinishedMatch[]> {
  if (!/^\d+$/.test(teamId)) return [];

  try {
    const res = await fetch(`${SPORTSDB_URL}/eventslast.php?id=${teamId}`, { next: { revalidate: 300 } });
    if (!res.ok) return [];

    const data = await res.json();
    return (data.results ?? data.events ?? [])
      .filter((e: any) => e.intHomeScore != null && e.intAwayScore != null)
      .map((e: any) => ({
        home: e.strHomeTeam,
        away: e.strAwayTeam,
        date: e.dateEvent,
        homeScore: parseInt(e.intHomeScore),
        awayScore: parseInt(e.intAwayScore),
      }));
  } catch {
    return [];
  }
}
