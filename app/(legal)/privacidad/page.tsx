import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de privacidad", // la plantilla del layout agrega "· PicksFC"
  description: `Cómo ${LEGAL.siteName} recoge, usa y protege tus datos personales.`,
};

// Política de tratamiento de datos personales (Ley 1581 de 2012 y Decreto 1377 de 2013, Colombia).
// Los datos variables (responsable, correo, fecha) vienen de lib/legal.ts.
export default function PrivacidadPage() {
  const mail = <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>;

  return (
    <article>
      <h1>Política de privacidad</h1>
      <p style={{ color: "var(--text-muted)" }}>Última actualización: {LEGAL.lastUpdated}</p>

      <p>
        En {LEGAL.siteName} respetamos tu privacidad. Esta política explica qué datos personales guardamos,
        para qué los usamos y cómo puedes conocerlos, corregirlos o pedir que los borremos, de acuerdo con la
        Ley 1581 de 2012 de Colombia (Habeas Data) y sus normas reglamentarias.
      </p>

      <h2>1. Responsable de tus datos</h2>
      <ul>
        <li><strong>Responsable:</strong> {LEGAL.ownerName}</li>
        <li><strong>Ubicación:</strong> {LEGAL.ownerCity}</li>
        <li><strong>Correo de contacto:</strong> {mail}</li>
        <li><strong>Sitio web:</strong> {LEGAL.siteUrl}</li>
      </ul>

      <h2>2. Qué datos guardamos</h2>
      <ul>
        <li><strong>Datos de tu cuenta:</strong> correo electrónico y contraseña. La contraseña se guarda cifrada; nadie, ni siquiera nosotros, puede verla.</li>
        <li><strong>Perfil público:</strong> nombre de usuario y, si decides agregarlos, biografía y enlaces a tus redes (Instagram, TikTok, X, Telegram).</li>
        <li><strong>Tu actividad:</strong> los picks que publicas, tus comentarios, los likes que das y las personas que sigues.</li>
        <li><strong>Datos técnicos mínimos:</strong> cookies necesarias para mantener tu sesión iniciada.</li>
      </ul>
      <p>No pedimos ni guardamos datos sensibles, documentos de identidad ni información de pago.</p>

      <h2>3. Para qué los usamos</h2>
      <ul>
        <li>Crear y administrar tu cuenta, e iniciar sesión.</li>
        <li>Mostrar tu perfil, tus picks y tus estadísticas (aciertos, precisión, racha) a la comunidad.</li>
        <li>Calcular el ranking de pronosticadores.</li>
        <li>Enviarte correos necesarios del servicio, como confirmar tu cuenta o recuperar tu contraseña.</li>
        <li>Mantener la seguridad de la plataforma y prevenir abusos.</li>
      </ul>
      <p>No vendemos ni alquilamos tus datos a nadie, y no los usamos para publicidad de terceros.</p>

      <h2>4. Qué es público</h2>
      <p>
        {LEGAL.siteName} es una comunidad abierta: tu nombre de usuario, biografía, redes, picks, comentarios y
        estadísticas los puede ver cualquier visitante. Tu correo electrónico <strong>nunca</strong> se muestra.
      </p>

      <h2>5. Con quién se comparten</h2>
      <p>
        Para funcionar usamos proveedores que guardan o procesan datos por nosotros, con sus propias medidas de
        seguridad. Algunos tienen servidores fuera de Colombia:
      </p>
      <ul>
        <li><strong>Supabase:</strong> base de datos y sistema de inicio de sesión.</li>
        <li><strong>Vercel:</strong> alojamiento del sitio web.</li>
      </ul>
      <p>
        Los resultados de los partidos vienen de servicios de datos deportivos (football-data.org y TheSportsDB);
        a ellos no les enviamos datos personales. Solo entregaríamos información a una autoridad si la ley lo exige.
      </p>

      <h2>6. Tus derechos</h2>
      <p>Como titular de tus datos tienes derecho a:</p>
      <ul>
        <li><strong>Conocer</strong> qué datos tuyos tenemos.</li>
        <li><strong>Actualizar o corregir</strong> tus datos. La mayoría los puedes cambiar tú mismo desde «Editar perfil».</li>
        <li><strong>Pedir que los borremos</strong> y eliminar tu cuenta.</li>
        <li><strong>Revocar</strong> la autorización que nos diste.</li>
        <li>Presentar quejas ante la <strong>Superintendencia de Industria y Comercio (SIC)</strong> si consideras que no respetamos estos derechos.</li>
      </ul>

      <h2>7. Cómo ejercerlos</h2>
      <p>
        Escríbenos a {mail} desde el correo de tu cuenta, indicando tu nombre de usuario y lo que necesitas.
        Respondemos consultas en máximo 10 días hábiles y reclamos (corrección o borrado) en máximo 15 días
        hábiles, como establece la ley.
      </p>

      <h2>8. Cuánto tiempo los guardamos</h2>
      <p>
        Mientras tu cuenta esté activa. Si pides borrarla, eliminamos tus datos personales; podríamos conservar
        datos anónimos de picks ya resueltos para que las estadísticas generales sigan siendo correctas.
      </p>

      <h2>9. Seguridad</h2>
      <p>
        Usamos conexiones cifradas (HTTPS), contraseñas cifradas y reglas en la base de datos para que cada
        persona solo pueda modificar su propia información. Ningún sistema es 100% infalible, pero trabajamos
        para proteger tus datos.
      </p>

      <h2>10. Menores de edad</h2>
      <p>
        {LEGAL.siteName} es solo para mayores de {LEGAL.minimumAge} años. Si descubrimos que una cuenta pertenece a
        un menor, la eliminaremos.
      </p>

      <h2>11. Cambios a esta política</h2>
      <p>
        Si cambiamos esta política, actualizaremos la fecha de arriba y, si el cambio es importante, te
        avisaremos en la plataforma. También puedes leer nuestros <Link href="/terminos">Términos y condiciones</Link>.
      </p>
    </article>
  );
}
