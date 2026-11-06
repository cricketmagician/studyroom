"use client";

import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { RequireRole, useAuth } from "@/lib/auth";
import { Kind } from "@/lib/files";
import { useMaterials, useMyLibrary } from "@/lib/hooks";
import { ErrorText } from "@/components/auth-card";
import { FileRow, pillButton } from "@/components/ui";
import { TodayCard, UpNextHero, useStreak } from "@/components/study-tiles";

export default function LearnPage() {
  return (
    <RequireRole>
      <Home />
    </RequireRole>
  );
}

const FILTERS: { value: Kind | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pdf", label: "PDFs" },
  { value: "video", label: "Videos" },
];

function greeting(hour: number) {
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

function Home() {
  const { profile } = useAuth();
  const { items, error } = useMaterials();
  const entries = useMyLibrary();
  const streak = useStreak();
  const [now] = useState(() => new Date());
  const [filter, setFilter] = useState<Kind | "all">("all");
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const shown = items?.filter(
    (m) => (filter === "all" || m.type === filter) && (!q || m.title.toLowerCase().includes(q) || m.teacherName.toLowerCase().includes(q))
  );

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">
            {now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="mt-0.5 text-3xl sm:text-4xl font-heading font-black tracking-tight leading-tight">
            {greeting(now.getHours())}, {profile?.name.split(" ")[0]}
          </h1>
        </div>
        <span
          className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[var(--shadow-sm)] text-sm font-bold"
          title="Days in a row you opened Studyroom"
        >
          <span aria-hidden>🔥</span> {streak.count}
          <span className="sr-only">day study streak</span>
        </span>
      </div>

      <ErrorText>{error}</ErrorText>

      {items ? <UpNextHero items={items} entries={entries} /> : <div className="h-[260px] rounded-[32px] bg-[var(--bg-surface-subtle)] animate-pulse" />}

      <TodayCard streak={streak} />

      {items && items.length > 0 && (
        <section className="space-y-4" aria-labelledby="files-heading">
          <div className="flex items-center justify-between gap-3">
            <h2 id="files-heading" className="text-lg font-heading font-black tracking-tight">Class files</h2>
            <div role="group" aria-label="Show" className="flex p-1 rounded-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
              {FILTERS.map((f) => {
                const active = filter === f.value;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    aria-pressed={active}
                    className={`${pillButton} h-8 px-3.5 text-xs ${
                      active ? "bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="relative block">
            <span className="sr-only">Search files</span>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by file or teacher"
              className="w-full h-12 pl-11 pr-11 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-sm outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--ring-color)] [&::-webkit-search-cancel-button]:hidden"
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search" className={`${pillButton} absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 text-[var(--text-muted)] hover:bg-[var(--bg-surface-subtle)]`}>
                <X className="w-4 h-4" />
              </button>
            )}
          </label>

          <ul className="grid gap-2.5">
            {shown?.map((m) => <FileRow key={m.id} m={m} entry={entries[m.id]} />)}
          </ul>
          {shown?.length === 0 && (
            <p className="text-center text-sm text-[var(--text-secondary)] py-8">{q ? `No files match "${search.trim()}".` : "Nothing here yet."}</p>
          )}
        </section>
      )}
    </div>
  );
}
