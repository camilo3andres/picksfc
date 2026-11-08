import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignorado cuando se llama desde un Server Component
          }
        },
      },
    }
  );
}

// Usuario con sesión iniciada (o null), para Server Components.
//
// - getClaims() verifica la firma del token de sesión sin viajar al servidor de
//   Supabase cuando el proyecto usa llaves de firma asimétricas (si no, hace la
//   consulta igual que getUser(): nunca es más lento y sigue siendo seguro).
// - cache() de React hace que, dentro de UNA misma carga de página, el layout y la
//   página compartan el resultado en vez de verificar la sesión dos veces.
export const getSessionUser = cache(async (): Promise<{ id: string } | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  return id ? { id } : null;
});
