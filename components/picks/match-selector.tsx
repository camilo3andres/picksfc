"use client";

import { useState } from "react";
import Image from "next/image";
import { searchTeams, usesFootballData, type Team } from "@/lib/teams";
import { searchTeamsFromAPI, getNextMatches, getNextMatchesSportsDB, type ApiMatch } from "@/lib/football-api";
import { getUSLocalDate } from "@/lib/utils";

export type SelectedMatch = {
  homeTeam: string;
  homeTeamLogo: string;
  awayTeam: string;
  awayTeamLogo: string;
  league: string;
  matchDate: string;
  matchTime: string | null;
};

type Props = {
  onSelect: (match: SelectedMatch) => void;
  onClear: () => void;
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
}

function TeamBadge({ url, name, size = 24 }: { url: string | null; name: string; size?: number }) {
  if (url) {
    return (
      <Image
        src={url}
        alt={name}
        width={size}
        height={size}
        className="object-contain flex-shrink-0 drop-shadow-sm"
        unoptimized
      />
    );
  }
  return <span className="flex-shrink-0 text-base">⚽</span>;
}

// Cada API numera los equipos distinto, así que nunca se mezclan IDs:
// el ID de football-data solo va a football-data y el de TheSportsDB solo a TheSportsDB.
async function fetchNextMatches(team: Team): Promise<ApiMatch[]> {
  // Ligas europeas: el ID de la lista ya es de football-data
  if (usesFootballData(team)) return getNextMatches(team.id);

  // Liga Dimayor con ID numérico: ya es el ID de TheSportsDB
  if (/^\d+$/.test(team.id)) return getNextMatchesSportsDB(team.id);

  // Liga Dimayor sin ID conocido ("col-*"): buscarlo por nombre en TheSportsDB
  const nameLower = (team.sportsdbName ?? team.name).toLowerCase();
  const results = await searchTeamsFromAPI(team.sportsdbName ?? team.name);
  const found =
    results.find((t) => t.strTeam.toLowerCase() === nameLower) ??
    results.find((t) => t.strTeam.toLowerCase().includes(nameLower) || nameLower.includes(t.strTeam.toLowerCase()));
  return found ? getNextMatchesSportsDB(found.idTeam) : [];
}

const COMPETITIONS = [
  { code: "WC",  label: "🌍 Mundial 2026" },
  { code: "CL",  label: "⭐ Champions League" },
  { code: "PL",  label: "🦁 Premier League" },
  { code: "PD",  label: "🇪🇸 La Liga" },
  { code: "BL1", label: "🦅 Bundesliga" },
  { code: "SA",  label: "🇮🇹 Serie A" },
  { code: "FL1", label: "🇫🇷 Ligue 1" },
];

