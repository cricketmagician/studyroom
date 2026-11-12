"use client";
/* eslint-disable @next/next/no-img-element -- Local blob URLs must stay on the student's device. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, HardDrive, ImagePlus, Trash2 } from 'lucide-react';
import { NoteImageViewer } from './note-image-viewer';
import { addNoteImages, IMAGE_TYPES, imageStorageError, listNoteImages, NoteImage, removeNoteImage } from '@/lib/note-images';
import { formatSize } from '@/lib/files';
import { ErrorText } from './auth-card';
import { pillButton } from './ui';

type Preview = NoteImage & { url: string };
export function NoteImages({ uid, noteId, onBusyChange, disabled=false }: { uid: string; noteId: string; onBusyChange: (busy: boolean) => void; disabled?: boolean }) {
  const [images,setImages] = useState<Preview[] | null>(null);
  const [error,setError] = useState('');
  const [message,setMessage] = useState('');
  const [busy,setBusy] = useState(false);
  const [selected,setSelected] = useState<string | null>(null);
  const [protectedStorage,setProtectedStorage] = useState(false);
  const [dragging,setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const urls = useRef<string[]>([]);
  const working = useRef(false);
  const active = useRef(false);
  const refresh = useCallback(async () => {
    const saved = await listNoteImages(uid,noteId);
    if (!active.current) return;
    urls.current.forEach(url => URL.revokeObjectURL(url));
    const next = saved.map(image => ({...image,url:URL.createObjectURL(image.blob)}));
    urls.current = next.map(image => image.url);
    setImages(next);
  },[uid,noteId]);
  useEffect(() => {
    active.current=true;
    const initial = setTimeout(() => {
      void refresh().catch(e => setError(imageStorageError(e)));
      void navigator.storage?.persisted?.().then(setProtectedStorage).catch(() => {});
    },0);
    const visible = () => { if (document.visibilityState==='visible' && !working.current) void refresh().catch(e => setError(imageStorageError(e))); };
    document.addEventListener('visibilitychange',visible);
    return () => { active.current=false; clearTimeout(initial); document.removeEventListener('visibilitychange',visible); urls.current.forEach(url => URL.revokeObjectURL(url)); };
  },[refresh]);
  async function attach(files: File[]) {
    if (working.current || disabled) return;
    working.current=true; setBusy(true); onBusyChange(true); setError(''); setMessage('');
    try {
      await addNoteImages(uid,noteId,files);
      await refresh();
      if (active.current) setMessage(`${files.length} ${files.length===1 ? 'image' : 'images'} saved on this device.`);
    } catch (e) { if (active.current) setError(imageStorageError(e)); }
    finally { working.current=false; if (active.current) { setBusy(false); onBusyChange(false); } }
  }
  async function remove(image: Preview) {
    if (working.current || disabled || !confirm(`Remove “${image.name}” from this device? Download it first if you need a copy.`)) return;
    working.current=true; setBusy(true); onBusyChange(true); setError(''); setMessage('');
    try { await removeNoteImage(uid,noteId,image.id); await refresh(); setMessage('Image removed from this device.'); }
    catch (e) { setError(imageStorageError(e)); }
    finally { working.current=false; setBusy(false); onBusyChange(false); }
  }
  async function protect() {
    try {
      const granted = await navigator.storage?.persist?.();
      setProtectedStorage(Boolean(granted));
      setMessage(granted ? 'Persistent storage enabled. Keep downloaded copies of important images too.' : 'Your browser did not grant persistent storage. Download important images as backups.');
    } catch (e) { setError(imageStorageError(e)); }
  }
  const preview = images?.find(image => image.id===selected);
  return <section className="mt-6 border-t border-[var(--border-color)] pt-6 space-y-4" aria-labelledby="note-images-title">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="note-images-title" className="!text-xl !mb-1">Photos & screenshots</h2><p className="!text-xs">{images ? `${images.length}/20 images · ${formatSize(images.reduce((sum,image) => sum+image.blob.size,0))} on this device` : 'Opening device storage…'}</p></div><span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-light)] px-3 py-2 text-xs text-[var(--accent)]"><HardDrive size={15}/>Device only</span></div>
    <div className={`rounded-2xl border border-dashed p-6 text-center space-y-3 ${dragging ? 'border-[var(--accent)] bg-[var(--accent-light)]' : 'border-[var(--border-color)] bg-[var(--bg-surface-subtle)]'}`}
      tabIndex={0} aria-label="Photo drop and paste area. Paste a copied screenshot here."
      onDragOver={e => {e.preventDefault();setDragging(true);}}
      onDragLeave={() => setDragging(false)}
      onDrop={e => {e.preventDefault();setDragging(false);void attach(Array.from(e.dataTransfer.files));}}
      onPaste={e => {const files=Array.from(e.clipboardData.files);if(files.length){e.preventDefault();void attach(files);}}}>
      <ImagePlus className="mx-auto text-[var(--accent)]" size={28} aria-hidden="true"/>
      <p className="!text-sm">Drop photos here, or click this area and paste a screenshot.</p>
      <button type="button" disabled={disabled || busy || images===null} onClick={() => input.current?.click()} className={`${pillButton} min-h-11 px-5 text-sm bg-[var(--brand)] text-[var(--on-brand)]`}>{busy ? 'Saving on device…' : 'Add photos'}</button>
      <input ref={input} type="file" accept={IMAGE_TYPES.join(',')} multiple className="hidden" aria-label="Choose note images" onChange={e => {const files=Array.from(e.target.files ?? []);e.target.value='';if(files.length)void attach(files);}}/>
      <p className="!text-xs">JPG, PNG, WebP or GIF · up to 10 MB each · originals kept</p>
    </div>
    <ErrorText>{error}</ErrorText>{error && <button type="button" className={`${pillButton} px-3 min-h-11 text-sm`} onClick={() => {setError('');void refresh().catch(e => setError(imageStorageError(e)));}}>Retry device storage</button>}
    <p role="status" className="!text-xs">{message}</p>
    {images && images.length>0 && <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">{images.map(image => <li key={image.id} className="overflow-hidden rounded-2xl border border-[var(--border-color)]">
      <button type="button" className="block w-full bg-[var(--bg-surface-subtle)]" aria-label={`View ${image.name}`} onClick={() => setSelected(image.id)}><img src={image.url} alt={image.name} className="h-36 sm:h-44 w-full object-contain" loading="lazy"/></button>
      <div className="p-2"><p className="!text-xs truncate" title={image.name}>{image.name}</p><div className="flex items-center justify-between gap-1"><span className="text-[10px] text-[var(--text-muted)]">{formatSize(image.blob.size)}</span><div className="flex"><a href={image.url} download={image.name} aria-label={`Download ${image.name}`} className={`${pillButton} w-11 h-11`}><Download size={16}/></a><button disabled={busy} type="button" aria-label={`Remove ${image.name}`} className={`${pillButton} w-11 h-11 hover:text-red-600`} onClick={() => void remove(image)}><Trash2 size={16}/></button></div></div></div>
    </li>)}</ul>}
    <div className="rounded-xl bg-[var(--accent-light)] p-4 space-y-2"><p className="!text-xs">Text syncs to your account. Images stay in this browser on this device; they are not uploaded or synced. Clearing site data, using private browsing, or changing device/browser can make them unavailable. Download important originals before clearing storage.</p><button type="button" disabled={protectedStorage} className={`${pillButton} min-h-11 px-3 text-xs border border-[var(--border-color)]`} onClick={() => void protect()}>{protectedStorage ? 'Persistent storage enabled' : 'Keep images on this device'}</button></div>
    {preview && <NoteImageViewer key={preview.id} image={preview} onClose={() => setSelected(null)}/>}
  </section>;
}

