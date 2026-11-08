import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Términos y condiciones", // la plantilla del layout agrega "· PicksFC"
  description: `Reglas de uso de ${LEGAL.siteName}, la comunidad de pronósticos de fútbol.`,
};

// Términos y condiciones de uso. Los datos variables vienen de lib/legal.ts.
export default function TerminosPage() {
  const mail = <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>;

  return (
    <article>
      <h1>Términos y condiciones</h1>
      <p style={{ color: "var(--text-muted)" }}>Última actualización: {LEGAL.lastUpdated}</p>

      <p>
        Bienvenido a {LEGAL.siteName}, una comunidad donde las personas comparten y comparan sus pronósticos
        de fútbol. Al crear una cuenta o usar el sitio aceptas estos términos. Si no estás de acuerdo, por
        favor no uses la plataforma.
      </p>

      <h2>1. Qué es y qué no es {LEGAL.siteName}</h2>
      <ul>
        <li>Es una <strong>red social de pronósticos</strong>: publicas qué crees que va a pasar en un partido y la comunidad ve tu historial de aciertos.</li>
        <li><strong>No es una casa de apuestas.</strong> En {LEGAL.siteName} no se apuesta dinero, no se reciben pagos por apuestas y no se entregan premios en dinero.</li>
        <li><strong>No es asesoría de apuestas.</strong> Los picks son opiniones personales de cada usuario.</li>
      </ul>

      <h2>2. Los picks son opiniones, sin garantía</h2>
      <p>
        Ningún pick, porcentaje de acierto, racha o ranking garantiza resultados futuros. El fútbol es
        impredecible. Si decides apostar en otro lugar basándote en algo que viste aquí, lo haces bajo tu
        propia responsabilidad: {LEGAL.siteName} y sus usuarios no responden por pérdidas de dinero.
      </p>
      <p>
        Si apuestas, hazlo solo en operadores autorizados por Coljuegos, con dinero que puedas permitirte
        perder. Si sientes que el juego te está afectando, busca ayuda profesional.
      </p>

      <h2>3. Quién puede usarlo</h2>
      <ul>
        <li>Debes tener <strong>{LEGAL.minimumAge} años o más</strong>.</li>
        <li>Debes dar datos reales al registrarte y mantener segura tu contraseña. Eres responsable de lo que se haga con tu cuenta.</li>
        <li>Una cuenta por persona.</li>
      </ul>

      <h2>4. Reglas de la comunidad</h2>
      <p>No está permitido:</p>
      <ul>
        <li>Insultar, acosar, amenazar o discriminar a otras personas.</li>
        <li>Publicar contenido sexual, violento o ilegal.</li>
        <li>Hacer spam, publicidad no autorizada o promocionar estafas, «fijas» pagas o grupos de apuestas.</li>
        <li>Hacerse pasar por otra persona.</li>
        <li>Manipular el ranking (por ejemplo, con varias cuentas) o intentar vulnerar la seguridad del sitio.</li>
      </ul>

      <h2>5. Tu contenido</h2>
      <p>
        Los picks y comentarios que publicas siguen siendo tuyos, pero nos das permiso para mostrarlos dentro
        de {LEGAL.siteName} y en las imágenes para compartir que genera la plataforma. Los picks se cierran
        cuando empieza el partido y se resuelven automáticamente con el resultado oficial.
      </p>

      <h2>6. Moderación y suspensión</h2>
      <p>
        Podemos ocultar o borrar comentarios, análisis, biografías, enlaces o nombres de usuario que incumplan
        estas reglas, y suspender o eliminar cuentas que las incumplan de forma grave o repetida. Si crees que
        fue un error, escríbenos a {mail}.
      </p>

      <h2>7. Disponibilidad del servicio</h2>
      <p>
        {LEGAL.siteName} se ofrece «tal como está». Hacemos lo posible por que funcione bien, pero puede haber
        errores, pausas por mantenimiento o resultados de partidos que tarden en actualizarse.
      </p>

      <h2>8. Escudos y nombres de equipos</h2>
      <p>
        Los nombres y escudos de equipos y ligas pertenecen a sus dueños y se muestran solo para identificar
        los partidos. {LEGAL.siteName} no está afiliado a ningún club, liga ni federación.
      </p>

      <h2>9. Privacidad</h2>
      <p>
        El uso de tus datos personales se explica en nuestra <Link href="/privacidad">Política de privacidad</Link>.
      </p>

      <h2>10. Cambios y ley aplicable</h2>
      <p>
        Podemos actualizar estos términos; la fecha de arriba indica la última versión. Estos términos se rigen
        por las leyes de {LEGAL.country}. Para cualquier duda escríbenos a {mail}.
      </p>
    </article>
  );
}
