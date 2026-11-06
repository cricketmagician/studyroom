"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NotebookPen, Pin, Plus, Search, X } from "lucide-react";
import { RequireRole, useAuth } from "@/lib/auth";
import { friendlyError } from "@/lib/firebase/errors";
import { createNote, Note, useMaterials, useMyLibrary, useNotes } from "@/lib/hooks";
import { ErrorText } from "@/components/auth-card";
import { MaterialIcon } from "@/components/material-icon";
import { cardClass, PageTitle, pillButton } from "@/components/ui";

export default function NotesPage() {
  return (
    <RequireRole>
      <Notes />
    </RequireRole>
  );
}

function NoteCard({ note }: { note: Note }) {
  return (
    <li>
      <Link
        href={`/notes/${note.id}`}
        className={`${cardClass} group block h-full p-4 hover:border-[var(--border-color)] hover:shadow-[var(--shadow-md)] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-color)]`}
      >
        <span className="flex items-start justify-between gap-2">
          <span className="font-heading font-bold leading-snug line-clamp-1 group-hover:text-[var(--accent)] transition-colors">{note.title || "Untitled"}</span>
          {note.pinned && <Pin className="shrink-0 w-3.5 h-3.5 fill-[var(--accent)] text-[var(--accent)]" aria-label="Pinned" />}
        </span>
        <span className="mt-1.5 block text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3 whitespace-pre-line min-h-[1.5rem]">
          {note.body || "No text yet"}
        </span>
        <span className="mt-3 block text-[11px] text-[var(--text-muted)]">
          {note.updatedAt?.toDate().toLocaleDateString(undefined, { day: "numeric", month: "short" }) ?? "Just now"}
        </span>
      </Link>
    </li>
  );
}

function Notes() {
  const { user } = useAuth();
  const router = useRouter();
  const { items, error } = useNotes();
  const entries = useMyLibrary();
  const { items: files } = useMaterials();
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [createError, setCreateError] = useState("");

  const q = search.trim().toLowerCase();
  const matches = (text: string) => !q || text.toLowerCase().includes(q);
  const notes = (items ?? [])
    .filter((n) => (n.title.trim() || n.body.trim()) && (matches(n.title) || matches(n.body)))
    .sort((a, b) => (b.updatedAt?.toMillis() ?? Infinity) - (a.updatedAt?.toMillis() ?? Infinity));
  const pinned = notes.filter((n) => n.pinned);
  const others = notes.filter((n) => !n.pinned);
  const fileNotes = (files ?? []).filter((m) => entries[m.id]?.note?.trim() && (matches(m.title) || matches(entries[m.id].note!)));

  const newNote = async () => {
    if (!user) return;
    setBusy(true);
    setCreateError("");
    try {
      router.push(`/notes/${await createNote(user.uid)}`);
    } catch (err) {
      setCreateError(friendlyError(err));
      setBusy(false);
    }
  };

  const empty = notes.length === 0 && fileNotes.length === 0 && !q;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <PageTitle title="Notes" />
        <button onClick={newNote} disabled={busy} className={`${pillButton} shrink-0 h-11 px-5 text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-[var(--shadow-md)]`}>
          <Plus className="w-4 h-4" aria-hidden /> New note
        </button>
      </div>

      <ErrorText>{error || createError}</ErrorText>

      {empty ? (
        <div className={`${cardClass} p-8 text-center`}>
          <span className="mx-auto w-14 h-14 rounded-2xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
            <NotebookPen className="w-6 h-6" aria-hidden />
          </span>
          <h2 className="mt-4 font-heading font-bold">Your notebook is empty</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Write down what you learn, questions for class, or things to revise. Notes save as you type.</p>
          <button onClick={newNote} disabled={busy} className={`${pillButton} mt-5 h-11 px-6 text-sm bg-[#111110] text-white dark:bg-white dark:text-[#111110]`}>
            <Plus className="w-4 h-4" aria-hidden /> Write your first note
          </button>
        </div>
      ) : (
        <>
          <label className="relative block">
            <span className="sr-only">Search notes</span>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your notes"
              className="w-full h-12 pl-11 pr-11 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-sm outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--ring-color)] [&::-webkit-search-cancel-button]:hidden"
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search" className={`${pillButton} absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 text-[var(--text-muted)] hover:bg-[var(--bg-surface-subtle)]`}>
                <X className="w-4 h-4" />
              </button>
            )}
          </label>

          {[["Pinned", pinned], [pinned.length ? "Other notes" : "", others]].map(([label, list]) =>
            (list as Note[]).length > 0 ? (
              <section key={label as string} className="space-y-3">
                {label && <h2 className="px-1 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{label as string}</h2>}
                <ul className="grid sm:grid-cols-2 gap-3">
                  {(list as Note[]).map((n) => <NoteCard key={n.id} note={n} />)}
                </ul>
              </section>
            ) : null
          )}

          {fileNotes.length > 0 && (
            <section className="space-y-3">
              <h2 className="px-1 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Notes on class files</h2>
              <ul className="grid gap-2.5">
                {fileNotes.map((m) => (
                  <li key={m.id}>
                    <Link href={`/learn/${m.id}`} className={`${cardClass} group flex items-start gap-3 p-4 hover:border-[var(--border-color)] transition-colors`}>
                      <span className="shrink-0 w-9 h-9 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
                        <MaterialIcon type={m.type} className="w-4 h-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold truncate group-hover:text-[var(--accent)]">{m.title}</span>
                        <span className="block text-sm text-[var(--text-secondary)] line-clamp-2 whitespace-pre-line">{entries[m.id].note}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {q && notes.length === 0 && fileNotes.length === 0 && (
            <p className="text-center text-sm text-[var(--text-secondary)] py-8">No notes match &quot;{search.trim()}&quot;.</p>
          )}
        </>
      )}
    </div>
  );
}
