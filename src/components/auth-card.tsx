import React from "react";
import Link from "next/link";
import { CirclePlay, FileText } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-color)]">
      <span className="w-9 h-9 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-heading font-black text-lg shadow-sm">
        S
      </span>
      <span className="font-heading font-black text-lg tracking-tight text-[var(--text-primary)]">Studyroom</span>
    </Link>
  );
}

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen px-4 py-8 sm:py-12 flex items-center">
      <div className="mx-auto w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Photo side, like the original hero card (desktop only) */}
        <div className="hidden lg:block relative rounded-[32px] overflow-hidden shadow-lg bg-[#EFE6D8]">
          {/* eslint-disable-next-line @next/next/no-img-element -- static decorative photo */}
          <img src="/student-hero-banner.jpg" alt="" className="w-full h-[600px] object-cover object-[58%_center]" />
          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
            ✨ Your class, in one place
          </span>
          <span className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute inset-x-4 bottom-4 backdrop-blur-md bg-white/40 border border-white/60 rounded-2xl p-3.5 flex items-center justify-between shadow-xl">
            <span className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-full bg-white text-[var(--accent)] flex items-center justify-center"><FileText className="w-4 h-4" /></span>
              <span className="text-xs font-bold text-white leading-tight">Notes &amp; PDFs<br /><span className="font-medium text-white/85">from your teacher</span></span>
            </span>
            <span className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-full bg-[var(--accent)] text-white flex items-center justify-center"><CirclePlay className="w-4 h-4" /></span>
              <span className="text-xs font-bold text-white leading-tight">Class videos<br /><span className="font-medium text-white/85">watch anytime</span></span>
            </span>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <Logo />
          <h1 className="mt-8 text-3xl sm:text-4xl font-heading font-black tracking-tight leading-tight">{title}</h1>
          <p className="mt-1.5 text-[var(--text-secondary)]">{subtitle}</p>
          <div className="mt-8 bg-[var(--bg-surface)] p-6 sm:p-7 rounded-[30px] border border-[var(--border-subtle)] shadow-[var(--shadow-lg)]">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

export const inputClass =
  "mt-1.5 w-full h-12 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 text-base outline-none transition-colors focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] focus:ring-4 focus:ring-[var(--ring-color)] disabled:opacity-60";

export const buttonClass =
  "w-full h-12 rounded-full bg-[#111110] hover:bg-black text-white dark:bg-white dark:text-[#111110] dark:hover:bg-neutral-100 font-semibold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-color)]";

export function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input className={inputClass} required {...props} />
    </label>
  );
}

export function ErrorText({ children }: { children: React.ReactNode }) {
  return children ? (
    <p role="alert" className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm font-medium text-red-700 dark:text-red-300">
      {children}
    </p>
  ) : null;
}
