"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, CloudUpload, House, Library, Moon, Sun, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/components/providers/theme-provider";
import { Logo } from "@/components/auth-card";
import { pillButton } from "@/components/ui";

const STUDENT_TABS = [
  { href: "/learn", label: "Home", icon: House },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/profile", label: "Profile", icon: UserRound },
];

const TEACHER_TABS = [
  { href: "/teacher", label: "Upload", icon: CloudUpload },
  { href: "/learn", label: "Library", icon: Library },
  { href: "/profile", label: "Profile", icon: UserRound },
];

const chip = `${pillButton} h-10 bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[var(--shadow-sm)]`;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const tabs = profile?.role === "teacher" ? TEACHER_TABS : STUDENT_TABS;

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-full focus:bg-[var(--bg-surface)] focus:shadow-lg">
        Skip to content
      </a>

      <header className="sticky top-0 z-20 bg-[color-mix(in_srgb,var(--bg-primary)_80%,transparent)] backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <Logo />
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
              <Link href="/profile" aria-label="Your profile" className={`${chip} pl-1 pr-3`}>
                <span aria-hidden className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-heading font-bold text-xs">
                  {profile.name.trim().charAt(0).toUpperCase() || "?"}
                </span>
                <span className="text-xs max-w-[8rem] truncate">{profile.name.split(" ")[0]}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main id="main" className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-32">{children}</main>

      {/* Floating footer nav, like a phone app. Labels stay visible so nobody has to guess an icon. */}
      {profile && (
        <nav aria-label="Main" className="fixed bottom-0 inset-x-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none">
          <ul className="pointer-events-auto mx-auto max-w-sm flex items-center justify-between gap-1 p-1.5 rounded-full bg-[#111110] dark:bg-[#262623] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.45)] border border-white/10">
            {tabs.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href === "/learn" && pathname.startsWith("/learn/"));
              return (
                <li key={href} className="flex-1">
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`flex flex-col items-center justify-center gap-0.5 h-14 rounded-full text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-color)] ${
                      active ? "bg-[var(--accent)] text-white" : "text-white/60 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" aria-hidden />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </>
  );
}
