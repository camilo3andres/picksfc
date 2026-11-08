"use client";

import { useEffect, useRef, useState } from "react";
import { TrashIcon } from "@/components/ui/icons";

// Menú "⋯" de la tarjeta (solo lo ve el dueño del pick).
// Borrar quedó aquí escondido para que no se toque sin querer, y además pide confirmación.

export default function PickOptionsMenu({ onDelete }: { onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera del menú o al presionar Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Opciones del pick"
        aria-expanded={open}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg leading-none transition-colors hover:bg-white/5"
        style={{ color: "var(--text-3)" }}
      >
        ⋯
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-9 z-20 min-w-44 rounded-xl p-1 shadow-xl"
          style={{ background: "var(--surface-2)", border: "1px solid rgba(var(--tint-rgb), 0.14)" }}
        >
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-left transition-colors hover:bg-red-500/10"
            style={{ color: "#f87171" }}
          >
            <TrashIcon size={14} /> Eliminar pick
          </button>
        </div>
      )}
    </div>
  );
}
