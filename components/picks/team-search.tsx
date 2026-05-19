"use client";

import { useState } from "react";
import Image from "next/image";
import { searchTeams, type Team } from "@/lib/teams";

type Props = {
  label: string;
  placeholder: string;
  onSelect: (name: string, logo: string) => void;
};

const LEAGUE_ICON: Record<string, string> = {
  "UEFA Champions League":  "⭐",
  "UEFA Europa League":     "🟠",
  "UEFA Conference League": "🔵",
  "Premier League":         "🦁",
  "La Liga":                "🇪🇸",
  "Bundesliga":             "🦅",
  "Serie A":                "🇮🇹",
  "Ligue 1":                "🇫🇷",
  "Liga Dimayor":           "🇨🇴",
};

function groupByLeague(teams: Team[]): Record<string, Team[]> {
  return teams.reduce((acc, team) => {
    if (!acc[team.league]) acc[team.league] = [];
    acc[team.league].push(team);
    return acc;
  }, {} as Record<string, Team[]>);
}

export default function TeamSearch({ label, placeholder, onSelect }: Props) {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<Team[]>([]);
  const [selected, setSelected] = useState<Team | null>(null);
  const [focused, setFocused]   = useState(false);

  function handleChange(value: string) {
    setQuery(value);
    setSelected(null);
    setResults(searchTeams(value));
    onSelect(value, "");
  }

  function handleSelect(team: Team) {
    setSelected(team);
    setQuery(team.name);
    setResults([]);
    setFocused(false);
    onSelect(team.name, team.logo);
  }

  function handleClear() {
    setSelected(null);
    setQuery("");
    setResults([]);
    onSelect("", "");
  }

  const grouped = groupByLeague(results);
  const showDropdown = focused && results.length > 0;
  const showEmpty    = focused && query.length >= 2 && results.length === 0;

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold" style={{ color: "#8fa8cc" }}>{label}</label>

      {selected ? (
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(34,197,94,0.10), rgba(22,163,74,0.06))",
            border: "1px solid rgba(34,197,94,0.30)",
          }}
        >
          {selected.logo ? (
            <Image src={selected.logo} alt={selected.name} width={30} height={30} className="object-contain flex-shrink-0 drop-shadow-sm" unoptimized />
          ) : (
            <span className="w-7 h-7 flex items-center justify-center text-lg flex-shrink-0">⚽</span>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold truncate">{selected.name}</p>
            <p className="text-xs" style={{ color: "#4ade80" }}>{selected.league}</p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="w-6 h-6 rounded-full flex items-center justify-center transition-all text-xs font-bold flex-shrink-0"
            style={{ color: "#6b87ab", background: "rgba(255,255,255,0.06)" }}
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder={placeholder}
            className="w-full text-white text-sm outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: focused ? "1px solid rgba(34,197,94,0.50)" : "1px solid rgba(255,255,255,0.09)",
              borderRadius: "12px",
              padding: "10px 14px",
              color: "#f0f6ff",
              boxShadow: focused ? "0 0 0 3px rgba(34,197,94,0.08)" : "none",
            }}
          />

          {/* Dropdown con animación */}
          {(showDropdown || showEmpty) && (
            <div
              className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl overflow-hidden"
              style={{
                background: "linear-gradient(160deg, #1c2d45 0%, #162035 100%)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)",
                maxHeight: "280px",
                overflowY: "auto",
                animation: "dropdownIn 0.18s ease-out forwards",
              }}
            >
              {showEmpty ? (
                <div className="px-4 py-3">
                  <p className="text-xs" style={{ color: "#4a6080" }}>No encontrado — se usará el nombre que escribiste.</p>
                </div>
              ) : (
                Object.entries(grouped).map(([leagueName, teams]) => (
                  <div key={leagueName}>
                    {/* Header de liga */}
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 sticky top-0"
                      style={{ background: "rgba(10,20,40,0.80)", backdropFilter: "blur(8px)" }}
                    >
                      <span className="text-xs">{LEAGUE_ICON[leagueName] ?? "🏆"}</span>
                      <span className="text-xs font-bold tracking-wide uppercase" style={{ color: "#4a6080" }}>
                        {leagueName}
                      </span>
                    </div>

                    {/* Equipos */}
                    {teams.map((team) => (
                      <button
                        key={team.id}
                        type="button"
                        onMouseDown={() => handleSelect(team)}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-left transition-all"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "rgba(34,197,94,0.08)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        }}
                      >
                        {team.logo ? (
                          <Image src={team.logo} alt={team.name} width={26} height={26} className="object-contain flex-shrink-0" unoptimized />
                        ) : (
                          <span className="w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">⚽</span>
                        )}
                        <span className="text-sm font-semibold" style={{ color: "#e8f0fe" }}>{team.name}</span>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
