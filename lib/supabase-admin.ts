import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase con la llave service_role. SOLO SERVIDOR.
//
// ⚠️ Esta llave se salta todas las reglas RLS: puede leer y modificar cualquier fila.
// Por eso:
//   - nunca lleva el prefijo NEXT_PUBLIC_ (así Next.js jamás la manda al navegador)
//   - solo se importa desde rutas del servidor protegidas (hoy: /api/cron/resolve-picks)
//   - vive en .env.local y en las variables de entorno de Vercel, nunca en git
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
