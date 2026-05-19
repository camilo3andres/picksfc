"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setError("Email o contraseña incorrectos");
      setLoading(false);
      return;
    }
    router.push("/feed");
    router.refresh();
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

  return (
    <div className="rounded-2xl p-7" style={{
      background: "#162742",
      border: "1px solid rgba(255,255,255,0.07)",
      boxShadow: "0 4px 18px rgba(0,0,0,0.28)",
    }}>
      <h2 className="text-xl font-black mb-1" style={{ color: "#f0f6ff" }}>Iniciar sesión</h2>
      <p className="text-sm mb-6" style={{ color: "#5a7a9a" }}>Ingresá a tu cuenta para ver los picks</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold" style={{ color: "#8fa8cc" }}>Email</label>
          <input
            type="email"
            placeholder="tu@email.com"
            style={inputStyle}
            {...register("email")}
            onFocus={(e) => { e.target.style.border = "1px solid rgba(34,197,94,0.45)"; e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.07)"; }}
            onBlur={(e)  => { e.target.style.border = "1px solid rgba(255,255,255,0.09)"; e.target.style.boxShadow = "none"; }}
          />
          {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold" style={{ color: "#8fa8cc" }}>Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              style={{ ...inputStyle, paddingRight: "40px" }}
              {...register("password")}
              onFocus={(e) => { e.target.style.border = "1px solid rgba(34,197,94,0.45)"; e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.07)"; }}
              onBlur={(e)  => { e.target.style.border = "1px solid rgba(255,255,255,0.09)"; e.target.style.boxShadow = "none"; }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: "#5a7a9a" }}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

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
          {loading ? "Ingresando..." : "⚡ Ingresar"}
        </button>
      </form>

      <div className="mt-5 space-y-2 text-center">
        <p className="text-sm" style={{ color: "#5a7a9a" }}>
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="font-bold transition-colors" style={{ color: "#4ade80" }}>
            Registrate
          </Link>
        </p>
        <p className="text-sm">
          <Link href="/forgot-password" className="transition-colors" style={{ color: "#3a5a7a" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#5a7a9a")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#3a5a7a")}>
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      </div>
    </div>
  );
}
