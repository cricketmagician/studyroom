"use client";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Pause, Radio } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { postAi } from '@/lib/ai-client';
import { SUBJECTS, duration } from '@/lib/cma';

export function FocusStatus() {
  const { focus } = useAuth();
  const pathname = usePathname();
  const [now, setNow] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pausedId, setPausedId] = useState('');
  useEffect(() => { const id = setInterval(() => setNow(Date.now()),1000); return () => clearInterval(id); }, []);
  if (!focus || focus.id === pausedId || pathname === '/' || pathname === '/login' || pathname === '/register' || pathname?.startsWith('/admin')) return null;
  const seconds = focus.seconds + Math.max(0,Math.min(90,Math.floor((now-focus.last)/1000)));
  return <aside className="cma-focus-status" aria-label="Running focus session">
    <Radio size={18} aria-hidden="true"/>
    <Link href="/"><strong>{SUBJECTS.find(s => s.id === focus.subject)?.name ?? 'Focus session'}</strong><span>{duration(seconds)} · recording focus time</span></Link>
    <button disabled={busy} onClick={async () => {setBusy(true);setError('');try{await postAi('/api/study',{action:'stop',sessionId:focus.id});setPausedId(focus.id);window.dispatchEvent(new Event('studyroom:session'));}catch(e){setError((e as Error).message);}finally{setBusy(false);}}} aria-label="Pause and save study session"><Pause size={18}/></button>
    {error && <span role="alert">{error}</span>}
  </aside>;
}

