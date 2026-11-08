"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Props = {
  userId: string;
  username: string;
  currentBio: string | null;
  currentInstagram: string | null;
  currentTiktok: string | null;
  currentTwitter: string | null;
  currentTelegram: string | null;
};

export default function EditProfileForm({
  userId,
  username,
  currentBio,
  currentInstagram,
  currentTiktok,
  currentTwitter,
  currentTelegram,
}: Props) {
  const router = useRouter();
  const [bio, setBio] = useState(currentBio ?? "");
  const [instagram, setInstagram] = useState(currentInstagram ?? "");
  const [tiktok, setTiktok] = useState(currentTiktok ?? "");
  const [twitter, setTwitter] = useState(currentTwitter ?? "");
  const [telegram, setTelegram] = useState(currentTelegram ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        bio: bio.trim() || null,
        instagram: instagram.trim() || null,
        tiktok: tiktok.trim() || null,
        twitter: twitter.trim() || null,
        telegram: telegram.trim() || null,
      })
      .eq("id", userId);

    if (updateError) {
      setError("Error al guardar. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    router.push(`/profile/${username}`);
    router.refresh();
  }

  const inputBase = {
    background: "rgba(var(--tint-rgb), 0.04)",
    border: "1px solid rgba(var(--tint-rgb), 0.08)",
    color: "var(--text)",
  } as React.CSSProperties;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Descripción */}
      <div>
        <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
          Descripción
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={160}
          rows={3}
          placeholder="Cuéntale a la comunidad quién eres como analista..."
          className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
          style={inputBase}
        />
        <p className="text-xs mt-1 text-right" style={{ color: "var(--text-muted)" }}>{bio.length}/160</p>
      </div>

      {/* Instagram */}
      <div>
        <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
          Instagram
        </label>
        <div className="flex items-center gap-1 rounded-xl px-4 py-3" style={inputBase}>
          <span className="text-sm flex-shrink-0" style={{ color: "var(--text-muted)" }}>instagram.com/</span>
          <input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value.replace(/[^a-zA-Z0-9._]/g, ""))}
            placeholder="tu_usuario"
            className="flex-1 bg-transparent outline-none text-sm min-w-0"
            style={{ color: "var(--text)" }}
          />
        </div>
      </div>

      {/* TikTok */}
      <div>
        <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
          TikTok
        </label>
        <div className="flex items-center gap-1 rounded-xl px-4 py-3" style={inputBase}>
          <span className="text-sm flex-shrink-0" style={{ color: "var(--text-muted)" }}>tiktok.com/@</span>
          <input
            type="text"
            value={tiktok}
            onChange={(e) => setTiktok(e.target.value.replace(/[^a-zA-Z0-9._]/g, ""))}
            placeholder="tu_usuario"
            className="flex-1 bg-transparent outline-none text-sm min-w-0"
            style={{ color: "var(--text)" }}
          />
        </div>
      </div>

      {/* Twitter / X */}
      <div>
        <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
          X / Twitter
        </label>
        <div className="flex items-center gap-1 rounded-xl px-4 py-3" style={inputBase}>
          <span className="text-sm flex-shrink-0" style={{ color: "var(--text-muted)" }}>x.com/</span>
          <input
            type="text"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
            placeholder="tu_usuario"
            className="flex-1 bg-transparent outline-none text-sm min-w-0"
            style={{ color: "var(--text)" }}
          />
        </div>
      </div>

      {/* Telegram */}
      <div>
        <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
          Telegram
        </label>
        <div className="flex items-center gap-1 rounded-xl px-4 py-3" style={inputBase}>
          <span className="text-sm flex-shrink-0" style={{ color: "var(--text-muted)" }}>t.me/</span>
          <input
            type="text"
            value={telegram}
            onChange={(e) => setTelegram(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
            placeholder="tu_usuario_o_canal"
            className="flex-1 bg-transparent outline-none text-sm min-w-0"
            style={{ color: "var(--text)" }}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-center" style={{ color: "#f87171" }}>{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
          style={{ background: "rgba(var(--tint-rgb), 0.05)", color: "var(--text-3)", border: "1px solid rgba(var(--tint-rgb), 0.08)" }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 rounded-xl text-sm font-black transition-all"
          style={{
            background: loading ? "rgba(var(--primary-rgb), 0.30)" : "var(--primary)",
            color: "var(--nav)",
          }}
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
