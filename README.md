# PicksFC ⚽

Plataforma web de pronósticos de fútbol con comunidad. Los usuarios publican sus picks sobre partidos reales, construyen un historial público verificado y compiten en un ranking de precisión.

🔗 **Demo en vivo:** [picksfc.com](https://picksfc.com)

## Funcionalidades

- **Autenticación:** registro, inicio de sesión y recuperación de contraseña.
- **Picks sobre partidos reales:** selección de partidos desde APIs deportivas, con bloqueo automático cuando el partido ya comenzó.
- **Feed en tiempo real:** los picks nuevos aparecen al instante, sin recargar la página.
- **Comunidad:** likes, seguir a otros usuarios y filtro de feed "Siguiendo".
- **Perfiles:** estadísticas de aciertos, biografía y redes sociales.
- **Ranking:** clasificación de usuarios según su precisión.
- **Panel de administración:** resolución de picks por marcador final.
- **Diseño responsive:** adaptado a móvil y escritorio.

## Tecnologías

| Área | Tecnología |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Rutas API de Next.js (Node.js) |
| Base de datos y autenticación | Supabase (PostgreSQL, Auth, Realtime) |
| Datos deportivos | TheSportsDB, football-data.org |
| Despliegue | Vercel (despliegue continuo desde GitHub) |

## Aspectos técnicos destacados

- **Seguridad en la base de datos:** políticas RLS (Row Level Security) y un trigger que impide que un usuario se otorgue permisos de administrador.
- **Llaves protegidas:** las consultas a APIs externas se hacen desde el servidor, para que las llaves nunca lleguen al navegador.
- **Estadísticas automáticas:** triggers de PostgreSQL actualizan los aciertos de cada usuario cuando se resuelve un pick.
- **Manejo de zonas horarias:** corrección de fechas para partidos nocturnos (diferencia entre UTC y hora local).

## Ejecutar en local

1. Clona el repositorio e instala las dependencias:

   ```bash
   npm install
   ```

2. Crea un archivo `.env.local` con tus propias credenciales:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   FOOTBALL_DATA_API_KEY=
   ```

3. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   La aplicación queda disponible en [http://localhost:3000](http://localhost:3000).

## Sobre el desarrollo

Proyecto personal desarrollado con asistencia de IA (Claude Code): yo defino los requerimientos y tomo las decisiones de producto, y reviso el código generado.

---

Desarrollado por **Camilo Torres** · [GitHub](https://github.com/camilo3andres)
