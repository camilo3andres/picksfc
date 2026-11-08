import { renderPickImage } from "@/lib/pick-image";

// URL fija de la imagen del pick, para el botón "Compartir"
// (la de opengraph-image lleva un sufijo que genera Next y puede cambiar).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return renderPickImage(id);
}
