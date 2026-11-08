"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

const schema = z.object({
  email: z.string().email("Email inválido"),
});

type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: Form) {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setSent(true);
    setLoading(false);
  }

  const inputStyle = {
    background: "rgba(var(--tint-rgb), 0.05)",
    border: "1px solid rgba(var(--tint-rgb), 0.09)",
    color: "var(--text)",
    borderRadius: "12px",
    padding: "10px 14px",
    width: "100%",
    outline: "none",
    fontSize: "14px",
    transition: "all 0.2s",
  };

  if (sent) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{
        background: "var(--surface)",
        border: "1px solid rgba(var(--tint-rgb), 0.07)",
        boxShadow: "0 4px 18px rgba(0,0,0,0.28)",
      }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
          style={{ background: "rgba(var(--primary-rgb), 0.12)", border: "1px solid rgba(var(--primary-rgb), 0.25)" }}>
          📧
        </div>
        <h2 className="text-xl font-black mb-2" style={{ color: "var(--text)" }}>Revisá tu correo</h2>
        <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
          Si ese email está registrado, te enviamos un link para restablecer tu contraseña.
        </p>
        <Link href="/login"
          className="inline-block text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-strong))", color: "#fff", boxShadow: "0 4px 16px rgba(var(--primary-rgb), 0.30)" }}>
          Volver al login →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-7" style={{
      background: "var(--surface)",
      border: "1px solid rgba(var(--tint-rgb), 0.07)",
      boxShadow: "0 4px 18px rgba(0,0,0,0.28)",
    }}>
      <h2 className="text-xl font-black mb-1" style={{ color: "var(--text)" }}>Olvidé mi contraseña</h2>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Te enviamos un link para recuperar tu cuenta</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>Email</label>
          <input
            type="email"
            placeholder="tu@email.com"
            style={inputStyle}
            {...register("email")}
            onFocus={(e) => { e.target.style.border = "1px solid rgba(var(--primary-rgb), 0.45)"; e.target.style.boxShadow = "0 0 0 3px rgba(var(--primary-rgb), 0.07)"; }}
            onBlur={(e)  => { e.target.style.border = "1px solid rgba(var(--tint-rgb), 0.09)"; e.target.style.boxShadow = "none"; }}
          />
          {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl text-sm font-black transition-all mt-2"
          style={{
            background: loading ? "rgba(var(--primary-rgb), 0.4)" : "linear-gradient(135deg, var(--primary), var(--primary-strong))",
            color: "#fff",
            boxShadow: loading ? "none" : "0 4px 16px rgba(var(--primary-rgb), 0.30)",
          }}
        >
          {loading ? "Enviando..." : "⚡ Enviar link de recuperación"}
        </button>
      </form>

      <p className="text-center text-sm mt-5" style={{ color: "var(--text-muted)" }}>
        <Link href="/login" className="font-bold transition-colors" style={{ color: "var(--primary-light)" }}>
          ← Volver al login
        </Link>
      </p>
    </div>
  );
}
