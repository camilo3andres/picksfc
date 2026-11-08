"use client";

import { useState } from "react";

// Botón único de seguir, al estilo X/Twitter:
//   - No lo sigues     → "+ Seguir" (azul)
//   - Ya lo sigues     → "Siguiendo ✓"
//   - Mouse encima     → "Dejar de seguir" (rojo)
// Dejar de seguir pide confirmación: en el celular no hay "mouse encima",
// así que un toque sin querer no debe bastar.

type Props = {
  following: boolean;
  username: string;
  onToggle: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
};

export default function FollowToggle({ following, username, onToggle, disabled, size = "sm" }: Props) {
  const [hover, setHover] = useState(false);
  const pad = size === "sm" ? "text-xs px-2.5 py-1" : "text-sm px-4 py-1.5";

  function handleClick() {
    if (following && !confirm(`¿Dejar de seguir a @${username}?`)) return;
    onToggle();
  }

  if (!following) {
    return (
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`${pad} font-bold rounded-lg transition-all disabled:opacity-50`}
        style={{
          color: "#fff",
          background: "linear-gradient(135deg, var(--primary), var(--primary-strong))",
          boxShadow: "0 2px 10px rgba(var(--primary-rgb), 0.25)",
        }}
      >
        + Seguir
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`${pad} font-bold rounded-lg transition-all disabled:opacity-50 min-w-[7.5rem]`}
      style={hover
        ? { color: "#f87171", background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.30)" }
        : { color: "var(--primary-light)", background: "rgba(var(--primary-light-rgb), 0.08)", border: "1px solid rgba(var(--primary-light-rgb), 0.22)" }}
    >
      {hover ? "Dejar de seguir" : "Siguiendo ✓"}
    </button>
  );
}
