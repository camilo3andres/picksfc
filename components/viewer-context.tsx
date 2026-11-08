"use client";

import { createContext, useContext } from "react";

// Información de quién está viendo la app (por ahora: si es admin).
// El layout del dashboard la consulta UNA vez en el servidor y la comparte aquí,
// así cualquier componente la lee con useViewer() sin pasarla de prop en prop.
//
// Ojo: esto solo decide qué botones se MUESTRAN. La seguridad real está en las
// reglas RLS de Supabase: aunque alguien fuerce el botón, la base rechaza la acción.

type Viewer = { isAdmin: boolean };

const ViewerContext = createContext<Viewer>({ isAdmin: false });

export function ViewerProvider({ isAdmin, children }: Viewer & { children: React.ReactNode }) {
  return <ViewerContext.Provider value={{ isAdmin }}>{children}</ViewerContext.Provider>;
}

export function useViewer(): Viewer {
  return useContext(ViewerContext);
}
