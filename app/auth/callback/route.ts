import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  // Solo rutas internas ("/feed", "/reset-password"...). Sin esta validación, un
  // link como ?next=@sitio-falso.com armaría "https://picksfc.com@sitio-falso.com",
  // que el navegador abre como sitio-falso.com (open redirect, usado en phishing).
  const rawNext = searchParams.get("next") ?? "/feed";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") && !rawNext.startsWith("/\\") ? rawNext : "/feed";

  const supabase = await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  } else if (tokenHash && type) {
    await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as EmailOtpType });
  }

  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
