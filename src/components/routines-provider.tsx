"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { postAi } from '@/lib/ai-client';
import { dueReminder, RoutineState, timeLabel } from '@/lib/routines';

const Context = createContext<{
  data: RoutineState | null; error: string; busy: boolean;
  act: (body: object) => Promise<void>; refresh: () => Promise<void>;
} | null>(null);

export function useRoutines() {
  const context = useContext(Context);
  if (!context) throw new Error('Routines need a signed-in account.');
  return context;
}

export function RoutinesProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  return user && profile ? <RoutineSession key={user.uid}>{children}</RoutineSession> : children;
}

function RoutineSession({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<RoutineState | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const request = useRef(0);
  const refresh = useCallback(async () => {
    const version = ++request.current;
    try {
      const next = await postAi<RoutineState>('/api/routines', {action:'list'});
      if (request.current === version) { setData(next); setError(''); }
    } catch (e) { if (request.current === version) setError((e as Error).message); }
  }, []);
  useEffect(() => {
    const initial = setTimeout(() => { setNow(Date.now()); void refresh(); }, 0);
    const interval = setInterval(() => {
      setNow(Date.now());
      if (document.visibilityState === 'visible') void refresh();
    }, 60000);
    const visible = () => { if (document.visibilityState === 'visible') { setNow(Date.now()); void refresh(); } };
    document.addEventListener('visibilitychange', visible);
    return () => { clearTimeout(initial); clearInterval(interval); document.removeEventListener('visibilitychange', visible); };
  }, [refresh]);
  async function act(body: object) {
    setBusy(true); setError('');
    ++request.current;
    try {
      const next = await postAi<RoutineState>('/api/routines', body);
      ++request.current;
      setData(next); setNow(Date.now());
    } catch (e) { setError((e as Error).message); throw e; }
    finally { setBusy(false); }
  }
  const reminders = (data?.items ?? []).map(r => ({routine:r,day:dueReminder(r,now)}));
  const alert = reminders.find(({routine:r,day}) => day && !(day === data?.day && data.done.includes(r.id)) && !dismissed.includes(`${day}:${r.id}:${r.time}`));
  return <Context.Provider value={{data,error,busy,act,refresh}}>
    {children}
    {alert && <aside role="status" className="fixed z-50 left-4 right-4 top-4 mx-auto max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 shadow-xl flex items-center gap-3">
      <Bell size={22} className="shrink-0 text-[var(--accent)]" aria-hidden="true"/>
      <Link href="/routines" className="flex-1 min-w-0"><strong className="block break-words">{alert.routine.title}</strong><span className="text-sm text-[var(--text-secondary)]">Coming up at {timeLabel(alert.routine.time)} IST · View routine</span></Link>
      <button aria-label="Dismiss routine reminder" className="w-11 h-11 grid place-items-center shrink-0" onClick={() => setDismissed(prev => [...prev,`${alert.day}:${alert.routine.id}:${alert.routine.time}`])}><X size={20}/></button>
    </aside>}
  </Context.Provider>;
}
