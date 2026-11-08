import { PICK_IMAGE_SIZE, renderPickImage } from "@/lib/pick-image";

// Vista previa del link en WhatsApp/X/Facebook. Next.js agrega sola la etiqueta
// <meta property="og:image"> a la página /picks/[id] apuntando aquí.
export const alt = "Pick en PicksFC";
export const size = PICK_IMAGE_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return renderPickImage(id);
}
