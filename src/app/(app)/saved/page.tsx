"use client";

import React from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { RequireRole } from "@/lib/auth";
import { useMaterials, useMyLibrary } from "@/lib/hooks";
import { ErrorText } from "@/components/auth-card";
import { cardClass, FileRow, PageTitle, pillButton } from "@/components/ui";

export default function SavedPage() {
  return (
    <RequireRole>
      <Saved />
    </RequireRole>
  );
}

function Saved() {
  const { items, error } = useMaterials();
  const entries = useMyLibrary();
  const saved = items?.filter((m) => entries[m.id]?.saved);
  const withNotes = items?.filter((m) => entries[m.id]?.note?.trim() && !entries[m.id]?.saved);

  return (
    <div className="space-y-6">
      <PageTitle title="Saved" />
      <ErrorText>{error}</ErrorText>

      {saved?.length === 0 && (
        <div className={`${cardClass} p-8 text-center`}>
          <span className="mx-auto w-14 h-14 rounded-2xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
            <Bookmark className="w-6 h-6" aria-hidden />
          </span>
          <h2 className="mt-4 font-heading font-bold">Nothing saved yet</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Open a file and tap “Save for later” to keep it here.</p>
          <Link href="/learn" className={`${pillButton} mt-5 h-11 px-6 text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white`}>
            Browse class files
          </Link>
        </div>
      )}

      {saved && saved.length > 0 && (
        <ul className="grid gap-3">
          {saved.map((m) => <FileRow key={m.id} m={m} entry={entries[m.id]} />)}
        </ul>
      )}

      {withNotes && withNotes.length > 0 && (
        <section className="space-y-3">
          <h2 className="pt-2 px-1 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Files with your notes</h2>
          <ul className="grid gap-3">
            {withNotes.map((m) => <FileRow key={m.id} m={m} entry={entries[m.id]} />)}
          </ul>
        </section>
      )}
    </div>
  );
}
