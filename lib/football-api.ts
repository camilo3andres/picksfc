export type ApiTeam = {
  idTeam: string;
  strTeam: string;
  strBadge: string | null;
  strLeague: string;
  strCountry: string;
};

export type ApiMatch = {
  idEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  strLeague: string;
  dateEvent: string;
  strTime: string | null;
  strHomeTeamBadge: string | null;
  strAwayTeamBadge: string | null;
};

export async function searchTeamsFromAPI(name: string): Promise<ApiTeam[]> {
  if (name.length < 2) return [];
  try {
    const res = await fetch(`/api/football/search?name=${encodeURIComponent(name)}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getNextMatches(teamId: string): Promise<ApiMatch[]> {
  try {
    const res = await fetch(`/api/football/matches?id=${teamId}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
