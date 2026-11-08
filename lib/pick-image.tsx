import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import type { Pick } from "@/lib/types";
import { predictionWithTeams, tipsterStats } from "@/lib/picks";
import { parseLocalDate } from "@/lib/utils";

// Dibuja la imagen compartible de un pick (1200x630).
// La usan dos rutas:
//   - app/(dashboard)/picks/[id]/opengraph-image.tsx → vista previa automática en WhatsApp/X/Facebook
//   - app/api/picks/[id]/image/route.tsx             → el botón "Compartir" la descarga como foto
//
// Ojo: aquí no funciona Tailwind ni las variables CSS de globals.css; el motor
// que dibuja la imagen (Satori) solo entiende estilos en línea y flexbox.
// Por eso los colores de la paleta se repiten abajo como constantes.

export const PICK_IMAGE_SIZE = { width: 1200, height: 630 };
const size = PICK_IMAGE_SIZE;

const C = {
  bg: "#0c1a36",
  bg3: "#172d5c",
  card: "#1c3a72",
  text: "#f3f8ff",
  text2: "#c3d4ee",
  muted: "#8ba4cc",
  primary: "#0ea5e9",
  primaryLight: "#38bdf8",
  primaryStrong: "#2563eb",
  success: "#4ade80",
  danger: "#f87171",
  gold: "#fbbf24",
};

// Fuente Outfit (la misma de la app). Si Google Fonts falla, se usa la fuente por defecto.
async function loadOutfit(weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Outfit:wght@${weight}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

// Satori no dibuja bien todos los SVG externos; si el escudo falla, se muestra un balón
function Crest({ src, name }: { src: string | null; name: string }) {
  if (!src) {
    return (
      <div style={{ width: 150, height: 150, borderRadius: 999, background: "rgba(150,195,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72 }}>
        ⚽
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={name} width={150} height={150} style={{ objectFit: "contain" }} />;
}

export async function renderPickImage(id: string): Promise<ImageResponse> {

  // Cliente sin cookies: la imagen es pública, no depende de quién la pida
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const { data: pick } = await supabase
    .from("picks")
    .select("*, profiles(username)")
    .eq("id", id)
    .single<Pick & { profiles: { username: string } }>();

  const [bold, black] = await Promise.all([loadOutfit(700), loadOutfit(900)]);
  const fonts = [
    ...(bold ? [{ name: "Outfit", data: bold, weight: 700 as const, style: "normal" as const }] : []),
    ...(black ? [{ name: "Outfit", data: black, weight: 900 as const, style: "normal" as const }] : []),
  ];

  // Pick borrado o inexistente: imagen genérica de la marca
  if (!pick) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, color: C.text, fontSize: 80, fontWeight: 900, fontFamily: "Outfit" }}>
          Picks<span style={{ color: C.primaryLight }}>FC</span>
        </div>
      ),
      { ...size, fonts }
    );
  }

  const { data: authorPicks } = await supabase
    .from("picks")
    .select("status")
    .eq("user_id", pick.user_id)
    .order("created_at", { ascending: false });
  const stats = tipsterStats(authorPicks ?? []);

  const username = pick.profiles.username;
  const date = parseLocalDate(pick.match_date).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
  const hasResult = pick.home_score !== null && pick.away_score !== null;

  const resultBadge =
    pick.status === "correct"   ? { text: "✅ ACERTADO", color: C.success } :
    pick.status === "incorrect" ? { text: "❌ FALLADO",  color: C.danger  } :
    null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "44px 56px",
          fontFamily: "Outfit",
          color: C.text,
          background: `radial-gradient(900px 420px at 50% -10%, rgba(14,165,233,0.30), transparent 70%), linear-gradient(180deg, ${C.bg3} 0%, ${C.bg} 100%)`,
        }}
      >
        {/* Encabezado: marca + liga */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 900 }}>
            Picks<span style={{ color: C.primaryLight }}>FC</span>
          </div>
          <div style={{ display: "flex", fontSize: 24, fontWeight: 700, color: C.text2, padding: "10px 22px", borderRadius: 999, background: "rgba(150,195,255,0.10)", border: "1px solid rgba(150,195,255,0.18)" }}>
            🏆 {pick.league}
          </div>
        </div>

        {/* Partido */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 34, padding: "30px 40px", borderRadius: 32, background: "rgba(150,195,255,0.07)", border: "1px solid rgba(150,195,255,0.14)" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 360 }}>
            <Crest src={pick.home_team_logo} name={pick.home_team} />
            <div style={{ display: "flex", marginTop: 16, fontSize: 32, fontWeight: 900, textAlign: "center" }}>{pick.home_team}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {hasResult ? (
              <div style={{ display: "flex", fontSize: 76, fontWeight: 900 }}>{pick.home_score} - {pick.away_score}</div>
            ) : (
              <div style={{ display: "flex", fontSize: 56, fontWeight: 900, color: C.muted, letterSpacing: 6 }}>VS</div>
            )}
            <div style={{ display: "flex", fontSize: 24, fontWeight: 700, color: C.muted, marginTop: 6 }}>{hasResult ? "Final" : date}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 360 }}>
            <Crest src={pick.away_team_logo} name={pick.away_team} />
            <div style={{ display: "flex", marginTop: 16, fontSize: 32, fontWeight: 900, textAlign: "center" }}>{pick.away_team}</div>
          </div>
        </div>

        {/* Pronóstico (+ resultado si ya se resolvió) */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, marginTop: 28 }}>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 900, padding: "14px 40px", borderRadius: 999, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryStrong})`, boxShadow: "0 8px 30px rgba(14,165,233,0.45)" }}>
            {predictionWithTeams(pick)}
          </div>
          {resultBadge && (
            <div style={{ display: "flex", fontSize: 30, fontWeight: 900, color: resultBadge.color, padding: "12px 28px", borderRadius: 999, border: `2px solid ${resultBadge.color}` }}>
              {resultBadge.text}
            </div>
          )}
        </div>

        {/* Pie: tipster y estadísticas */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ display: "flex", width: 64, height: 64, borderRadius: 999, alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 900, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryStrong})` }}>
              {username[0].toUpperCase()}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 30, fontWeight: 900 }}>@{username}</div>
              <div style={{ display: "flex", gap: 22, fontSize: 24, fontWeight: 700, color: C.text2 }}>
                <span>{stats.accuracy}% acierto</span>
                <span style={{ color: C.muted }}>·</span>
                <span>{stats.total} {stats.total === 1 ? "pick" : "picks"}</span>
                {stats.streak >= 2 && (
                  <>
                    <span style={{ color: C.muted }}>·</span>
                    <span style={{ color: C.gold }}>🔥 {stats.streak} seguidos</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: C.primaryLight }}>picksfc.com</div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
