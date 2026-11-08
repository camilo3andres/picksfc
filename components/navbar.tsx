"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Home, Trophy, PlusCircle, User, Settings, LogOut, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase";
import Avatar from "@/components/ui/avatar";

type Props = {
  username: string | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
};

export default function Navbar({ username, isAdmin, isLoggedIn }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Top navbar */}
      <nav
        className="sticky top-0 z-50 border-b border-white/5"
        style={{
          background: "linear-gradient(180deg, var(--nav) 0%, var(--nav-2) 100%)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between" style={{ height: "62px" }}>

          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-2.5 group">
            <Image src="/icon.png" alt="PicksFC" width={36} height={36} className="rounded-xl transition-transform group-hover:scale-105" style={{ boxShadow: "0 4px 14px rgba(var(--primary-rgb), 0.35)" }} />
            <div className="flex flex-col leading-none">
              <span className="text-lg font-black tracking-tight" style={{ color: "var(--text)" }}>
                Picks<span style={{ color: "var(--primary-light)" }}>FC</span>
              </span>
              <span className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: "var(--text-faint)" }}>
                Pronósticos
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            <Link
              href="/feed"
              className="flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-xl font-medium transition-all"
              style={isActive("/feed")
                ? { color: "#fff", background: "rgba(var(--primary-light-rgb), 0.12)", border: "1px solid rgba(var(--primary-light-rgb), 0.2)" }
                : { color: "var(--text-2)", border: "1px solid transparent" }
              }
            >
              <Home size={14} /> Feed
            </Link>

            <Link
              href="/leaderboard"
              className="flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-xl font-medium transition-all"
              style={isActive("/leaderboard")
                ? { color: "#fff", background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.2)" }
                : { color: "var(--text-2)", border: "1px solid transparent" }
              }
            >
              <Trophy size={14} className={isActive("/leaderboard") ? "text-amber-400" : ""} /> Ranking
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-xl font-medium transition-all"
                style={isActive("/admin")
                  ? { color: "#fbbf24", background: "rgba(251,191,36,0.10)", border: "1px solid rgba(251,191,36,0.25)" }
                  : { color: "#6b7fa3", border: "1px solid transparent" }
                }
              >
                <Settings size={14} /> Admin
              </Link>
            )}

            <Link
              href="/picks/new"
              className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl font-bold transition-all ml-2"
              style={{
                background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%)",
                color: "#fff",
                boxShadow: "0 4px 14px rgba(var(--primary-rgb), 0.30)",
              }}
            >
              <Zap size={14} fill="white" /> Nuevo pick
            </Link>

            {isLoggedIn ? (
              <>
                <Link href={`/profile/${username}`} className="flex items-center gap-2 ml-3 pl-3 border-l border-white/10 hover:opacity-80 transition-opacity">
                  {username && <Avatar username={username} size={32} glow />}
                  <div className="flex flex-col leading-none">
                    <span className="text-xs font-bold" style={{ color: "var(--text)" }}>@{username}</span>
                    <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>Mi perfil</span>
                  </div>
                </Link>
                <button onClick={handleLogout} className="ml-2 p-1.5 rounded-lg transition-all hover:bg-white/5" style={{ color: "var(--text-faint)" }}>
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-3 pl-3 border-l border-white/10">
                <Link href="/login" className="text-sm font-semibold px-3 py-1.5 rounded-xl transition-all"
                  style={{ color: "var(--text-2)", background: "rgba(var(--tint-rgb), 0.04)", border: "1px solid rgba(var(--tint-rgb), 0.08)" }}>
                  Iniciar sesión
                </Link>
                <Link href="/register" className="text-sm font-bold px-3 py-1.5 rounded-xl transition-all"
                  style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-strong))", color: "#fff", boxShadow: "0 2px 10px rgba(var(--primary-rgb), 0.25)" }}>
                  Regístrate
                </Link>
              </div>
            )}
          </div>

          {/* Mobile — avatar o login */}
          <div className="flex md:hidden items-center gap-2">
            {isLoggedIn ? (
              <Link href={`/profile/${username}`} className="flex items-center gap-2">
                {username && <Avatar username={username} size={32} />}
                <span className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>@{username}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link href="/login" className="text-xs font-semibold px-2.5 py-1.5 rounded-xl"
                  style={{ color: "var(--text-2)", background: "rgba(var(--tint-rgb), 0.06)", border: "1px solid rgba(var(--tint-rgb), 0.10)" }}>
                  Iniciar sesión
                </Link>
                <Link href="/register" className="text-xs font-bold px-2.5 py-1.5 rounded-xl"
                  style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-strong))", color: "#fff", boxShadow: "0 2px 8px rgba(var(--primary-rgb), 0.25)" }}>
                  Regístrate
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom navbar — mobile */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-white/5"
        style={{ background: "linear-gradient(0deg, var(--nav) 0%, var(--nav-2) 100%)" }}
      >
        <div className="flex items-center justify-around h-16 px-2">
          <Link
            href="/feed"
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all"
            style={isActive("/feed") ? { color: "var(--primary-light)" } : { color: "var(--text-dim)" }}
          >
            <Home size={21} />
            <span className="text-[10px] font-semibold">Feed</span>
          </Link>

          <Link
            href="/leaderboard"
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all"
            style={isActive("/leaderboard") ? { color: "#fbbf24" } : { color: "var(--text-dim)" }}
          >
            <Trophy size={21} />
            <span className="text-[10px] font-semibold">Ranking</span>
          </Link>

          <Link href="/picks/new" className="flex flex-col items-center gap-0.5 px-3 py-1 -mt-4">
            <div
              className="rounded-2xl p-3 transition-all"
              style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%)", boxShadow: "0 4px 16px rgba(var(--primary-rgb), 0.40)" }}
            >
              <PlusCircle size={22} className="text-white" />
            </div>
          </Link>

          {/* Slot 4: Admin (si es admin) / Perfil (si está logueado) / Entrar (anónimo) */}
          {isAdmin ? (
            <Link
              href="/admin"
              className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all"
              style={isActive("/admin") ? { color: "#fbbf24" } : { color: "var(--text-dim)" }}
            >
              <Settings size={21} />
              <span className="text-[10px] font-semibold">Admin</span>
            </Link>
          ) : (
            <Link
              href={isLoggedIn ? `/profile/${username}` : "/login"}
              className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all"
              style={pathname.startsWith("/profile") ? { color: "var(--primary-light)" } : { color: "var(--text-dim)" }}
            >
              <User size={21} />
              <span className="text-[10px] font-semibold">{isLoggedIn ? "Perfil" : "Entrar"}</span>
            </Link>
          )}

          {/* Slot 5: Salir (si está logueado) / Regístrate (anónimo) */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-0.5 px-4 py-1.5"
              style={{ color: "var(--text-dim)" }}
            >
              <LogOut size={21} />
              <span className="text-[10px] font-semibold">Salir</span>
            </button>
          ) : (
            <Link
              href="/register"
              className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all"
              style={{ color: "var(--text-dim)" }}
            >
              <PlusCircle size={21} />
              <span className="text-[10px] font-semibold">Regístrate</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
