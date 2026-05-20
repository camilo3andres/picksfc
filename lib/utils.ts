import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const AVATAR_GRADIENTS = [
  { bg: "linear-gradient(135deg, #3b82f6, #1d4ed8)", shadow: "rgba(59,130,246,0.30)"  },
  { bg: "linear-gradient(135deg, #f97316, #ea580c)", shadow: "rgba(249,115,22,0.30)"  },
  { bg: "linear-gradient(135deg, #8b5cf6, #6d28d9)", shadow: "rgba(139,92,246,0.30)"  },
  { bg: "linear-gradient(135deg, #f59e0b, #d97706)", shadow: "rgba(245,158,11,0.30)"  },
  { bg: "linear-gradient(135deg, #ef4444, #dc2626)", shadow: "rgba(239,68,68,0.30)"   },
  { bg: "linear-gradient(135deg, #22c55e, #15803d)", shadow: "rgba(34,197,94,0.30)"   },
  { bg: "linear-gradient(135deg, #ec4899, #db2777)", shadow: "rgba(236,72,153,0.30)"  },
  { bg: "linear-gradient(135deg, #06b6d4, #0891b2)", shadow: "rgba(6,182,212,0.30)"   },
];

export function getAvatarColor(username: string) {
  const code = username.charCodeAt(0) * 31 + (username.charCodeAt(1) || 0);
  return AVATAR_GRADIENTS[code % AVATAR_GRADIENTS.length];
}
