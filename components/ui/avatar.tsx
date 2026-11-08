import { getAvatarColor } from "@/lib/utils";

// Avatar con la inicial del usuario. El color sale de getAvatarColor(username),
// así cada persona tiene SIEMPRE el mismo color en toda la app (navbar, tarjetas,
// comentarios, ranking...). Usar este componente en vez de pintar el círculo a mano.

type Props = {
  username: string;
  size?: number;     // en píxeles
  glow?: boolean;    // sombra de color alrededor
};

export default function Avatar({ username, size = 36, glow = false }: Props) {
  const color = getAvatarColor(username);
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-black flex-shrink-0 select-none"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4),
        background: color.bg,
        boxShadow: glow ? `0 2px 8px ${color.shadow}` : undefined,
      }}
      aria-hidden="true"
    >
      {username[0]?.toUpperCase()}
    </div>
  );
}
