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
import { pillButton } from "@/components/ui";

const TEACHER_LINKS = [
  { href: "/teacher", label: "Upload", icon: CloudUpload },
  { href: "/learn", label: "Library", icon: Library },
];

const chip = `${pillButton} h-10 bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[var(--shadow-sm)]`;

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

  // Labelled pills: non-tech users read words faster than icons.
  const nav = isTeacher && (
    <nav aria-label="Main" className="flex gap-1.5">
      {TEACHER_LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href === "/learn" && pathname.startsWith("/learn/"));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`${pillButton} flex-1 sm:flex-none h-10 px-4 text-xs ${
              active
                ? "bg-[#111110] text-white dark:bg-white dark:text-[#111110] shadow-[var(--shadow-sm)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            }`}
          >
            <Icon className="w-4 h-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-full focus:bg-[var(--bg-surface)] focus:shadow-lg">
        Skip to content
      </a>

      <header className="sticky top-0 z-20 bg-[color-mix(in_srgb,var(--bg-primary)_80%,transparent)] backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <Logo />
          <div className="hidden sm:block ml-3">{nav}</div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
              className={`${chip} w-10`}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {profile && (
              <span className="flex items-center gap-2 h-10 pl-1 pr-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[var(--shadow-sm)]">
                <span aria-hidden className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-heading font-bold text-xs">
                  {profile.name.trim().charAt(0).toUpperCase() || "?"}
                </span>
                <span className="flex flex-col leading-none">
                  <span className="hidden md:block text-xs font-semibold max-w-[8rem] truncate">{profile.name}</span>
                  <span className="text-[10px] text-[var(--text-muted)] md:mt-0.5">{isTeacher ? "Teacher" : "Student"}</span>
                </span>
              </span>
            )}

            <button onClick={logout} className={`${chip} px-3.5 text-xs hover:text-red-600 hover:border-red-200 dark:hover:text-red-400 dark:hover:border-red-900`}>
              <LogOut className="w-4 h-4" aria-hidden />
              <span className="hidden sm:inline">Log out</span>
              <span className="sr-only sm:hidden">Log out</span>
            </button>
          </div>
        </div>

        {nav && <div className="sm:hidden px-4 pb-3">{nav}</div>}
      </header>

      <main id="main" className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-24">{children}</main>
    </>
  );
}
