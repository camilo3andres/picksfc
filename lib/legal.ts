// Datos que aparecen en /privacidad y /terminos. Si algo cambia (correo, ciudad,
// responsable), se edita SOLO aquí y se actualiza la fecha.
//

export const LEGAL = {
  siteName: "PicksFC",
  siteUrl: "https://www.picksfc.com",

  // Responsable del tratamiento de datos (Ley 1581 de 2012). Para una persona
  // natural basta su nombre completo y ciudad.
  ownerName: "Camilo Torres",
  ownerCity: "Villavicencio, Meta, Colombia",

  // Correo donde los usuarios piden ver, corregir o borrar sus datos.
  // Debe ser un correo que revises.
  contactEmail: "correoproyectopicks@gmail.com",

  country: "Colombia",
  minimumAge: 18,

  // Fecha de la última actualización de los textos (cambiarla si se editan)
  lastUpdated: "7 de noviembre de 2026",

  // Versión que se guarda cuando alguien acepta al registrarse
  termsVersion: "2026-11-07",
} as const;
