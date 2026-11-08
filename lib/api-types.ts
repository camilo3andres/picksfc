// Forma de los datos que devuelven las APIs de fútbol externas.
//
// Solo se declaran los campos que PicksFC usa. Así TypeScript avisa si se
// escribe mal un campo (ej. homeTeam.nombre en vez de homeTeam.name) antes de
// que la página falle, en vez de aceptar "cualquier cosa" (any).

// ─── football-data.org (ligas europeas, Mundial) ──────────────────────────

export type FootballDataMatch = {
  id: number;
  utcDate: string; // "2026-11-08T20:00:00Z"
  status: string;  // "SCHEDULED" | "IN_PLAY" | "FINISHED" | ...
  competition: { name: string };
  homeTeam: { name: string | null; crest?: string | null };
  awayTeam: { name: string | null; crest?: string | null };
  score?: { fullTime?: { home: number | null; away: number | null } };
};

export type FootballDataMatchesResponse = { matches?: FootballDataMatch[] };

// ─── TheSportsDB (Liga Dimayor, búsqueda de equipos) ──────────────────────

export type SportsDbEvent = {
  idEvent: string;
  strSport?: string | null;
  strLeague: string;
  strHomeTeam: string;
  strAwayTeam: string;
  dateEvent: string;           // "2026-11-07"
  strTime?: string | null;     // "23:10:00"
  strStatus?: string | null;   // "FT" = terminado; "1H", "2H", "HT"... = en juego
  intHomeScore?: string | null;
  intAwayScore?: string | null;
  strHomeTeamBadge?: string | null;
  strAwayTeamBadge?: string | null;
};

export type SportsDbEventsResponse = { events?: SportsDbEvent[] | null; results?: SportsDbEvent[] | null };

export type SportsDbTeam = {
  idTeam: string;
  strTeam: string;
  strSport?: string | null;
  strLeague?: string | null;
  strTeamBadge?: string | null;
};

export type SportsDbTeamsResponse = { teams?: SportsDbTeam[] | null };
