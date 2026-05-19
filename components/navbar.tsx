"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Trophy, PlusCircle, User, Settings, LogOut, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase";

type Props = {
  username: string | null;
  isAdmin: boolean;
};

export default function Navbar({ username, isAdmin }: Props) {
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
          background: "linear-gradient(180deg, #0f1d35 0%, #0c1829 100%)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between" style={{ height: "62px" }}>

          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-black transition-transform group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)", boxShadow: "0 4px 14px rgba(34,197,94,0.35)" }}
            >
              ⚽
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-black tracking-tight" style={{ color: "#f0f6ff" }}>
                Picks<span style={{ color: "#4ade80" }}>FC</span>
              </span>
              <span className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: "#4a6080" }}>
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
                ? { color: "#fff", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.2)" }
                : { color: "#8fa8cc", border: "1px solid transparent" }
              }
            >
              <Home size={14} /> Feed
            </Link>

            <Link
              href="/leaderboard"
              className="flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-xl font-medium transition-all"
              style={isActive("/leaderboard")
                ? { color: "#fff", background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.2)" }
                : { color: "#8fa8cc", border: "1px solid transparent" }
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
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                color: "#fff",
                boxShadow: "0 4px 14px rgba(34,197,94,0.30)",
              }}
            >
              <Zap size={14} fill="white" /> Nuevo pick
            </Link>

            {/* Avatar */}
            <Link href={`/profile/${username}`} className="flex items-center gap-2 ml-3 pl-3 border-l border-white/10 hover:opacity-80 transition-opacity">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white"
                style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", boxShadow: "0 2px 8px rgba(59,130,246,0.35)" }}
              >
                {username?.[0]?.toUpperCase()}
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xs font-bold" style={{ color: "#f0f6ff" }}>@{username}</span>
                <span className="text-[10px]" style={{ color: "#4a6080" }}>Mi perfil</span>
              </div>
            </Link>

            <button onClick={handleLogout} className="ml-2 p-1.5 rounded-lg transition-all hover:bg-white/5" style={{ color: "#4a6080" }}>
              <LogOut size={14} />
            </button>
          </div>

          {/* Mobile — avatar */}
          <div className="flex md:hidden items-center gap-2">
            <Link href={`/profile/${username}`} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white"
                style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" }}
              >
                {username?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-semibold" style={{ color: "#8fa8cc" }}>@{username}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Bottom navbar — mobile */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-white/5"
        style={{ background: "linear-gradient(0deg, #0f1d35 0%, #0c1829 100%)" }}
      >
        <div className="flex items-center justify-around h-16 px-2">
          <Link
            href="/feed"
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all"
            style={isActive("/feed") ? { color: "#4ade80" } : { color: "#3a5070" }}
          >
            <Home size={21} />
            <span className="text-[10px] font-semibold">Feed</span>
          </Link>

          <Link
            href="/leaderboard"
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all"
            style={isActive("/leaderboard") ? { color: "#fbbf24" } : { color: "#3a5070" }}
          >
            <Trophy size={21} />
            <span className="text-[10px] font-semibold">Ranking</span>
          </Link>

          <Link href="/picks/new" className="flex flex-col items-center gap-0.5 px-3 py-1 -mt-4">
            <div
              className="rounded-2xl p-3 transition-all"
              style={{ background: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)", boxShadow: "0 4px 16px rgba(34,197,94,0.40)" }}
            >
              <PlusCircle size={22} className="text-white" />
            </div>
          </Link>

          <Link
            href={`/profile/${username}`}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all"
            style={pathname.startsWith("/profile") ? { color: "#4ade80" } : { color: "#3a5070" }}
          >
            <User size={21} />
            <span className="text-[10px] font-semibold">Perfil</span>
          </Link>

          {isAdmin ? (
            <Link
              href="/admin"
              className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all"
              style={isActive("/admin") ? { color: "#fbbf24" } : { color: "#3a5070" }}
            >
              <Settings size={21} />
              <span className="text-[10px] font-semibold">Admin</span>
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-0.5 px-4 py-1.5"
              style={{ color: "#3a5070" }}
            >
              <LogOut size={21} />
              <span className="text-[10px] font-semibold">Salir</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
