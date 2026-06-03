"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Props = {
  userId: string;
  isVerified: boolean;
};

export default function VerifyTipsterButton({ userId, isVerified }: Props) {
  const [verified, setVerified] = useState(isVerified);
  const [saving, setSaving]     = useState(false);
  const router  = useRouter();
  const supabase = createClient();
  const [, startTransition] = useTransition();

  async function toggle() {
    setSaving(true);
    await supabase.from("profiles").update({ is_verified: !verified }).eq("id", userId);
    setVerified((v) => !v);
    setSaving(false);
    startTransition(() => router.refresh());
  }

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className="text-xs px-2.5 py-1 rounded-full font-bold transition-all disabled:opacity-40"
      style={verified ? {
        background: "rgba(251,191,36,0.15)",
        color: "#fbbf24",
        border: "1px solid rgba(251,191,36,0.35)",
      } : {
        background: "rgba(255,255,255,0.04)",
        color: "#4a6080",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      {saving ? "..." : verified ? "✓ Verificado" : "Verificar"}
    </button>
  );
}
