"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { LogOut, Moon, Sun } from "lucide-react";
import { auth } from "@/lib/firebase/config";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/components/providers/theme-provider";
import { Logo } from "@/components/auth-card";

const iconButton =
  "p-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-color)]";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const links = profile?.role === "teacher"
    ? [{ href: "/teacher", label: "My uploads" }, { href: "/learn", label: "Library" }]
    : [];

  const logout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-[var(--bg-surface)]/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">
          <Logo />
          <nav className="flex gap-1 ml-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={pathname === l.href ? "page" : undefined}
                className={`px-3 py-2 rounded-xl text-sm font-medium ${
                  pathname === l.href
                    ? "bg-[var(--accent-light)] text-[var(--accent-text)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            {profile && <span className="hidden sm:block text-sm text-[var(--text-secondary)] mr-2">Hi, {profile.name}</span>}
            <button onClick={toggleTheme} className={iconButton} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={logout} className={iconButton} aria-label="Log out" title="Log out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </>
  );
}
