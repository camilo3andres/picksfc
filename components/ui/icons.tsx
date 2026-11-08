// Íconos de línea (estilo Instagram/Facebook). Heredan el color del texto
// con `currentColor`, así que se pintan con `color` igual que una letra.

type IconProps = { size?: number; filled?: boolean };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

// filled = true → corazón relleno (ya le diste like)
export function HeartIcon({ size = 20, filled = false }: IconProps) {
  return (
    <svg {...base(size)} fill={filled ? "currentColor" : "none"}>
      <path d="M12 20.5s-7.5-4.6-9.3-9.6C1.5 7.4 3.7 4 7.2 4c2 0 3.6 1.1 4.8 2.8C13.2 5.1 14.8 4 16.8 4c3.5 0 5.7 3.4 4.5 6.9-1.8 5-9.3 9.6-9.3 9.6z" />
    </svg>
  );
}

export function CommentIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M20.5 11.5a8.5 8.5 0 0 1-12.3 7.6L3.5 20.5l1.4-4.4A8.5 8.5 0 1 1 20.5 11.5z" />
    </svg>
  );
}

export function SendIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7z" />
    </svg>
  );
}

export function ShareIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
      <path d="M16 6l-4-4-4 4" />
      <path d="M12 2v13" />
    </svg>
  );
}

export function TrashIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
    </svg>
  );
}

export function CheckIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
