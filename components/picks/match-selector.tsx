"use client";

import { useState } from "react";
import Image from "next/image";
import { searchTeams, type Team } from "@/lib/teams";
import { searchTeamsFromAPI, getNextMatches, type ApiMatch } from "@/lib/football-api";
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
    const nameLower = team.name.toLowerCase();
    const nameWords = nameLower.split(/\s+/).filter(w => w.length > 3);
    const firstWord = team.name.split(" ")[0];

    const findMatch = (teams: Awaited<ReturnType<typeof searchTeamsFromAPI>>) =>
      teams.find(t => t.strTeam.toLowerCase() === nameLower) ??
      teams.find(t => t.strTeam.toLowerCase().includes(nameLower)) ??
      teams.find(t => nameLower.includes(t.strTeam.toLowerCase())) ??
      teams.find(t => nameWords.some(w => t.strTeam.toLowerCase().includes(w)));

    // intento 1: nombre en TheSportsDB (o nombre completo)
    const primaryName = team.sportsdbName ?? team.name;
    const results1 = await searchTeamsFromAPI(primaryName);
    console.log("[MatchSelector] búsqueda:", primaryName, "→", results1.map(t => `${t.strTeam} (id:${t.idTeam})`));
    let apiTeam = findMatch(results1);
    console.log("[MatchSelector] match encontrado:", apiTeam?.strTeam, apiTeam?.idTeam);

    // intento 2: primera palabra sola como fallback
    if (!apiTeam && firstWord !== primaryName) {
      const results2 = await searchTeamsFromAPI(firstWord);
      console.log("[MatchSelector] fallback búsqueda:", firstWord, "→", results2.map(t => `${t.strTeam} (id:${t.idTeam})`));
      apiTeam = findMatch(results2);
    }

    if (!apiTeam) { setMatches([]); setLoadingMatches(false); return; }
    const next = await getNextMatches(apiTeam.idTeam);
    setMatches(next);
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
    setSelectedTeam({ id: code, name: label, league: label, logo: null } as any);
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
    background:   "rgba(255,255,255,0.05)",
    border:       focused ? "1px solid rgba(34,197,94,0.50)" : "1px solid rgba(255,255,255,0.09)",
    borderRadius: "12px",
    padding:      "10px 14px",
    color:        "#f0f6ff",
    boxShadow:    focused ? "0 0 0 3px rgba(34,197,94,0.08)" : "none",
  };

  const dropdownStyle = {
    background:   "linear-gradient(160deg, #1c2d45 0%, #162035 100%)",
    border:       "1px solid rgba(255,255,255,0.10)",
    boxShadow:    "0 16px 48px rgba(0,0,0,0.55)",
    borderRadius: "12px",
  };

  /* ── Step 3: match selected ─────────────────────────────────── */
  if (selectedMatch) {
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-semibold" style={{ color: "#8fa8cc" }}>Partido</label>
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(34,197,94,0.10), rgba(22,163,74,0.06))",
            border:     "1px solid rgba(34,197,94,0.30)",
          }}
        >
          <TeamBadge url={selectedMatch.strHomeTeamBadge} name={selectedMatch.strHomeTeam} />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold truncate">
              {selectedMatch.strHomeTeam} vs {selectedMatch.strAwayTeam}
            </p>
            <p className="text-xs" style={{ color: "#4ade80" }}>
              {selectedMatch.strLeague} · {formatDate(getUSLocalDate(selectedMatch.dateEvent, selectedMatch.strTime))}
            </p>
          </div>
          <TeamBadge url={selectedMatch.strAwayTeamBadge} name={selectedMatch.strAwayTeam} />
          <button
            type="button"
            onClick={handleClear}
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ml-1"
            style={{ color: "#6b87ab", background: "rgba(255,255,255,0.06)" }}
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
          <label className="text-sm font-semibold" style={{ color: "#8fa8cc" }}>
            Próximos partidos
          </label>
          <span className="text-sm font-black" style={{ color: "#f0f6ff" }}>{selectedTeam.name}</span>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs ml-auto"
            style={{ color: "#4a6080" }}
          >
            ← cambiar equipo
          </button>
        </div>

        {loadingMatches ? (
          <div
            className="px-4 py-3 rounded-xl text-sm text-center"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#4a6080" }}
          >
            Cargando partidos...
          </div>
        ) : matches.length === 0 ? (
          <div
            className="px-4 py-3 rounded-xl text-sm text-center"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#4a6080" }}
          >
            No se encontraron próximos partidos para este equipo.
          </div>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.10)" }}
          >
            {matches.map((match, i) => (
              <button
                key={match.idEvent}
                type="button"
                onClick={() => handleSelectMatch(match)}
                className="flex items-center gap-3 w-full px-3 py-3 text-left transition-all"
                style={{
                  borderBottom: i < matches.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  background:   "transparent",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(34,197,94,0.07)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <TeamBadge url={match.strHomeTeamBadge} name={match.strHomeTeam} size={22} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "#e8f0fe" }}>
                    {match.strHomeTeam}
                    <span className="font-normal mx-1.5" style={{ color: "#3a5070" }}>vs</span>
                    {match.strAwayTeam}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#4a6080" }}>
                    {match.strLeague} · {formatDate(getUSLocalDate(match.dateEvent, match.strTime))}
                  </p>
                </div>
                <TeamBadge url={match.strAwayTeamBadge} name={match.strAwayTeam} size={22} />
                <span className="text-xs ml-1 flex-shrink-0" style={{ color: "#2a4060" }}>›</span>
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
        <p className="text-xs font-semibold mb-1.5" style={{ color: "#4a6080" }}>Acceso rápido</p>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {COMPETITIONS.map((comp) => (
            <button
              key={comp.code}
              type="button"
              onClick={() => handleSelectCompetition(comp.code, comp.label)}
              className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "#8fa8cc",
                border: "1px solid rgba(255,255,255,0.09)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(34,197,94,0.10)"; e.currentTarget.style.color = "#4ade80"; e.currentTarget.style.borderColor = "rgba(34,197,94,0.25)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#8fa8cc"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }}
            >
              {comp.label}
            </button>
          ))}
        </div>
      </div>

      <label className="text-sm font-semibold" style={{ color: "#8fa8cc" }}>O buscá un equipo</label>
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
                <p className="text-sm" style={{ color: "#4a6080" }}>No encontrado en equipos de liga.</p>
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
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(34,197,94,0.08)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  <TeamBadge url={team.logo} name={team.name} size={26} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "#e8f0fe" }}>{team.name}</p>
                    <p className="text-xs" style={{ color: "#4a6080" }}>{team.league}</p>
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
