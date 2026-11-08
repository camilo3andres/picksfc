// Configuración de TheSportsDB (se usa solo en rutas del servidor, /app/api/*).
//
// La llave gratis vieja ("3") fue desactivada por TheSportsDB; la de prueba
// actual es "123". Si algún día se paga el plan premium, basta con definir
// THESPORTSDB_API_KEY en .env.local / Vercel sin tocar el código.
const KEY = process.env.THESPORTSDB_API_KEY ?? "123";

export const SPORTSDB_URL = `https://www.thesportsdb.com/api/v1/json/${KEY}`;
