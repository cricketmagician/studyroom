"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail, signOut } from "firebase/auth";
import { Bookmark, CheckCircle2, KeyRound, LogOut, Moon, NotebookPen, Sun } from "lucide-react";
import { auth } from "@/lib/firebase/config";
import { friendlyError } from "@/lib/firebase/errors";
import { RequireRole, useAuth } from "@/lib/auth";
import { useMyLibrary } from "@/lib/hooks";
import { useTheme } from "@/components/providers/theme-provider";
import { ErrorText } from "@/components/auth-card";
import { cardClass, PageTitle, pillButton } from "@/components/ui";

export default function ProfilePage() {
  return (
    <RequireRole>
      <Profile />
    </RequireRole>
  );
}

const row = "w-full flex items-center gap-3 px-4 h-14 rounded-2xl text-left text-sm font-semibold transition-colors hover:bg-[var(--bg-surface-subtle)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-color)] disabled:opacity-60";

function Profile() {
  const { user, profile } = useAuth();
  const entries = Object.values(useMyLibrary());
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!profile || !user) return null;

  const stats = [
    { label: "Done", value: entries.filter((e) => e.done).length, icon: <CheckCircle2 className="w-4 h-4" /> },
    { label: "Saved", value: entries.filter((e) => e.saved).length, icon: <Bookmark className="w-4 h-4" /> },
    { label: "Notes", value: entries.filter((e) => e.note?.trim()).length, icon: <NotebookPen className="w-4 h-4" /> },
  ];

  const resetPassword = async () => {
    setBusy(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, profile.email);
      setMessage(`We sent a link to ${profile.email}. Open it to choose a new password.`);
    } catch (err) {
      setError(friendlyError(err));
    }
    setBusy(false);
  };

  const logout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <div className="space-y-6">
      <PageTitle title="Profile" />

      <section className={`${cardClass} p-6 flex items-center gap-4`}>
        <span aria-hidden className="shrink-0 w-16 h-16 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-heading font-black text-2xl">
          {profile.name.trim().charAt(0).toUpperCase() || "?"}
        </span>
        <div className="min-w-0">
          <h2 className="font-heading font-black text-xl tracking-tight truncate">{profile.name}</h2>
          <p className="text-sm text-[var(--text-secondary)] truncate">{profile.email}</p>
          <span className="mt-1.5 inline-block px-2.5 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-text)] text-[11px] font-semibold">
            {profile.role === "teacher" ? "Teacher" : "Student"}
          </span>
        </div>
      </section>

      {profile.role === "student" && (
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className={`${cardClass} p-4`}>
              <span className="w-8 h-8 rounded-full bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">{s.icon}</span>
              <p className="mt-3 text-3xl font-heading font-black tracking-tight">{s.value}</p>
              <p className="text-xs text-[var(--text-secondary)]">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <section className={`${cardClass} p-2`}>
        <button onClick={toggleTheme} className={row}>
          {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" aria-hidden /> : <Moon className="w-5 h-5" aria-hidden />}
          {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        </button>
        <button onClick={resetPassword} disabled={busy} className={row}>
          <KeyRound className="w-5 h-5" aria-hidden />
          {busy ? "Sending…" : "Change password"}
        </button>
      </section>

      {message && <p role="status" className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-800 dark:text-emerald-200">{message}</p>}
      <ErrorText>{error}</ErrorText>

      <button onClick={logout} className={`${pillButton} w-full h-12 text-sm border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40`}>
        <LogOut className="w-4 h-4" aria-hidden /> Log out
      </button>
    </div>
  );
}
