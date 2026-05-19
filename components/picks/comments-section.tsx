"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Comment } from "@/lib/types";

type Props = {
  pickId: string;
  currentUserId: string;
  onCountChange: (delta: number) => void;
};

export default function CommentsSection({ pickId, currentUserId, onCountChange }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchComments() {
      const { data } = await supabase
        .from("comments")
        .select("*, profiles(username)")
        .eq("pick_id", pickId)
        .order("created_at", { ascending: true });
      setComments((data as Comment[]) ?? []);
      setLoading(false);
    }
    fetchComments();
  }, [pickId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    const { data } = await supabase
      .from("comments")
      .insert({ pick_id: pickId, user_id: currentUserId, content: text.trim() })
      .select("*, profiles(username)")
      .single();

    if (data) {
      setComments((prev) => [...prev, data as Comment]);
      onCountChange(1);
      setText("");
    }
    setSubmitting(false);
  }

  async function handleDelete(commentId: string) {
    await supabase.from("comments").delete().eq("id", commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    onCountChange(-1);
  }

  return (
    <div className="px-4 pb-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>

      {loading ? (
        <p className="text-xs py-2" style={{ color: "#5a7a9a" }}>Cargando comentarios...</p>
      ) : comments.length === 0 ? (
        <p className="text-xs py-2" style={{ color: "#5a7a9a" }}>Nadie ha comentado aún. Sé el primero.</p>
      ) : (
        <div className="mb-3">
          {comments.map((c, i) => (
            <div
              key={c.id}
              className="flex gap-2.5 items-start py-2.5"
              style={{
                borderBottom: i < comments.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #22c55e, #15803d)" }}
              >
                {c.profiles.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold" style={{ color: "#f0f6ff" }}>@{c.profiles.username}</span>
                  <span className="text-xs" style={{ color: "#5a7a9a" }}>
                    {new Date(c.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <p className="text-sm leading-snug break-words mt-0.5" style={{ color: "#c8d8e8" }}>
                  {c.content}
                </p>
              </div>
              {c.user_id === currentUserId && (
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-xs transition-colors flex-shrink-0"
                  style={{ color: "#3a5070" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#3a5070")}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 mt-1">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un comentario..."
          maxLength={300}
          className="flex-1 text-sm outline-none rounded-xl px-3 py-2 transition-all"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#f0f6ff",
          }}
          onFocus={(e) => {
            e.target.style.border = "1px solid rgba(34,197,94,0.40)";
            e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.07)";
          }}
          onBlur={(e) => {
            e.target.style.border = "1px solid rgba(255,255,255,0.08)";
            e.target.style.boxShadow = "none";
          }}
        />
        <button
          type="submit"
          disabled={!text.trim() || submitting}
          className="text-sm font-bold px-3 py-2 rounded-xl transition-all"
          style={{
            background: !text.trim() || submitting ? "rgba(34,197,94,0.25)" : "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "#fff",
            cursor: !text.trim() || submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "..." : "→"}
        </button>
      </form>
    </div>
  );
}
