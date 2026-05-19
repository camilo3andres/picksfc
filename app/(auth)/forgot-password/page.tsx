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
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.09)",
    color: "#f0f6ff",
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
        background: "#162742",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 4px 18px rgba(0,0,0,0.28)",
      }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
          style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}>
          📧
        </div>
        <h2 className="text-xl font-black mb-2" style={{ color: "#f0f6ff" }}>Revisá tu correo</h2>
        <p className="text-sm mb-5" style={{ color: "#5a7a9a" }}>
          Si ese email está registrado, te enviamos un link para restablecer tu contraseña.
        </p>
        <Link href="/login"
          className="inline-block text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", boxShadow: "0 4px 16px rgba(34,197,94,0.30)" }}>
          Volver al login →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-7" style={{
      background: "#162742",
      border: "1px solid rgba(255,255,255,0.07)",
      boxShadow: "0 4px 18px rgba(0,0,0,0.28)",
    }}>
      <h2 className="text-xl font-black mb-1" style={{ color: "#f0f6ff" }}>Olvidé mi contraseña</h2>
      <p className="text-sm mb-6" style={{ color: "#5a7a9a" }}>Te enviamos un link para recuperar tu cuenta</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold" style={{ color: "#8fa8cc" }}>Email</label>
          <input
            type="email"
            placeholder="tu@email.com"
            style={inputStyle}
            onFocus={(e) => { e.target.style.border = "1px solid rgba(34,197,94,0.45)"; e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.07)"; }}
            onBlur={(e)  => { e.target.style.border = "1px solid rgba(255,255,255,0.09)"; e.target.style.boxShadow = "none"; }}
            {...register("email")}
          />
          {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl text-sm font-black transition-all mt-2"
          style={{
            background: loading ? "rgba(34,197,94,0.4)" : "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "#fff",
            boxShadow: loading ? "none" : "0 4px 16px rgba(34,197,94,0.30)",
          }}
        >
          {loading ? "Enviando..." : "⚡ Enviar link de recuperación"}
        </button>
      </form>

      <p className="text-center text-sm mt-5" style={{ color: "#5a7a9a" }}>
        <Link href="/login" className="font-bold transition-colors" style={{ color: "#4ade80" }}>
          ← Volver al login
        </Link>
      </p>
    </div>
  );
}
