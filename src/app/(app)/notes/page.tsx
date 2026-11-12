"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HardDrive, Pin, Plus, Search, X } from "lucide-react";
import { ImageSummary, imageStorageError, listImageSummaries } from '@/lib/note-images';
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

function NoteCard({ note, images }: { note: Note; images?: ImageSummary }) {
  return (
    <li>
      <Link
        href={`/notes/${note.id}`}
        className={`${cardClass} group block h-full p-5 hover:border-[var(--border-color)] hover:shadow-[var(--shadow-md)] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-color)]`}
      >
        <span className="flex items-start justify-between gap-2">
          <span className="font-heading font-bold leading-snug line-clamp-1 group-hover:text-[var(--brand-ink)] transition-colors">{note.title || "Untitled"}</span>
          {note.pinned && <Pin className="shrink-0 w-3.5 h-3.5 fill-[var(--brand)] text-[var(--brand)]" aria-label="Pinned" />}
        </span>
        <span className="mt-1.5 block text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3 whitespace-pre-line min-h-[1.5rem]">
          {note.body || (images?.count ? 'Photo notes · open to view your images' : 'No text yet')}
        </span>
        {!!images?.count && <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-[var(--brand-ink)]"><HardDrive size={13}/>{images.count} {images.count===1 ? 'image' : 'images'} on this device</span>}
        <span className="mt-4 block text-[13px] text-[var(--text-secondary)]">
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
  const { items: files, error: filesError } = useMaterials();
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [createError, setCreateError] = useState("");
  const [localImages,setLocalImages] = useState<{uid:string;items:Record<string,ImageSummary>} | null>(null);
  const [storageError,setStorageError] = useState('');
  useEffect(() => {
    if (!user) return;
    let active=true;
    const load = () => { void listImageSummaries(user.uid).then(items => {if(active){setLocalImages({uid:user.uid,items});setStorageError('');}}).catch(e => {if(active)setStorageError(imageStorageError(e));}); };
    const timer=setTimeout(load,0);
    const visible=() => {if(document.visibilityState==='visible')load();};
    document.addEventListener('visibilitychange',visible);
    return () => {active=false;clearTimeout(timer);document.removeEventListener('visibilitychange',visible);};
  },[user]);

  const q = search.trim().toLowerCase();
  const matches = (text: string) => !q || text.toLowerCase().includes(q);
  const notes = (items ?? [])
    .filter((n) => matches(n.title) || matches(n.body))
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

  const loading = (items === null && !error) || (files === null && !filesError);
  const empty = !error && !filesError && notes.length === 0 && fileNotes.length === 0 && !q;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <PageTitle title="Notes" sub="Write what you learn. Text is saved to your account. Photos stay on this device." />
        <button onClick={newNote} disabled={busy} className={`${pillButton} shrink-0 h-11 px-5 text-sm bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-[var(--on-brand)] shadow-[var(--shadow-md)]`}>
          <Plus className="w-4 h-4" aria-hidden /> New note
        </button>
      </div>

      <ErrorText>{error || filesError || createError}</ErrorText>
      <ErrorText>{storageError ? `Local photos: ${storageError} Your text notes are still available.` : ''}</ErrorText>

      {loading ? (
        <div role="status" className={`${cardClass} p-8 text-sm text-[var(--text-secondary)]`}>Loading your notebook…</div>
      ) : empty ? (
        <div className={`${cardClass} p-8 text-center`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- local doodle */}
          <img className="doodle block w-[144px] h-[144px] mx-auto object-contain" src="/illustrations/doodles/character-reading-newspaper-with-coffee.svg" alt="" loading="lazy" />
          <h2 className="mt-4">No notes yet</h2>
          <p className="mt-1 text-base text-[var(--text-secondary)]">Write down what you learn. You can add photos of your notes too.</p>
          <button onClick={newNote} disabled={busy} className={`${pillButton} mt-5 h-11 px-6 text-sm bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-[var(--on-brand)]`}>
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
              className="w-full h-12 pl-11 pr-11 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-sm outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--ring-color)] [&::-webkit-search-cancel-button]:hidden"
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search" className={`${pillButton} absolute right-0.5 top-1/2 -translate-y-1/2 w-11 h-11 text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)]`}>
                <X className="w-4 h-4" />
              </button>
            )}
          </label>

          {[["Pinned", pinned], [pinned.length ? "Other notes" : "", others]].map(([label, list]) =>
            (list as Note[]).length > 0 ? (
              <section key={label as string} className="space-y-3">
                {label && <h2 className="cma-eyebrow px-1">{label as string}</h2>}
                <ul className="grid sm:grid-cols-2 gap-3">
                  {(list as Note[]).map((n) => <NoteCard key={n.id} note={n} images={localImages?.uid===user?.uid ? localImages?.items[n.id] : undefined} />)}
                </ul>
              </section>
            ) : null
          )}

          {fileNotes.length > 0 && (
            <section className="space-y-3">
              <h2 className="cma-eyebrow px-1">Notes on videos and PDFs</h2>
              <ul className="grid gap-2.5">
                {fileNotes.map((m) => (
                  <li key={m.id}>
                    <Link href={`/learn/${m.id}`} className={`${cardClass} group flex items-start gap-3 p-4 hover:border-[var(--border-color)] transition-colors`}>
                      <span className="shrink-0 w-9 h-9 rounded-xl bg-[var(--brand-soft)] text-[var(--brand-ink)] flex items-center justify-center">
                        <MaterialIcon type={m.type} className="w-4 h-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold truncate group-hover:text-[var(--brand-ink)]">{m.title}</span>
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
