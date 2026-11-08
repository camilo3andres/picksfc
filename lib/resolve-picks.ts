import type { FinishedMatch, Pick } from "./types";
import { TEAMS } from "./teams";
import { predictionHolds } from "./picks";

// Lógica del auto-resolver. No escribe en la base de datos: solo calcula qué
// resultado le corresponde a cada pick. La usan:
//   - el botón del panel admin (components/picks/auto-resolve-button.tsx)
//   - el cron automático (app/api/cron/resolve-picks/route.ts)

// "FC Barcelona" = "Barcelona", "Atlético Nacional" = "Atletico Nacional"
const GENERIC = new Set(["fc", "cf", "afc", "sc", "ac", "bc", "club", "de", "del", "the"]);

export function normalizeTeam(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w && !GENERIC.has(w))
    .join(" ");
}

export function sameTeam(a: string, b: string): boolean {
  const x = normalizeTeam(a);
  const y = normalizeTeam(b);
  return x.length > 0 && y.length > 0 && (x === y || x.includes(y) || y.includes(x));
}

// Busca el equipo en la lista de Liga Dimayor (por su nombre o por el de TheSportsDB)
function findDimayorTeam(teamName: string) {
  return TEAMS.find(
    (t) => t.league === "Liga Dimayor" && (sameTeam(t.name, teamName) || (t.sportsdbName && sameTeam(t.sportsdbName, teamName)))
  );
}

// ¿De dónde sale el resultado de este pick?
//  - "football-data": ligas europeas y Mundial → partidos terminados de esa fecha
//  - "sportsdb": Liga Dimayor → último partido del equipo (ID de TheSportsDB)
//  - "unknown": equipo colombiano sin ID → no se puede resolver solo
export type ResultSource =
  | { kind: "football-data"; date: string }
  | { kind: "sportsdb"; teamId: string }
  | { kind: "unknown" };

export function resultSource(pick: Pick): ResultSource {
  const dimayor = findDimayorTeam(pick.home_team) ?? findDimayorTeam(pick.away_team);
  if (!dimayor) return { kind: "football-data", date: pick.match_date };
  if (/^\d+$/.test(dimayor.id)) return { kind: "sportsdb", teamId: dimayor.id };
  return { kind: "unknown" };
}

// Cómo conseguir resultados. El botón usa fetch a /api/football/*; el cron llama
// directo a lib/match-results.ts (en el servidor no hace falta pasar por la API propia).
export type ResultLoaders = {
  byDate: (date: string) => Promise<FinishedMatch[]>;
  teamLast: (teamId: string) => Promise<FinishedMatch[]>;
};

// Envuelve los loaders con una caché: varios picks del mismo día o del mismo
// equipo comparten UNA sola llamada (football-data gratis = 10 llamadas/min).
export function withCache(loaders: ResultLoaders): ResultLoaders {
  const cache = new Map<string, Promise<FinishedMatch[]>>();
  const once = (key: string, fn: () => Promise<FinishedMatch[]>) => {
    if (!cache.has(key)) cache.set(key, fn());
    return cache.get(key)!;
  };
  return {
    byDate: (date) => once(`date:${date}`, () => loaders.byDate(date)),
    teamLast: (id) => once(`team:${id}`, () => loaders.teamLast(id)),
  };
}

// ¿Este partido es el del pick? Mismos equipos y fecha con ±1 día (husos horarios)
export function isPickMatch(pick: Pick, m: FinishedMatch): boolean {
  const days = Math.abs(new Date(m.date).getTime() - new Date(pick.match_date).getTime()) / 86_400_000;
  return sameTeam(pick.home_team, m.home) && sameTeam(pick.away_team, m.away) && days <= 1;
}

export type Resolution = {
  status: "correct" | "incorrect";
  home_score: number;
  away_score: number;
};

// Resultado final de un pick, o null si su partido aún no aparece como terminado.
export async function resolvePick(pick: Pick, loaders: ResultLoaders): Promise<Resolution | null> {
  const source = resultSource(pick);
  if (source.kind === "unknown") return null;

  const matches = source.kind === "football-data"
    ? await loaders.byDate(source.date)
    : await loaders.teamLast(source.teamId);

  const match = matches.find((m) => isPickMatch(pick, m));
  if (!match) return null;

  return {
    status: predictionHolds(pick.prediction, match.homeScore, match.awayScore) ? "correct" : "incorrect",
    home_score: match.homeScore,
    away_score: match.awayScore,
  };
}