export default function MatchSelector({ onSelect, onClear }: Props) {
  const [query, setQuery]                   = useState("");
  const [selectedTeam, setSelectedTeam]     = useState<Team | null>(null);
  const [matches, setMatches]               = useState<ApiMatch[]>([]);
  const [selectedMatch, setSelectedMatch]   = useState<ApiMatch | null>(null);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [focused, setFocused]               = useState(false);
  const [activeComp, setActiveComp]         = useState<string | null>(null);

  const localResults = query.length >= 2 ? searchTeams(query) : [];

  async function handleSelectTeam(team: Team) {
    setSelectedTeam(team);
    setQuery("");
    setFocused(false);
    setLoadingMatches(true);
    setMatches(await fetchNextMatches(team));
    setLoadingMatches(false);
  }

  function handleSelectMatch(match: ApiMatch) {
    setSelectedMatch(match);
    onSelect({
      homeTeam:     match.strHomeTeam,
      homeTeamLogo: match.strHomeTeamBadge ?? "",
      awayTeam:     match.strAwayTeam,
      awayTeamLogo: match.strAwayTeamBadge ?? "",
      league:       match.strLeague,
      matchDate:    getUSLocalDate(match.dateEvent, match.strTime),
      matchTime:    match.strTime ?? null,
    });
  }

  async function handleSelectCompetition(code: string, label: string) {
    setActiveComp(code);
    // Una competición se muestra como si fuera un "equipo" seleccionado (sin escudo)
    setSelectedTeam({ id: code, name: label, league: label, logo: "" });
    setLoadingMatches(true);
    setMatches([]);
    const res  = await fetch(`/api/football/competition?code=${code}`);
    const data = await res.json();
    setMatches(data);
    setLoadingMatches(false);
  }

  function handleClear() {
    setSelectedMatch(null);
    setSelectedTeam(null);
    setMatches([]);
    setQuery("");
    setActiveComp(null);
    onClear();
  }

  const inputStyle = {
    background:   "rgba(var(--tint-rgb), 0.05)",
    border:       focused ? "1px solid rgba(var(--primary-rgb), 0.50)" : "1px solid rgba(var(--tint-rgb), 0.09)",
    borderRadius: "12px",
    padding:      "10px 14px",
    color:        "var(--text)",
    boxShadow:    focused ? "0 0 0 3px rgba(var(--primary-rgb), 0.08)" : "none",
  };

  const dropdownStyle = {
    background:   "linear-gradient(160deg, var(--card-top) 0%, var(--card-bottom) 100%)",
    border:       "1px solid rgba(var(--tint-rgb), 0.10)",
    boxShadow:    "0 16px 48px rgba(0,0,0,0.55)",
    borderRadius: "12px",
  };

  /* ── Step 3: match selected ─────────────────────────────────── */
  if (selectedMatch) {
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>Partido</label>
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(var(--primary-rgb), 0.10), rgba(var(--primary-strong-rgb), 0.06))",
            border:     "1px solid rgba(var(--primary-rgb), 0.30)",
          }}
        >
          <TeamBadge url={selectedMatch.strHomeTeamBadge} name={selectedMatch.strHomeTeam} />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold truncate">
              {selectedMatch.strHomeTeam} vs {selectedMatch.strAwayTeam}
            </p>
            <p className="text-xs" style={{ color: "var(--primary-light)" }}>
              {selectedMatch.strLeague} · {formatDate(getUSLocalDate(selectedMatch.dateEvent, selectedMatch.strTime))}
            </p>
          </div>
          <TeamBadge url={selectedMatch.strAwayTeamBadge} name={selectedMatch.strAwayTeam} />
          <button
            type="button"
            onClick={handleClear}
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ml-1"
            style={{ color: "var(--text-3)", background: "rgba(var(--tint-rgb), 0.06)" }}
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  /* ── Step 2: team selected, show upcoming matches ────────────── */
  if (selectedTeam) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>
            Próximos partidos
          </label>
          <span className="text-sm font-black" style={{ color: "var(--text)" }}>{selectedTeam.name}</span>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs ml-auto"
            style={{ color: "var(--text-faint)" }}
          >
            ← cambiar equipo
          </button>
        </div>

        {loadingMatches ? (
          <div
            className="px-4 py-3 rounded-xl text-sm text-center"
            style={{ background: "rgba(var(--tint-rgb), 0.03)", border: "1px solid rgba(var(--tint-rgb), 0.07)", color: "var(--text-faint)" }}
          >
            Cargando partidos...
          </div>
        ) : matches.length === 0 ? (
          <div
            className="px-4 py-3 rounded-xl text-sm text-center"
            style={{ background: "rgba(var(--tint-rgb), 0.03)", border: "1px solid rgba(var(--tint-rgb), 0.07)", color: "var(--text-faint)" }}
          >
            No se encontraron próximos partidos para este equipo.
          </div>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(var(--tint-rgb), 0.10)" }}
          >
            {matches.map((match, i) => (
              <button
                key={match.idEvent}
                type="button"
                onClick={() => handleSelectMatch(match)}
                className="flex items-center gap-3 w-full px-3 py-3 text-left transition-all"
                style={{
                  borderBottom: i < matches.length - 1 ? "1px solid rgba(var(--tint-rgb), 0.05)" : "none",
                  background:   "transparent",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(var(--primary-rgb), 0.07)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <TeamBadge url={match.strHomeTeamBadge} name={match.strHomeTeam} size={22} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "#e8f0fe" }}>
                    {match.strHomeTeam}
                    <span className="font-normal mx-1.5" style={{ color: "var(--text-dim)" }}>vs</span>
                    {match.strAwayTeam}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
                    {match.strLeague} · {formatDate(getUSLocalDate(match.dateEvent, match.strTime))}
                  </p>
                </div>
                <TeamBadge url={match.strAwayTeamBadge} name={match.strAwayTeam} size={22} />
                <span className="text-xs ml-1 flex-shrink-0" style={{ color: "var(--text-dim)" }}>›</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── Step 1: search team ─────────────────────────────────────── */
  const showDropdown = focused && localResults.length > 0;
  const showEmpty    = focused && query.length >= 2 && localResults.length === 0;

  return (
    <div className="space-y-2">
      {/* Acceso rápido por competición */}
      <div>
        <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--text-faint)" }}>Acceso rápido</p>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {COMPETITIONS.map((comp) => (
            <button
              key={comp.code}
              type="button"
              onClick={() => handleSelectCompetition(comp.code, comp.label)}
              className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
              style={{
                background: "rgba(var(--tint-rgb), 0.05)",
                color: "var(--text-2)",
                border: "1px solid rgba(var(--tint-rgb), 0.09)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(var(--primary-rgb), 0.10)"; e.currentTarget.style.color = "var(--primary-light)"; e.currentTarget.style.borderColor = "rgba(var(--primary-rgb), 0.25)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(var(--tint-rgb), 0.05)"; e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.borderColor = "rgba(var(--tint-rgb), 0.09)"; }}
            >
              {comp.label}
            </button>
          ))}
        </div>
      </div>

      <label className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>O buscá un equipo</label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Ej: Barcelona, Liverpool, Nacional..."
          className="w-full text-sm outline-none transition-all"
          style={inputStyle}
        />

        {(showDropdown || showEmpty) && (
          <div
            className="absolute top-full left-0 right-0 mt-1.5 z-50 overflow-hidden"
            style={{ ...dropdownStyle, maxHeight: "260px", overflowY: "auto", animation: "dropdownIn 0.18s ease-out forwards" }}
          >
            {showEmpty ? (
              <div className="px-4 py-3 space-y-2">
                <p className="text-sm" style={{ color: "var(--text-faint)" }}>No encontrado en equipos de liga.</p>
                <button
                  type="button"
                  onMouseDown={() => handleSelectCompetition("WC", "🌍 Mundial 2026")}
                  className="w-full text-left text-xs font-bold px-3 py-2 rounded-lg transition-all"
                  style={{ background: "rgba(251,191,36,0.10)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}
                >
                  🌍 ¿Es una selección? Ver partidos del Mundial 2026 →
                </button>
              </div>
            ) : (
              localResults.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  onMouseDown={() => handleSelectTeam(team)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-left transition-all"
                  style={{ borderBottom: "1px solid rgba(var(--tint-rgb), 0.04)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(var(--primary-rgb), 0.08)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  <TeamBadge url={team.logo} name={team.name} size={26} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "#e8f0fe" }}>{team.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-faint)" }}>{team.league}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
