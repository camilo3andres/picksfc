import type { ApiMatch } from "./football-api";
import type { FootballDataMatch, SportsDbEvent } from "./api-types";
import { normalizeLeague } from "./leagues";

// Convierten un partido de cada API al formato único de la app (ApiMatch),
// para que el selector de partidos no tenga que saber de qué API vino.
// Antes este código estaba copiado en varias rutas.

// football-data.org → ApiMatch. Devuelve null si aún no se conocen los equipos
// (ej. cruces de eliminación directa "por definir").
export function fromFootballData(m: FootballDataMatch): ApiMatch | null {
  if (!m.homeTeam.name || !m.awayTeam.name) return null;
  const [date, time] = m.utcDate.split("T");
  return {
    idEvent:          String(m.id),
    strHomeTeam:      m.homeTeam.name,
    strAwayTeam:      m.awayTeam.name,
    strLeague:        normalizeLeague(m.competition.name),
    dateEvent:        date,
    strTime:          time?.slice(0, 5) ?? null,
    strHomeTeamBadge: m.homeTeam.crest ?? null,
    strAwayTeamBadge: m.awayTeam.crest ?? null,
  };
}

// TheSportsDB → ApiMatch. Devuelve null si no es fútbol o le faltan equipos.
export function fromSportsDb(e: SportsDbEvent): ApiMatch | null {
  if (e.strSport !== "Soccer" || !e.strHomeTeam || !e.strAwayTeam) return null;
  return {
    idEvent:          String(e.idEvent),
    strHomeTeam:      e.strHomeTeam,
    strAwayTeam:      e.strAwayTeam,
    strLeague:        normalizeLeague(e.strLeague),
    dateEvent:        e.dateEvent,
    strTime:          e.strTime?.slice(0, 5) ?? null,
    strHomeTeamBadge: e.strHomeTeamBadge ?? null,
    strAwayTeamBadge: e.strAwayTeamBadge ?? null,
  };
}

// Convierte una lista y descarta los partidos que no sirven (null)
export function mapMatches<T>(items: T[] | null | undefined, convert: (item: T) => ApiMatch | null): ApiMatch[] {
  return (items ?? []).map(convert).filter((m): m is ApiMatch => m !== null);
}
