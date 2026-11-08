"use client";

import { useEffect, useState } from "react";
import { createClient } from "./supabase";
import type { Pick } from "./types";

// Lista de picks que se actualiza sola (Supabase Realtime), sin recargar la página:
//   - UPDATE → likes, comentarios, resultado ✅/❌ y marcador cambian al instante
//   - INSERT → aparece el pick nuevo arriba (solo ese pick, no se vuelve a bajar todo)
//   - DELETE → desaparece el pick borrado
//
// `filter` limita qué picks se escuchan (formato de Supabase, ej. "user_id=eq.<id>").
// Sin filtro escucha todos (el feed).

export type LivePick = Pick & { profiles: { username: string; is_verified?: boolean } };

type Options = {
  channel: string;          // nombre único del canal
  filter?: string;
  acceptInserts?: boolean;  // la página de un pick no recibe picks nuevos
};

export function useLivePicks(initial: LivePick[], { channel, filter, acceptInserts = true }: Options) {
  const [picks, setPicks] = useState(initial);

  useEffect(() => {
    const supabase = createClient();
    const base = { schema: "public", table: "picks", ...(filter ? { filter } : {}) };

    const sub = supabase
      .channel(channel)
      .on("postgres_changes", { event: "UPDATE", ...base }, (payload) => {
        // payload.new no trae el autor (profiles), por eso se conserva el que ya había
        setPicks((curr) => curr.map((p) => (p.id === payload.new.id ? { ...p, ...(payload.new as Pick) } : p)));
      })
      // Los DELETE de Supabase no se pueden filtrar: si el pick no está en la lista, no pasa nada
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "picks" }, (payload) => {
        setPicks((curr) => curr.filter((p) => p.id !== payload.old.id));
      });

    if (acceptInserts) {
      sub.on("postgres_changes", { event: "INSERT", ...base }, async (payload) => {
        const { data } = await supabase
          .from("picks")
          .select("*, profiles(username, is_verified)")
          .eq("id", payload.new.id)
          .single();
        if (data) {
          setPicks((curr) => (curr.some((p) => p.id === data.id) ? curr : [data as LivePick, ...curr]));
        }
      });
    }

    sub.subscribe();
    return () => {
      supabase.removeChannel(sub);
    };
  }, [channel, filter, acceptInserts]);

  return [picks, setPicks] as const;
}
