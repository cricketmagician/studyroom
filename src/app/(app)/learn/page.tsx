"use client";

import React, { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { ArrowRight, Sparkles } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { friendlyError } from "@/lib/firebase/errors";
import { RequireRole, useAuth } from "@/lib/auth";
import { Kind } from "@/lib/files";
import { Material, toMaterial } from "@/lib/materials";
import { ErrorText } from "@/components/auth-card";
import { MaterialIcon } from "@/components/material-icon";
import { FileRow, PageTitle, PhotoHero, pillButton } from "@/components/ui";
import { ContinueTile, FocusTimer, StatTiles, StreakTile } from "@/components/study-tiles";

export default function LearnPage() {
  return (
    <RequireRole>
      <Library />
    </RequireRole>
  );
}

const FILTERS: { value: Kind | "all"; label: string }[] = [
  { value: "all", label: "All files" },
  { value: "pdf", label: "PDFs" },
  { value: "video", label: "Videos" },
];

function Library() {
  const { profile } = useAuth();
  const [items, setItems] = useState<Material[] | null>(null);
  const [filter, setFilter] = useState<Kind | "all">("all");
  const [error, setError] = useState("");

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "materials"), orderBy("createdAt", "desc")),
        (snap) => setItems(snap.docs.map(toMaterial)),
        (err) => setError(friendlyError(err))
      ),
    []
  );

  const latest = items?.[0];
  const shown = items?.filter((m) => filter === "all" || m.type === filter);

  return (
    <div className="space-y-6">
      <PageTitle name={profile?.name} title="Class Files" />

      <PhotoHero image="/student-portrait.jpg" badge={latest ? "✨ Latest upload" : "📚 Your class library"} href={latest && `/learn/${latest.id}`}>
        {latest ? (
          <>
            <span className="flex items-center gap-2.5 min-w-0 pl-1">
              <span className="shrink-0 w-9 h-9 rounded-full bg-white text-[var(--accent)] flex items-center justify-center">
                <MaterialIcon type={latest.type} className="w-4 h-4" />
              </span>
              <span className="flex flex-col min-w-0">
                <span className="text-[11px] text-white/90 font-medium leading-none">From {latest.teacherName}</span>
                <span className="text-sm font-bold text-white mt-1 truncate">{latest.title}</span>
              </span>
            </span>
            <span className="shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[var(--accent)] text-white text-xs font-semibold">
              {latest.type === "pdf" ? "Read" : "Watch"} <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </>
        ) : (
          <span className="flex items-center gap-2.5 pl-1">
            <span className="w-9 h-9 rounded-full bg-white text-[var(--accent)] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-sm font-bold text-white">{items ? "No files yet. Your teacher's uploads will show up here." : "Loading…"}</span>
          </span>
        )}
      </PhotoHero>

      <ErrorText>{error}</ErrorText>

      {items && <ContinueTile items={items} />}
      {items && items.length > 0 && <StatTiles items={items} />}
      <div className="grid sm:grid-cols-2 gap-4">
        <FocusTimer />
        <StreakTile />
      </div>

      {items && items.length > 0 && (
        <>
          <h2 className="pt-2 px-1 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">All class files</h2>
          <div role="group" aria-label="Show" className="flex items-center gap-2 overflow-x-auto pb-1">
            {FILTERS.map((f) => {
              const count = f.value === "all" ? items.length : items.filter((m) => m.type === f.value).length;
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  aria-pressed={active}
                  className={`${pillButton} h-10 px-5 text-xs whitespace-nowrap ${
                    active
                      ? "bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[var(--shadow-sm)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                  }`}
                >
                  {f.label} <span className="text-[var(--text-muted)] font-mono">{count}</span>
                </button>
              );
            })}
          </div>

          <ul className="grid gap-3">
            {shown?.map((m) => <FileRow key={m.id} m={m} />)}
          </ul>
          {shown?.length === 0 && <p className="text-center text-sm text-[var(--text-secondary)] py-6">Nothing here yet.</p>}
        </>
      )}

    </div>
  );
}
