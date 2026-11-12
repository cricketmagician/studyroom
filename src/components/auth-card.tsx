"use client";
import React, { useState } from "react";
import Link from "next/link";
import { PlayCircle as CirclePlay, Eye, EyeSlash as EyeOff, FileText, LockSimple as Lock, EnvelopeSimple as Mail, Timer, UserCircle as UserRound, UsersThree as Users } from "@phosphor-icons/react";
import { HandNote } from "@/components/hand-note";
import "./auth.css";

/** Abhyas (Sanskrit: daily practice): an open book with a rising sun. Same artwork as public/brand/abhyas-mark.svg. */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden="true" className="shrink-0">
      <rect width="72" height="72" rx="20" fill="#465d40" />
      <circle cx="36" cy="33" r="9" fill="#f3c25e" />
      <path d="M14 46c8-5 15-5 22 0 7-5 14-5 22 0" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <path d="M14 53c8-5 15-5 22 0 7-5 14-5 22 0" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".55" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-color)]" aria-label="Abhyas home">
      <LogoMark />
      <span className="logo-wordmark font-heading font-bold text-xl tracking-tight text-[var(--text-primary)]">abhyas<span className="text-[var(--brand)]">.</span></span>
    </Link>
  );
}

const PERKS = [
  { icon: CirclePlay, label: "Video classes", tint: "blue" },
  { icon: FileText, label: "PDF notes", tint: "amber" },
  { icon: Timer, label: "Study timer", tint: "green" },
  { icon: Users, label: "Study with friends", tint: "pink" },
];

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="auth">
      <section className="auth-hero">
        <Logo />
        {/* eslint-disable-next-line @next/next/no-img-element -- Supplied local vector illustration. */}
        <img src="/illustrations/doodles/person-working-on-laptop.svg" alt="" className="auth-art" />
        <div className="auth-hero-copy">
          <h2>Study a little every day. <span>Pass your CMA.</span></h2>
          <HandNote text="One day at a time." />
        </div>
        <ul className="auth-perks" aria-label="What you get">
          {PERKS.map(({ icon: Icon, label, tint }) => (
            <li key={label}><span className="tint" data-tint={tint}><Icon size={18} aria-hidden="true" /></span>{label}</li>
          ))}
        </ul>
      </section>
      <section className="auth-sheet">
        <div>
          <h1>{title}</h1>
          <p className="auth-sub">{subtitle}</p>
          {children}
        </div>
      </section>
    </main>
  );
}

export const inputClass =
  "mt-1.5 w-full h-12 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 text-base outline-none transition-colors focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] focus:ring-4 focus:ring-[var(--ring-color)] disabled:opacity-60";

export const buttonClass = "auth-primary";

const FIELD_ICON = { email: Mail, password: Lock } as const;

export function Field({ label, type = "text", ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [shown, setShown] = useState(false);
  const Icon = FIELD_ICON[type as keyof typeof FIELD_ICON] ?? UserRound;
  return (
    <label className="auth-field">
      {label}
      <span>
        <Icon size={18} aria-hidden="true" />
        <input required type={type === "password" && shown ? "text" : type} {...props} />
        {type === "password" && (
          <button type="button" onClick={() => setShown(!shown)} aria-label={shown ? "Hide password" : "Show password"} aria-pressed={shown}>
            {shown ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </span>
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
