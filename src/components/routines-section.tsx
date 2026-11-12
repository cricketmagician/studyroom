"use client";
/* eslint-disable @next/next/no-img-element -- Existing local vector illustration. */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bell, BookOpen, Check, Dumbbell, FilePenLine, Heart, Pencil, Plus, Repeat2, Sparkles, Trash2, X } from 'lucide-react';
import { CATEGORIES, DAYS, occursOn, REMINDERS, REPEATS, Routine, RoutineInput, scheduleLabel, TEMPLATES, timeLabel } from '@/lib/routines';
import { indiaDay } from '@/lib/cma';
import { ErrorText } from './auth-card';
import { useRoutines } from './routines-provider';
import './routines.css';

const ICONS = { Study:BookOpen, 'Exam prep':FilePenLine, Sports:Dumbbell, Health:Heart, Reminder:Bell, Other:Sparkles };
function CategoryIcon({ category }: { category: RoutineInput['category'] }) {
  const Icon = ICONS[category];
  return <span className="routine-category" data-category={category}><Icon size={22} strokeWidth={1.7} aria-hidden="true"/></span>;
}

export function RoutinesSection({ compact = false }: { compact?: boolean }) {
  const { data, error, busy, act, refresh } = useRoutines();
  const [editing, setEditing] = useState<RoutineInput & {id?:string} | null>(null);
  const [view, setView] = useState<'Today' | 'All routines'>('Today');
  const today = data?.day ?? indiaDay();
  const items = [...(data?.items ?? [])].sort((a,b) => a.time.localeCompare(b.time));
  const scheduled = items.filter(r => occursOn(r,today));
  const shown = compact ? scheduled.slice(0,3) : view === 'Today' ? scheduled : items;
  const completed = scheduled.filter(r => data?.done.includes(r.id)).length;
  const openTemplate = (template: typeof TEMPLATES[number]) => setEditing({...template,days:[...template.days],startDate:today});
  async function remove(r: Routine) {
    if (confirm(`Delete “${r.title}” and stop its future reminders?`)) await act({action:'delete',id:r.id}).catch(() => {});
  }
  return <section className={`routine-section ${compact ? 'routine-preview cma-panel' : ''}`} aria-labelledby={compact ? 'home-routines-title' : 'routines-title'}>
    <header className="cma-section-title">
      <div><span className="cma-eyebrow">SMALL HABITS, STEADY PROGRESS</span>
        {compact ? <h2 id="home-routines-title">Your daily rhythm.</h2> : <h1 id="routines-title">Routines</h1>}
        <p>{items.length ? `${completed} of ${scheduled.length} done today · All times in IST` : 'Make room for study, movement and a little time for yourself.'}</p>
      </div>
      {compact ? <Link href="/routines" className="cma-text-button">View all<ArrowRight size={17}/></Link> : <button className="cma-primary" onClick={() => setEditing({...TEMPLATES[0],title:'',startDate:today})}><Plus size={18}/>New routine</button>}
    </header>
    <ErrorText>{error}</ErrorText>
    {error && <button className="cma-text-button" onClick={() => void refresh()}>Try again</button>}
    {!data && !error && <p role="status" className="routine-loading">Loading your routines…</p>}
    {data && <>
      {!compact && !!items.length && <div className="routine-toolbar"><div className="cma-segments" aria-label="Routine view">{(['Today','All routines'] as const).map(v => <button key={v} aria-pressed={view===v} onClick={() => setView(v)}>{v}</button>)}</div><span className="cma-muted">{items.length} routines</span></div>}
      {!!scheduled.length && (compact || view === 'Today') && <progress aria-label="Today's routine completion" value={completed} max={scheduled.length}/>}
      {!!shown.length && <ul className="routine-list">{shown.map(r => {
        const todayRoutine = occursOn(r,today), done = todayRoutine && data.done.includes(r.id);
        return <li key={r.id} className="routine-row" data-done={done}>
          <CategoryIcon category={r.category}/>
          <div className="routine-copy"><strong>{r.title}</strong><span>{timeLabel(r.time)} · {r.minutes} min{!compact && ` · ${scheduleLabel(r)}`}</span>{!compact && r.note && <p>{r.note}</p>}</div>
          {todayRoutine && <button className="routine-check" role="checkbox" aria-checked={done} aria-label={`Mark ${r.title} ${done ? 'not done' : 'done'} today`} disabled={busy} onClick={() => void act({action:'complete',id:r.id,done:!done,day:today}).catch(() => {})}>{done && <Check size={18}/>}</button>}
          {!compact && <div className="routine-actions"><button className="cma-icon-button" aria-label={`Edit ${r.title}`} disabled={busy} onClick={() => setEditing({...r})}><Pencil size={17}/></button><button className="cma-icon-button" aria-label={`Delete ${r.title}`} disabled={busy} onClick={() => void remove(r)}><Trash2 size={17}/></button></div>}
        </li>;
      })}</ul>}
      {items.length > 0 && !shown.length && <div className="routine-rest"><Repeat2 size={27}/><h3>A little breathing room.</h3><p>No routines scheduled for today. Your other routines are saved.</p>{compact ? <Link className="cma-text-button" href="/routines">Manage routines<ArrowRight size={16}/></Link> : <button className="cma-text-button" onClick={() => setView('All routines')}>See all routines</button>}</div>}
      {!items.length && !compact && <div className="routine-empty"><img src="/illustrations/study.svg" alt=""/><div><span className="cma-eyebrow">ONE SMALL BEGINNING</span><h2>No routines yet.</h2><p>Pick a starting point below or make your own. A good routine makes tomorrow a little easier.</p></div></div>}
      {(!items.length || !compact) && <div className="routine-templates"><h3>{compact ? 'Build a daily rhythm' : 'Start with a template'}</h3>{compact && <p>Set it once. Come back to it each day.</p>}<div className="routine-template-grid">{TEMPLATES.slice(0,compact ? 3 : undefined).map(t => <button className="routine-template" key={t.title} onClick={() => openTemplate(t)}><CategoryIcon category={t.category}/><span><strong>{t.title}</strong><small>{scheduleLabel({...t,startDate:today})} · {timeLabel(t.time)}</small></span><Plus size={18} aria-hidden="true"/></button>)}</div>{compact && <Link href="/routines" className="cma-text-button">More templates<ArrowRight size={17}/></Link>}</div>}
      {!compact && <p className="routine-footnote"><Bell size={15} aria-hidden="true"/>Reminders appear while Abhyas is open. Completing a routine does not add study hours—use the focus timer to record those.</p>}
    </>}
    {editing && <RoutineEditor initial={editing} onClose={() => setEditing(null)}/>}
  </section>;
}

