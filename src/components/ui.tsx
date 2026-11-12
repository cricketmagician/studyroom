import React from "react";
import Link from "next/link";
import { Bookmark, Check, ChevronRight } from "lucide-react";
import { formatSize } from "@/lib/files";
import type { Entry } from "@/lib/hooks";
import { Material } from "@/lib/materials";
import { MaterialIcon } from "@/components/material-icon";

export const pillButton =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-color)]";

export const cardClass = "rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-sm)]";

export function PageTitle({ name, title, sub }: { name?: string; title: string; sub?: string }) {
  return (
    <div className="cma-page-heading !mb-0">
      <div>
        {name && <span className="cma-eyebrow">Hello, {name.split(" ")[0]}</span>}
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
    </div>
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
