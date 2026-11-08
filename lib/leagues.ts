// football-data.org usa nombres oficiales que no siempre coinciden con los que
// usa PicksFC (colores de etiqueta, filtros, lista de equipos). Aquí se traducen
// en un solo lugar. Si aparece otra liga con nombre raro, se agrega a este mapa.
const LEAGUE_ALIASES: Record<string, string> = {
  "Primera Division": "La Liga",
  "Primera División": "La Liga",
  // TheSportsDB llama así a la liga colombiana
  "Colombia Categoría Primera A": "Liga Dimayor",
  "Colombia Categoria Primera A": "Liga Dimayor",
};

export function normalizeLeague(name: string): string {
  return LEAGUE_ALIASES[name] ?? name;
}