function RoutineEditor({ initial, onClose }: { initial: RoutineInput & {id?:string}; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { act, busy } = useRoutines();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  useEffect(() => { dialog.current?.showModal(); }, []);
  function change<K extends keyof RoutineInput>(key: K, value: RoutineInput[K]) { setForm(prev => ({...prev,[key]:value})); }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setError('');
    try { await act({action:'save',id:initial.id,routine:form}); dialog.current?.close(); }
    catch (e) { setError((e as Error).message); }
  }
  return <dialog ref={dialog} className="routine-dialog" aria-labelledby="routine-editor-title" onClose={onClose} onCancel={e => { if (busy) e.preventDefault(); }}>
    <header><div><span className="cma-eyebrow">A LITTLE EVERY DAY</span><h2 id="routine-editor-title">{initial.id ? 'Edit routine' : 'New routine'}</h2></div><button className="cma-icon-button" aria-label="Close routine editor" disabled={busy} onClick={() => dialog.current?.close()}><X size={21}/></button></header>
    <form onSubmit={save}>
      <label>What do you want to do?<input autoFocus required maxLength={100} value={form.title} onChange={e => change('title',e.target.value)} placeholder="e.g. Revise cost accounting"/></label>
      <fieldset><legend>Category</legend><div className="routine-choices categories">{CATEGORIES.map(category => { const Icon=ICONS[category]; return <button key={category} type="button" aria-pressed={form.category===category} onClick={() => change('category',category)}><Icon size={18}/>{category}</button>; })}</div></fieldset>
      <div className="routine-form-pair"><label>Time · IST<input type="time" required value={form.time} onChange={e => change('time',e.target.value)}/></label><label>Duration<select value={form.minutes} onChange={e => change('minutes',Number(e.target.value))}>{[5,15,30,45,60,90,120,180,240,480].map(n => <option key={n} value={n}>{n < 60 ? `${n} min` : `${n/60} hr`}</option>)}</select></label></div>
      <fieldset><legend>Repeat</legend><div className="routine-choices">{REPEATS.map(repeat => <button key={repeat} type="button" aria-pressed={form.repeat===repeat} onClick={() => change('repeat',repeat)}>{repeat}</button>)}</div></fieldset>
      {form.repeat === 'Custom' && <fieldset><legend>On these days</legend><div className="routine-choices days">{DAYS.map((day,index) => <button type="button" key={day} aria-pressed={form.days.includes(index)} onClick={() => change('days',form.days.includes(index) ? form.days.filter(d=>d!==index) : [...form.days,index])}>{day}</button>)}</div></fieldset>}
      <label>{form.repeat==='Once' ? 'Date' : 'Starts on'}<input type="date" required value={form.startDate} onChange={e => change('startDate',e.target.value)}/></label>
      <fieldset><legend>Remind me before it starts</legend><div className="routine-choices reminders">{REMINDERS.map(n => <button type="button" key={n} aria-pressed={form.reminder===n} onClick={() => change('reminder',n)}>{n===0 ? 'On time' : n===60 ? '1 hr' : `${n} min`}</button>)}</div><p className="routine-hint">In-app reminders · keep Abhyas open to see them.</p></fieldset>
      <label>Note <span className="cma-muted">(optional)</span><textarea rows={3} maxLength={1000} value={form.note} onChange={e => change('note',e.target.value)} placeholder="Chapter 4, practice questions, bring your notebook…"/></label>
      <ErrorText>{error}</ErrorText><button className="cma-primary routine-save" type="submit" disabled={busy}>{busy ? 'Saving…' : initial.id ? 'Save changes' : 'Add routine'}</button>
    </form>
  </dialog>;
}
