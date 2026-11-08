import type { Pick } from "./types";

// Cuántos picks se cargan en el feed por tanda. Los siguientes llegan solos al
// bajar (scroll infinito). Pocos por tanda = la página aparece y responde más rápido.
export const FEED_PAGE_SIZE = 12;

// Texto corto de cada predicción (tarjeta del pick)
export const PREDICTION_LABEL: Record<Pick["prediction"], string> = {
  home:      "Gana Local",
  draw:      "Empate",
  away:      "Gana Visitante",
  home_draw: "Local o Empate",
  away_draw: "Visitante o Empate",
};

// Texto con el nombre del equipo, para la imagen compartible: "Gana FC Barcelona"
export function predictionWithTeams(pick: Pick): string {
  switch (pick.prediction) {
    case "home":      return `Gana ${pick.home_team}`;
    case "away":      return `Gana ${pick.away_team}`;
    case "draw":      return "Empate";
    case "home_draw": return `${pick.home_team} o empate`;
    case "away_draw": return `${pick.away_team} o empate`;
  }
}

// ¿La predicción se cumple con este marcador? Sirve para el marcador en vivo
// ("vas acertando") y es la misma regla que usa el auto-resolver.
export function predictionHolds(prediction: Pick["prediction"], home: number, away: number): boolean {
  switch (prediction) {
    case "home":      return home > away;
    case "away":      return away > home;
    case "draw":      return home === away;
    case "home_draw": return home >= away;
    case "away_draw": return away >= home;
  }
}

// Estadísticas del tipster a partir de sus picks (ordenados del más nuevo al más viejo)
export function tipsterStats(picks: { status: Pick["status"] }[]) {
  const resolved = picks.filter((p) => p.status !== "pending");
  const correct = resolved.filter((p) => p.status === "correct").length;

  // Racha: aciertos seguidos desde el pick resuelto más reciente
  let streak = 0;
  for (const p of resolved) {
    if (p.status === "correct") streak++;
    else break;
  }

  return {
    total: picks.length,
    resolved: resolved.length,
    accuracy: resolved.length > 0 ? Math.round((correct / resolved.length) * 100) : 0,
    streak,
  };
}
