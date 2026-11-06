import React from "react";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2">
      <span className="w-9 h-9 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-heading font-bold text-lg shadow-sm">
        S
      </span>
      <span className="font-heading font-bold text-xl text-[var(--text-primary)]">Studyroom</span>
    </Link>
  );
}

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md text-center">
        <Logo />
        <h1 className="mt-6 text-2xl font-heading font-bold">{title}</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>
      </div>
      <div className="mt-8 mx-auto w-full max-w-md bg-[var(--bg-surface)] p-6 sm:p-8 rounded-3xl border shadow-[var(--shadow-lg)]">
        {children}
      </div>
    </main>
  );
}

export const inputClass =
  "mt-1 w-full rounded-xl border bg-[var(--bg-surface-subtle)] px-4 py-3 text-base outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--ring-color)]";

export const buttonClass =
  "w-full rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-color)]";

export function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input className={inputClass} required {...props} />
    </label>
  );
}

export function ErrorText({ children }: { children: React.ReactNode }) {
  return children ? (
    <p role="alert" className="text-sm text-red-600 dark:text-red-400">
      {children}
    </p>
  ) : null;
}
