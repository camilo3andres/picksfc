import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // Modo mantenimiento — se activa con MAINTENANCE_MODE=true en Vercel.
  // En localhost la variable no existe, así que se trabaja normal.
  if (process.env.MAINTENANCE_MODE === "true") {
    const { pathname } = request.nextUrl;

    // El auto-resolver sigue funcionando en mantenimiento (está protegido con CRON_SECRET)
    if (pathname.startsWith("/api/cron/")) return NextResponse.next();

    // Las APIs responden con error en vez de HTML
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "En mantenimiento" }, { status: 503 });
    }

    // El logo sí debe cargar para que se vea la pantalla de mantenimiento
    if (pathname === "/icon.png") return NextResponse.next();

    // 503 = "no disponible temporalmente" → Google no saca la página del buscador
    return NextResponse.rewrite(new URL("/mantenimiento", request.url), { status: 503 });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresca la sesión si hace falta y dice si hay usuario.
  // getClaims() verifica el token sin ir al servidor de Supabase (más rápido que getUser()).
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims?.sub ? { id: data.claims.sub } : null;

  // Rutas protegidas — redirige al login si no hay sesión
  const protectedRoutes = ["/picks/new", "/admin"];
  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Si ya está logueado, no puede entrar al login/register
  if (user && ["/login", "/register"].includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  return supabaseResponse;
}

// El proxy corre ANTES de cada petición, así que se excluye todo lo que no
// necesita sesión: archivos estáticos, imágenes y las APIs públicas de fútbol.
// Así esas peticiones responden más rápido.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|robots.txt|sitemap.xml|api/football|api/picks|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
