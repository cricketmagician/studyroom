import React from "react";
import Link from "next/link";
import { Bookmark, Check, ChevronRight } from "lucide-react";
import { formatSize } from "@/lib/files";
import type { Entry } from "@/lib/hooks";
import { Material } from "@/lib/materials";
import { MaterialIcon } from "@/components/material-icon";

export const pillButton =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-color)]";

export const cardClass = "rounded-[30px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-sm)]";

/** "Hello, Name!" over a big bold title, like the original dashboard. */
export function PageTitle({ name, title }: { name?: string; title: string }) {
  return (
    <div>
      {name && <p className="text-sm sm:text-base text-[var(--text-secondary)] tracking-tight">Hello, {name.split(" ")[0]}!</p>}
      <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight leading-tight mt-0.5">{title}</h1>
    </div>
  );
}

/** Photo card with a frosted-glass bar at the bottom. */
export function PhotoHero({
  image,
  badge,
  href,
  children,
}: {
  image: string;
  badge: string;
  href?: string;
  children: React.ReactNode;
}) {
  const body = (
    <>
      <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
        {badge}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element -- static decorative photo */}
      <img src={image} alt="" className="w-full h-[280px] sm:h-[340px] object-cover object-[center_20%] group-hover:scale-105 transition-transform duration-500" />
      <span className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
      <span className="absolute inset-x-3.5 bottom-3.5 z-10 backdrop-blur-md bg-white/40 dark:bg-black/40 border border-white/60 dark:border-white/20 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xl">
        {children}
      </span>
    </>
  );
  const className = "group block relative rounded-[32px] overflow-hidden shadow-lg bg-[#EFE6D8]";
  return href ? (
    <Link href={href} className={`${className} transition-transform hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-color)]`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

/** One file in a list: icon tile, title, details, and an arrow (or a custom action). */
export function FileRow({ m, action, entry }: { m: Material; action?: React.ReactNode; entry?: Entry }) {
  return (
    <li className="group flex items-center gap-3.5 p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-color)] shadow-[var(--shadow-sm)] transition-colors">
      <span
        className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
          m.type === "pdf" ? "bg-[var(--accent-light)] text-[var(--accent-text)]" : "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
        }`}
      >
        <MaterialIcon type={m.type} className="w-5 h-5" />
      </span>
      <Link href={`/learn/${m.id}`} className="min-w-0 flex-1 focus-visible:outline-none focus-visible:underline">
        <span className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm font-bold truncate group-hover:text-[var(--accent)] transition-colors">{m.title}</span>
          {entry?.done && (
            <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
              <Check className="w-3 h-3" aria-hidden /> Done
            </span>
          )}
          {entry?.saved && <Bookmark className="shrink-0 w-3.5 h-3.5 fill-[var(--accent)] text-[var(--accent)]" aria-label="Saved" />}
        </span>
        <span className="block text-xs text-[var(--text-secondary)] mt-0.5">
          {m.type === "pdf" ? "PDF" : "Video"} · {m.teacherName} · {m.createdAt?.toDate().toLocaleDateString() ?? "Just now"} · {formatSize(m.size)}
        </span>
      </Link>
      {action ?? (
        <span aria-hidden className="shrink-0 w-8 h-8 rounded-full bg-[var(--bg-surface-subtle)] text-[var(--text-muted)] flex items-center justify-center group-hover:bg-[var(--accent-light)] group-hover:text-[var(--accent)] transition-colors">
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </li>
  );
}
