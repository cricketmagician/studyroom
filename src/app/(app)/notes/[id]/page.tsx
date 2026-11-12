"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Pin, Trash2 } from "lucide-react";
import { RequireRole, Spinner, useAuth } from "@/lib/auth";
import { friendlyError } from "@/lib/firebase/errors";
import { deleteNote, MAX_NOTE_BODY, saveNote, useNotes } from "@/lib/hooks";
import { ErrorText } from "@/components/auth-card";
import { cardClass, pillButton } from "@/components/ui";
import { NoteImages } from '@/components/note-images';
import { deleteLocalNoteImages, imageStorageError } from '@/lib/note-images';

export default function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  return (
    <RequireRole>
      <Editor key={`${user?.uid}:${id}`} />
    </RequireRole>
  );
}

type Patch = { title?: string; body?: string };

const roundButton = `${pillButton} h-10 bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[var(--shadow-sm)]`;

function Editor() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { items, error: loadError } = useNotes();
  const note = items?.find((n) => n.id === id);

  // Local edits win over the stored copy until saved, so typing never jumps.
  const [title, setTitle] = useState<string | null>(null);
  const [body, setBody] = useState<string | null>(null);
  const [status, setStatus] = useState<"saved" | "saving" | "idle" | "error">("idle");
  const [error, setError] = useState("");
  const [mediaBusy,setMediaBusy] = useState(false);
  const [deleting,setDeleting] = useState(false);
  const [deleted,setDeleted] = useState(false);
  const pending = useRef<Patch | null>(null);
  const inFlight = useRef<Promise<void> | null>(null);

  const shownTitle = title ?? note?.title ?? "";
  const shownBody = body ?? note?.body ?? "";

  const flush = useCallback(async function flushPending(): Promise<void> {
    if (inFlight.current) { await inFlight.current; return; }
    if (!user || !pending.current) return;
    const patch = pending.current;
    pending.current = null;
    let failed = false;
    inFlight.current = saveNote(user.uid, id, patch)
      .catch((err) => {
        pending.current = {...patch,...pending.current}; failed = true;
        setError(friendlyError(err)); setStatus('error');
      });
    await inFlight.current;
    inFlight.current = null;
    if (failed) return;
    if (pending.current) await flushPending();
    else { setStatus('saved'); setError(''); }
  }, [user, id]);

  // Autosave 700ms after the last keystroke.
  useEffect(() => {
    if (title === null && body === null) return;
    const t = setTimeout(flush, 700);
    return () => clearTimeout(t);
  }, [title, body, flush]);

  // Keep image-only and unfinished notes; navigating back must never delete them.
  useEffect(() => () => { void flush(); }, [flush]);

  // Warn before closing the tab mid-save.
  useEffect(() => {
    if (status !== "saving" && status !== 'error' && !mediaBusy) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status,mediaBusy]);

  const edit = (patch: Patch) => {
    pending.current = { ...pending.current, ...patch };
    if (patch.title !== undefined) setTitle(patch.title);
    if (patch.body !== undefined) setBody(patch.body);
    setStatus("saving");
    setError("");
  };

  const togglePin = () => {
    if (!user || !note) return;
    saveNote(user.uid, id, { pinned: !note.pinned }).catch((err) => setError(friendlyError(err)));
  };

  const remove = async () => {
    if (!user || mediaBusy || deleting || !confirm("Delete this note? Its photos on this device will be deleted too, so save any you need first. Photos on your other devices stay there.")) return;
    setDeleting(true);
    pending.current = null;
    await inFlight.current;
    pending.current = null;
    try {
      await deleteNote(user.uid, id);
      setDeleted(true);
      await deleteLocalNoteImages(user.uid,id);
      router.replace("/notes");
    } catch (err) {
      setError(imageStorageError(err));
    } finally { setDeleting(false); }
  };

  if (!items) return loadError ? <ErrorText>{loadError}</ErrorText> : <Spinner />;
  if (deleted || (!note && title === null && body === null)) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-[var(--text-secondary)]">This note is not here any more.</p>
        <ErrorText>{error}</ErrorText>
        {deleted && error && <button className={`${roundButton} px-4 text-sm`} onClick={() => { if(user)void deleteLocalNoteImages(user.uid,id).then(() => router.replace('/notes')).catch(e => setError(imageStorageError(e))); }}>Try again</button>}
        <Link href="/notes" className={`${roundButton} px-4 text-sm`}>Back to notes</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/notes"
          onClick={e => { if(mediaBusy || deleting)e.preventDefault(); }}
          className={`${roundButton} px-4 text-[13px]`}
        >
          <ArrowLeft className="w-4 h-4" aria-hidden /> Notes
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-[var(--text-secondary)] mr-1" role="status">
            {status === "saving" ? "Saving…" : status === "saved" ? <span className="inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Saved</span> : ""}
          </span>
          <button
            onClick={togglePin}
            disabled={deleting}
            aria-pressed={Boolean(note?.pinned)}
            aria-label={note?.pinned ? "Unpin note" : "Pin note to top"}
            title={note?.pinned ? "Unpin" : "Pin to top"}
            className={`${roundButton} w-10 ${note?.pinned ? "text-[var(--brand-ink)] bg-[var(--brand-soft)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
          >
            <Pin className={`w-4 h-4 ${note?.pinned ? "fill-current" : ""}`} />
          </button>
          <button onClick={remove} disabled={mediaBusy || deleting} aria-label="Delete note" title="Delete" className={`${roundButton} w-10 text-[var(--text-muted)] hover:text-red-600 hover:border-red-200`}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ErrorText>{loadError || error}</ErrorText>
      {status==='error' && <button className={`${roundButton} px-4 text-sm`} onClick={() => {setStatus('saving');void flush();}}>Try saving again</button>}

      <article className={`${cardClass} note-editor p-5 sm:p-8 min-h-[60vh] flex flex-col`}>
        <label className="block">
          <span className="sr-only">Title</span>
          <input
            value={shownTitle}
            disabled={deleting}
            onChange={(e) => edit({ title: e.target.value })}
            maxLength={200}
            placeholder="Title"
            autoFocus={!note?.title && !note?.body}
            className="w-full bg-transparent text-2xl sm:text-3xl font-heading font-bold tracking-tight outline-none placeholder:text-[var(--text-muted)]"
          />
        </label>
        <p className="mt-2 text-[13px] text-[var(--text-secondary)]">
          {note?.updatedAt ? `Edited ${note.updatedAt.toDate().toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}` : "New note"}
        </p>
        <label className="mt-5 flex-1 flex">
          <span className="sr-only">Note</span>
          <textarea
            value={shownBody}
            disabled={deleting}
            onChange={(e) => edit({ body: e.target.value })}
            maxLength={MAX_NOTE_BODY}
            placeholder="Start writing…"
            className="flex-1 w-full min-h-[25vh] bg-transparent text-base leading-relaxed outline-none resize-y placeholder:text-[var(--text-muted)]"
          />
        </label>
        <p className="mt-3 text-right text-[13px] text-[var(--text-secondary)]">
          {shownBody.trim() ? shownBody.trim().split(/\s+/).length : 0} words
        </p>
        {user && <NoteImages key={`${user.uid}:${id}`} uid={user.uid} noteId={id} disabled={deleting} onBusyChange={setMediaBusy}/>}
      </article>
    </div>
  );
}
