"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { LEGAL } from "@/lib/legal";

const registerSchema = z.object({
  username: z.string().min(3, "Mínimo 3 caracteres").max(20, "Máximo 20 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guión bajo"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  // Obligatorio: aceptar Términos y Privacidad y confirmar mayoría de edad
  acceptTerms: z.boolean().refine((v) => v, "Debes aceptar para crear tu cuenta"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { acceptTerms: false },
  });

  async function onSubmit(data: RegisterForm) {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        // A dónde vuelve el link del correo de confirmación: /auth/callback inicia
        // la sesión y lleva al feed. Sin esto, Supabase usaba su "Site URL".
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/feed`,
        data: {
          username: data.username,
          // Prueba del consentimiento (Ley 1581): cuándo aceptó y qué versión de los términos
          terms_accepted_at: new Date().toISOString(),
          terms_version: LEGAL.termsVersion,
        },
      },
    });
    if (error) {
      setError(error.message === "User already registered"
        ? "Ya existe una cuenta con ese email"
        : "Error al crear la cuenta. Intentá de nuevo.");
      setLoading(false);
      return;
    }
    setEmailSent(true);
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

  if (emailSent) {
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
          Te enviamos un link de confirmación. Hacé clic en el link para activar tu cuenta y después iniciá sesión.
        </p>
        <Link href="/login"
          className="inline-block text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-strong))", color: "#fff", boxShadow: "0 4px 16px rgba(var(--primary-rgb), 0.30)" }}>
          Ir al login →
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
      <h2 className="text-xl font-black mb-1" style={{ color: "var(--text)" }}>Crear cuenta</h2>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Unite a la comunidad de pronosticadores</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>Nombre de usuario</label>
          <input
            type="text"
            placeholder="crack10"
            style={inputStyle}
            {...register("username")}
            onFocus={(e) => { e.target.style.border = "1px solid rgba(var(--primary-rgb), 0.45)"; e.target.style.boxShadow = "0 0 0 3px rgba(var(--primary-rgb), 0.07)"; }}
            onBlur={(e)  => { e.target.style.border = "1px solid rgba(var(--tint-rgb), 0.09)"; e.target.style.boxShadow = "none"; }}
          />
          {errors.username && <p className="text-red-400 text-xs">{errors.username.message}</p>}
        </div>

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

        <div className="space-y-1.5">
          <label className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Creá tu contraseña para PicksFC"
              style={{ ...inputStyle, paddingRight: "40px" }}
              {...register("password")}
              onFocus={(e) => { e.target.style.border = "1px solid rgba(var(--primary-rgb), 0.45)"; e.target.style.boxShadow = "0 0 0 3px rgba(var(--primary-rgb), 0.07)"; }}
              onBlur={(e)  => { e.target.style.border = "1px solid rgba(var(--tint-rgb), 0.09)"; e.target.style.boxShadow = "none"; }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: "var(--text-muted)" }}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="flex items-start gap-2.5 text-sm leading-snug cursor-pointer" style={{ color: "var(--text-2)" }}>
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 flex-shrink-0 accent-sky-500 cursor-pointer"
              {...register("acceptTerms")}
            />
            <span>
              Tengo {LEGAL.minimumAge} años o más y acepto los{" "}
              <Link href="/terminos" target="_blank" className="font-semibold underline" style={{ color: "var(--primary-light)" }}>Términos</Link>
              {" "}y la{" "}
              <Link href="/privacidad" target="_blank" className="font-semibold underline" style={{ color: "var(--primary-light)" }}>Política de privacidad</Link>.
            </span>
          </label>
          {errors.acceptTerms && <p className="text-red-400 text-xs">{errors.acceptTerms.message}</p>}
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

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
          {loading ? "Creando cuenta..." : "⚡ Crear cuenta"}
        </button>
      </form>

      <p className="text-center text-sm mt-5" style={{ color: "var(--text-muted)" }}>
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-bold transition-colors" style={{ color: "var(--primary-light)" }}>
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
