"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { getAvatarColor } from "@/lib/utils";
import { Comment } from "@/lib/types";
import { SendIcon } from "@/components/ui/icons";
import { useViewer } from "@/components/viewer-context";

type Props = {
  pickId: string;
  currentUserId: string;
  onCountChange: (delta: number) => void;
};

const MAX_LENGTH = 300;
const VISIBLE_AT_START = 3; // como Instagram: al abrir se ven los más recientes

// "ahora", "5 min", "2 h", "3 d"; después de una semana, la fecha corta
function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "ahora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d`;
  return new Date(dateStr).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export default function CommentsSection({ pickId, currentUserId, onCountChange }: Props) {
  const { isAdmin } = useViewer(); // los admins pueden borrar cualquier comentario (moderación)
  const [comments, setComments] = useState<Comment[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  // Comentarios en vivo: los de otros usuarios aparecen (o desaparecen) sin recargar
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${pickId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments", filter: `pick_id=eq.${pickId}` }, async (payload) => {
        // El evento no trae el autor (profiles): se pide ese comentario con su autor
        const { data } = await supabase.from("comments").select("*, profiles(username)").eq("id", payload.new.id).single();
        if (data) setComments((prev) => (prev.some((c) => c.id === data.id) ? prev : [...prev, data as Comment]));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "comments" }, (payload) => {
        setComments((prev) => prev.filter((c) => c.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pickId]);

  // El campo crece con el texto (hasta ~5 líneas)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [text]);

  const hiddenCount = showAll ? 0 : Math.max(0, comments.length - VISIBLE_AT_START);
  const visible = comments.slice(hiddenCount);
  const canSubmit = text.trim().length > 0 && !submitting;

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const { data, error } = await supabase
      .from("comments")
      .insert({ pick_id: pickId, user_id: currentUserId, content: text.trim() })
      .select("*, profiles(username)")
      .single();

    if (error || !data) {
      setError("No se pudo publicar. Intenta de nuevo.");
    } else {
      setComments((prev) => [...prev, data as Comment]);
      onCountChange(1);
      setText("");
    }
    setSubmitting(false);
  }

  // Enter publica, Shift + Enter hace salto de línea
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  async function handleDelete(comment: Comment) {
    const moderating = comment.user_id !== currentUserId; // un admin borrando el comentario de otro
    const question = moderating
      ? `Moderación: ¿eliminar el comentario de @${comment.profiles.username}?`
      : "¿Eliminar este comentario?";
    if (!confirm(question)) return;

    const commentId = comment.id;
    // .select() devuelve las filas borradas: si la regla de seguridad no lo permite,
    // Supabase no da error pero no borra nada (0 filas). Así se detecta ese caso.
    const { data, error } = await supabase.from("comments").delete().eq("id", commentId).select("id");
    if (error || !data?.length) {
      setError("No se pudo eliminar el comentario.");
      return;
    }
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    onCountChange(-1);
  }

  return (
    <div className="px-4 pb-4 pt-3" style={{ borderTop: "1px solid rgba(var(--tint-rgb), 0.06)" }}>

      {loading ? (
        <CommentsSkeleton />
      ) : (
        <>
          {/* Desplegable: comentarios anteriores */}
          {hiddenCount > 0 && (
            <button
              onClick={() => setShowAll(true)}
              className="text-sm font-semibold mb-3 hover:underline"
              style={{ color: "var(--text-3)" }}
            >
              Ver {hiddenCount === 1 ? "1 comentario anterior" : `${hiddenCount} comentarios anteriores`}
            </button>
          )}

          {visible.length > 0 && (
            <ul className="space-y-3 mb-3">
              {visible.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  canDelete={c.user_id === currentUserId || isAdmin}
                  onDelete={() => handleDelete(c)}
                />
              ))}
            </ul>
          )}
        </>
      )}

      {/* Caja para escribir, tipo Facebook: píldora con el botón adentro */}
      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className="flex items-end gap-1 rounded-3xl pl-4 pr-1 py-1 transition-colors focus-within:ring-2"
        style={{
          background: "rgba(var(--tint-rgb), 0.07)",
          // color del anillo de foco (focus-within:ring-2 usa esta variable de Tailwind)
          ["--tw-ring-color" as string]: "rgba(var(--primary-rgb), 0.35)",
        }}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={comments.length === 0 && !loading ? "Sé el primero en comentar..." : "Escribe un comentario..."}
          maxLength={MAX_LENGTH}
          aria-label="Escribe un comentario"
          className="flex-1 resize-none bg-transparent text-sm outline-none py-2 leading-snug"
          style={{ color: "var(--text)" }}
        />
        <button
          type="submit"
          disabled={!canSubmit}
          aria-label="Publicar comentario"
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:cursor-not-allowed"
          style={{ color: canSubmit ? "var(--primary-light)" : "var(--text-dim)" }}
        >
          {submitting ? (
            <span className="w-4 h-4 rounded-full border-2 border-sky-400/30 border-t-sky-400 animate-spin" />
          ) : (
            <SendIcon size={18} />
          )}
        </button>
      </form>

      {error && <p className="text-xs mt-2 px-1" style={{ color: "#f87171" }}>{error}</p>}
    </div>
  );
}

// ─── Subcomponentes ────────────────────────────────────────────

function CommentItem({ comment, canDelete, onDelete }: { comment: Comment; canDelete: boolean; onDelete: () => void }) {
  const username = comment.profiles.username;

  return (
    <li className="flex gap-2 items-start">
      <Link
        href={`/profile/${username}`}
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
        style={{ background: getAvatarColor(username).bg }}
      >
        {username[0].toUpperCase()}
      </Link>

      <div className="min-w-0 max-w-[85%]">
        {/* Burbuja: nombre arriba, texto abajo (como Facebook) */}
        <div className="rounded-2xl px-3 py-2" style={{ background: "rgba(var(--tint-rgb), 0.07)" }}>
          <Link href={`/profile/${username}`} className="block text-[13px] font-bold hover:underline" style={{ color: "var(--text)" }}>
            {username}
          </Link>
          <p className="text-sm leading-snug break-words whitespace-pre-wrap" style={{ color: "var(--text-2)" }}>
            {comment.content}
          </p>
        </div>

        {/* Fila de metadatos debajo de la burbuja */}
        <div className="flex items-center gap-3 mt-1 px-3 text-xs">
          <time
            dateTime={comment.created_at}
            title={new Date(comment.created_at).toLocaleString("es-ES")}
            style={{ color: "var(--text-muted)" }}
          >
            {timeAgo(comment.created_at)}
          </time>
          {canDelete && (
            <button onClick={onDelete} className="font-semibold hover:underline hover:text-red-400" style={{ color: "var(--text-muted)" }}>
              Eliminar
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function CommentsSkeleton() {
  return (
    <div className="space-y-3 mb-3 animate-pulse">
      {[0, 1].map((i) => (
        <div key={i} className="flex gap-2">
          <div className="w-8 h-8 rounded-full" style={{ background: "rgba(var(--tint-rgb), 0.08)" }} />
          <div className="rounded-2xl h-12" style={{ width: i ? "45%" : "65%", background: "rgba(var(--tint-rgb), 0.06)" }} />
        </div>
      ))}
    </div>
  );
}
