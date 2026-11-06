"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { CloudUpload, Library, LogOut, Moon, Sun } from "lucide-react";
import { auth } from "@/lib/firebase/config";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/components/providers/theme-provider";
import { Logo } from "@/components/auth-card";

const focusRing = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-color)]";

const TEACHER_LINKS = [
  { href: "/teacher", label: "Upload", icon: CloudUpload },
  { href: "/learn", label: "Library", icon: Library },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const isTeacher = profile?.role === "teacher";

  const logout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  // Labelled segmented tabs: non-tech users read words faster than icons.
  const nav = isTeacher && (
    <nav aria-label="Main" className="flex p-1 gap-1 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
      {TEACHER_LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href === "/learn" && pathname.startsWith("/learn/"));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold transition-all ${focusRing} ${
              active
                ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)] ring-1 ring-[var(--border-color)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Icon className={`w-4 h-4 ${active ? "text-[var(--accent)]" : ""}`} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <a href="#main" className={`sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-[var(--bg-surface)] ${focusRing}`}>
        Skip to content
      </a>

      <header className="sticky top-0 z-20 border-b border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-primary)_75%,transparent)] backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">
          <Logo />

          <div className="hidden sm:block">{nav}</div>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
              className={`w-10 h-10 inline-flex items-center justify-center rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors ${focusRing}`}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <span className="w-px h-6 bg-[var(--border-color)] mx-1.5" aria-hidden />

            {profile && (
              <div className="flex items-center gap-3 pr-1">
                <span
                  aria-hidden
                  className="w-9 h-9 rounded-full bg-[var(--accent-light)] text-[var(--accent-text)] ring-1 ring-[var(--border-color)] flex items-center justify-center font-heading font-bold text-sm"
                >
                  {profile.name.trim().charAt(0).toUpperCase() || "?"}
                </span>
                <span className="hidden md:flex flex-col leading-tight">
                  <span className="text-sm font-semibold max-w-[10rem] truncate">{profile.name}</span>
                  <span className="text-xs text-[var(--text-muted)]">{isTeacher ? "Teacher" : "Student"}</span>
                </span>
              </div>
            )}

            <button
              onClick={logout}
              className={`inline-flex items-center gap-2 h-10 px-3 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors ${focusRing}`}
            >
              <LogOut className="w-4 h-4" aria-hidden />
              <span className="hidden sm:inline">Log out</span>
              <span className="sr-only sm:hidden">Log out</span>
            </button>
          </div>
        </div>

        {nav && <div className="sm:hidden px-4 pb-3">{nav}</div>}
      </header>

      <main id="main" className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </>
  );
}
