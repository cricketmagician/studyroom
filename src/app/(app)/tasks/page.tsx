"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CalendarBlank as CalendarDays, Check, CaretDown as ChevronDown, ListChecks as ListTodo, Play, Plus, SlidersHorizontal as Settings2, Sparkle as Sparkles, Trash as Trash2, X } from "@phosphor-icons/react";
import { RequireRole, useAuth } from "@/lib/auth";
import { friendlyError } from "@/lib/firebase/errors";
import { addTask, deleteTask, updateTask, useTasks } from "@/lib/hooks";
import { dayKey } from "@/lib/streak";
import { GROUP_LABELS, groupTasks, parseQuickTask, Task, TaskGroup } from "@/lib/tasks";
import { ErrorText } from "@/components/auth-card";
import { TINTS } from "@/components/subject-library";
import { postAi } from "@/lib/ai-client";
import { DEFAULT_GOAL_MINUTES, duration, examTerms, indiaDay, SUBJECTS } from "@/lib/cma";
import { daysBetween, DayPlan, examDate, PLAN_LENGTHS, PlanSetup } from "@/lib/planner";
import { haptic } from "@/lib/haptics";
import { cardClass, PageTitle, pillButton } from "@/components/ui";

export default function TasksPage() {
  return (
    <RequireRole>
      <Tasks />
    </RequireRole>
  );
}

function prettyDue(due: string, today: string) {
  const d = new Date(`${due}T00:00:00`);
  const diff = Math.round((d.getTime() - new Date(`${today}T00:00:00`).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: diff > 0 && diff < 7 ? "short" : undefined, day: "numeric", month: "short" });
}

const GROUP_STYLE: Record<TaskGroup, string> = {
  overdue: "text-red-600 dark:text-red-400",
  today: "text-[var(--accent)]",
  upcoming: "text-[var(--text-secondary)]",
  someday: "text-[var(--text-secondary)]",
  done: "text-[var(--text-muted)]",
};

function TaskRow({ task, group, today, onError }: { task: Task; group: TaskGroup; today: string; onError: (e: unknown) => void }) {
  const { user } = useAuth();
  if (!user) return null;
  const toggle = () => updateTask(user.uid, task.id, { done: !task.done }).catch(onError);
  const remove = () => deleteTask(user.uid, task.id).catch(onError);

  return (
    <li className="group flex items-center gap-3 px-3 py-3 min-h-16">
      <button
        onClick={toggle}
        role="checkbox"
        aria-checked={task.done}
        aria-label={`Mark "${task.title}" as ${task.done ? "not done" : "done"}`}
        className={`${pillButton} shrink-0 w-11 h-11 text-[var(--accent)] hover:bg-[var(--accent-light)]`}
      >
        <span className={`flex h-6 w-6 items-center justify-center rounded-md border-2 ${
          task.done ? "bg-emerald-600 border-emerald-600 text-white" : "border-[var(--border-color)] hover:border-emerald-500 text-transparent hover:text-emerald-500"
        }`}>
          <Check className="w-4 h-4" strokeWidth={3} aria-hidden />
        </span>
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium break-words ${task.done ? "line-through text-[var(--text-muted)]" : ""}`}>{task.title}</p>
        {task.due && (
          <p className={`mt-0.5 inline-flex items-center gap-1 text-xs font-semibold ${GROUP_STYLE[group]}`}>
            <CalendarDays className="w-3 h-3" aria-hidden /> {prettyDue(task.due, today)}
          </p>
        )}
      </div>
      <button
        onClick={remove}
        aria-label={`Delete "${task.title}"`}
        title="Delete"
        className={`${pillButton} shrink-0 w-11 h-11 text-[var(--text-secondary)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </li>
  );
}

type Detail = { state: { level?: string; dailyGoalMinutes?: number; targetExam?: string }; daily: { day: string; seconds: number; subjects?: Record<string, number> }[] };
type SavedPlan = { setup: PlanSetup; days: DayPlan[]; tip: string | null; source: "ai" | "auto"; createdAt: number };
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const GOALS = [90, 150, 240, 360];
const MAKING_STEPS = ["Reading your syllabus", "Checking what you studied lately", "Giving hard papers more time", "Writing your days, chapter by chapter"];
const dayLabel = (day: string, opts: Intl.DateTimeFormatOptions) => new Date(`${day}T12:00:00Z`).toLocaleDateString("en-IN", { ...opts, timeZone: "UTC" });

/** Set up once (goal, exam, weak papers, rest days), then AI writes a 7, 15 or 30 day plan. Blocks tick themselves off as the timer records time. */
function AutoPlan({ onPlan }: { onPlan: (plan: SavedPlan | null) => void }) {
  const { profile } = useAuth();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [plan, setPlan] = useState<SavedPlan | null | undefined>(undefined);
  const [failed, setFailed] = useState("");
  const [making, setMaking] = useState(false);
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(7);
  const [today] = useState(() => indiaDay(Date.now()));
  const sheet = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<PlanSetup>({ goalMinutes: DEFAULT_GOAL_MINUTES, examTerm: examTerms()[0], weak: [], restDays: [0], days: 7 });

  useEffect(() => {
    postAi<Detail>("/api/study", { action: "detail" }).then(setDetail).catch((e) => setFailed((e as Error).message));
    postAi<{ plan: SavedPlan | null }>("/api/ai/plan", { action: "get" }).then((r) => setPlan(r.plan)).catch((e) => { setPlan(null); setFailed((e as Error).message); });
  }, []);

  useEffect(() => {
    if (!making) return;
    const first = setTimeout(() => setStep(0), 0);
    const every = setInterval(() => setStep((n) => Math.min(n + 1, MAKING_STEPS.length - 1)), 2200);
    return () => { clearTimeout(first); clearInterval(every); };
  }, [making]);

  useEffect(() => { if (plan !== undefined) onPlan(plan); }, [plan, onPlan]);

  const level = detail?.state.level ?? profile?.level ?? "Intermediate";
  const papers = SUBJECTS.filter((x) => x.level === level);
  const tint = (id: string) => TINTS[Math.max(0, papers.findIndex((x) => x.id === id)) % TINTS.length];
  const openSetup = () => {
    setForm(plan?.setup ?? { goalMinutes: detail?.state.dailyGoalMinutes ?? DEFAULT_GOAL_MINUTES, examTerm: detail?.state.targetExam ?? examTerms()[0], weak: [], restDays: [0], days: 7 });
    sheet.current?.showModal();
  };
  const toggle = (list: "weak" | "restDays", value: string | number) => setForm((f) => {
    const has = (f[list] as (string | number)[]).includes(value);
    if (!has && list === "restDays" && f.restDays.length >= 2) return f;
    haptic();
    return { ...f, [list]: has ? (f[list] as (string | number)[]).filter((v) => v !== value) : [...f[list], value] };
  });
  const make = async (e: React.FormEvent) => {
    e.preventDefault();
    setMaking(true); setFailed("");
    try {
      const r = await postAi<{ plan: SavedPlan }>("/api/ai/plan", { action: "make", setup: form });
      setPlan(r.plan); setShow(Math.min(7, r.plan.setup.days)); haptic("success"); sheet.current?.close();
    } catch (err) { haptic("warning"); setFailed((err as Error).message); }
    finally { setMaking(false); }
  };

  const setupSheet = (
    <dialog ref={sheet} className="profile-sheet" aria-labelledby="plan-setup-title">
      {making && (
        <div className="plan-making" role="status" aria-live="polite">
          {/* eslint-disable-next-line @next/next/no-img-element -- Supplied local vector illustration. */}
          <img src="/illustrations/doodles/character-talking-to-robot-chatbot.svg" alt="" className="doodle" />
          <h2>Making your {form.days}-day plan</h2>
          <ol>{MAKING_STEPS.map((t, i) => <li key={t} data-state={i < step ? "done" : i === step ? "now" : undefined}><span>{i < step ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : null}</span>{t}</li>)}</ol>
          <div className="plan-making-bar" aria-hidden="true"><span /></div>
          <p>Usually takes 10 to 20 seconds.</p>
        </div>
      )}
      <form onSubmit={make} hidden={making}>
        <header><h2 id="plan-setup-title">Set up your plan</h2><button type="button" aria-label="Close" onClick={() => sheet.current?.close()}><X size={20} /></button></header>
        <fieldset><legend>How long can you study each day?</legend><div className="profile-chips">{GOALS.map((g) => <label key={g}><input type="radio" name="goal" checked={form.goalMinutes === g} onChange={() => setForm({ ...form, goalMinutes: g })} />{duration(g * 60).replace(" 0m", "")}</label>)}</div></fieldset>
        <label>Exam you are writing<select value={form.examTerm} onChange={(e) => setForm({ ...form, examTerm: e.target.value })}>{[...new Set([form.examTerm, ...examTerms()])].map((t) => <option key={t}>{t}</option>)}</select></label>
        <fieldset><legend>Which papers feel hard? AI gives them more time.</legend><div className="profile-chips">{papers.map((x) => <label key={x.id}><input type="checkbox" checked={form.weak.includes(x.id)} onChange={() => toggle("weak", x.id)} />P{x.id} · {x.name.split(" ").slice(0, 3).join(" ").replace(/ (and|&)$/, "")}</label>)}</div></fieldset>
        <fieldset><legend>Rest days (up to 2)</legend><div className="profile-chips">{WEEKDAYS.map((d, i) => <label key={d}><input type="checkbox" checked={form.restDays.includes(i)} onChange={() => toggle("restDays", i)} />{d}</label>)}</div></fieldset>
        <fieldset><legend>Plan for</legend><div className="cma-segments plan-length">{PLAN_LENGTHS.map((n) => <button type="button" key={n} aria-pressed={form.days === n} onClick={() => setForm({ ...form, days: n })}>{n} days</button>)}</div></fieldset>
        {failed && <p role="alert" className="profile-note profile-error">{failed}</p>}
        <button type="submit" className="cma-primary" disabled={making}><Sparkles size={18} aria-hidden="true" />{making ? "AI is making your plan…" : plan ? "Make a new plan" : "Make my plan"}</button>
      </form>
    </dialog>
  );

  if (plan === undefined || !detail) return <>{failed ? <ErrorText>{failed}</ErrorText> : <p className="cma-loading">Loading your plan…</p>}{setupSheet}</>;

  if (!plan) return (
    <>
      <section className="plan-intro">
        {/* eslint-disable-next-line @next/next/no-img-element -- Supplied local vector illustration. */}
        <img src="/illustrations/doodles/person-working-on-laptop.svg" alt="" className="doodle" />
        <div>
          <span className="cma-eyebrow"><Sparkles size={14} aria-hidden="true" />AI study plan</span>
          <h2>Tell us 4 things. AI plans your next 7, 15 or 30 days.</h2>
          <p>Your daily time, exam, hard papers and rest days. Every day you get papers, chapters and one clear task. Press Start and it ticks off by itself.</p>
          <button type="button" className="cma-primary" onClick={openSetup}><Sparkles size={18} aria-hidden="true" />Set up my plan</button>
        </div>
      </section>
      {setupSheet}
    </>
  );

  const doneToday = detail.daily.find((d) => d.day === today)?.subjects ?? {};
  const todayPlan = plan.days.find((d) => d.day === today);
  const ahead = plan.days.filter((d) => d.day > today);
  const exam = examDate(plan.setup.examTerm);
  const daysLeft = exam ? daysBetween(today, exam) : null;
  const todayGoal = todayPlan?.blocks.reduce((sum, b) => sum + b.minutes, 0) ?? 0;
  const todayDone = todayPlan?.blocks.reduce((sum, b) => sum + Math.min(b.minutes, Math.floor((doneToday[b.subjectId] ?? 0) / 60)), 0) ?? 0;
  const endsOn = plan.days.at(-1)?.day;

  return (
    <>
      <section className="plan-facts" aria-label="Your plan">
        <div><strong>{daysLeft !== null && daysLeft >= 0 ? daysLeft : "—"}</strong><span>days to the {plan.setup.examTerm.replace(" Term", "")} exam</span></div>
        <div><strong>{duration(plan.setup.goalMinutes * 60)}</strong><span>study a day</span></div>
        <div><strong>{plan.setup.days}</strong><span>day plan{endsOn ? `, till ${dayLabel(endsOn, { day: "numeric", month: "short" })}` : ""}</span></div>
        <button type="button" className="plan-edit" onClick={openSetup}><Settings2 size={15} aria-hidden="true" />Change setup or make a new plan</button>
      </section>
      {plan.tip && (
        <section className="plan-coach" aria-label="Tip from your AI coach">
          {/* eslint-disable-next-line @next/next/no-img-element -- Supplied local vector illustration. */}
          <img src="/illustrations/doodles/person-skydiving-with-parachute.svg" alt="" className="doodle" />
          <div>
            <span className="cma-eyebrow"><Sparkles size={14} aria-hidden="true" />Your AI coach</span>
            <p>{plan.tip}</p>
            <small>Plan made {new Date(plan.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {plan.setup.weak.length ? `Extra time for Paper ${plan.setup.weak.join(", ")}` : "Balanced across all papers"}</small>
          </div>
        </section>
      )}
      {plan.source === "auto" && <p className="plan-tip"><Settings2 size={16} aria-hidden="true" />AI was busy, so we made this plan from your study history. Try &quot;Make a new plan&quot; later for an AI plan.</p>}

      <section className="plan-today" aria-labelledby="plan-today-title">
        <header>
          {todayPlan && (!todayPlan.blocks.length || todayDone >= todayGoal) && (
            // eslint-disable-next-line @next/next/no-img-element -- Supplied local vector illustration.
            <img className="plan-today-art doodle" alt="" src={todayPlan.blocks.length ? "/illustrations/doodles/person-using-smartphone-successfully.svg" : "/illustrations/doodles/character-running-with-kite.svg"} />
          )}
          <div><h2 id="plan-today-title">Today</h2><p>{!todayPlan ? "Your plan has ended. Make a new one." : !todayPlan.blocks.length ? "Rest day. Relax, and come back fresh tomorrow." : todayDone >= todayGoal ? "All done for today. Well done!" : `${todayDone} of ${todayGoal} minutes done. Press Start, and it ticks itself off.`}</p></div>
          {!!todayGoal && <progress value={todayDone} max={todayGoal} aria-label="Today's plan done" />}
        </header>
        {!!todayPlan?.blocks.length && <ol>
          {todayPlan.blocks.map((b, i) => {
            const doneMin = Math.floor((doneToday[b.subjectId] ?? 0) / 60);
            const finished = doneMin >= b.minutes;
            return (
              <li key={b.subjectId} data-done={finished ? "" : undefined} style={{ "--i": i } as React.CSSProperties}>
                <span className="subject-cover tint" data-tint={tint(b.subjectId)} aria-hidden="true"><small>Paper</small>{b.subjectId}</span>
                <div className="plan-what">
                  <b>{b.name}</b>
                  <span>{b.chapter}</span>
                  <small>{finished ? `Done · ${doneMin} min` : doneMin ? `${doneMin} of ${b.minutes} min` : b.reason}</small>
                </div>
                {finished ? <span className="plan-check" aria-label="Done"><Check size={20} strokeWidth={3} /></span>
                  : <Link href={`/?startPaper=${b.subjectId}`} className="cma-primary plan-start"><Play size={15} aria-hidden="true" />{b.minutes} min</Link>}
              </li>
            );
          })}
        </ol>}
      </section>

      {!!ahead.length && <section aria-labelledby="plan-ahead-title">
        <div className="plan-ahead-head">
          <h2 id="plan-ahead-title" className="profile-group-title">Coming up</h2>
          {ahead.length > 7 && <div className="cma-segments" aria-label="Show">{PLAN_LENGTHS.filter((n) => n <= plan.setup.days).map((n) => <button type="button" key={n} aria-pressed={show === n} onClick={() => setShow(n)}>{n} days</button>)}</div>}
        </div>
        <ul className="plan-days">
          {ahead.slice(0, show - 1).map((d, i) => (
            <li key={d.day} data-rest={d.blocks.length ? undefined : ""} style={{ "--i": i } as React.CSSProperties}>
              <span className="plan-date"><b>{dayLabel(d.day, { weekday: "short" })}</b><small>{dayLabel(d.day, { day: "numeric", month: "short" })}</small></span>
              {d.blocks.length ? <span className="plan-day-blocks">{d.blocks.map((b) => <span key={b.subjectId}><i className="tint" data-tint={tint(b.subjectId)}>P{b.subjectId}</i><span>{b.chapter}</span><em>{b.minutes}m</em></span>)}</span> : <span className="plan-rest">Rest day</span>}
            </li>
          ))}
        </ul>
      </section>}
      {setupSheet}
    </>
  );
}

function Tasks() {
  const { user } = useAuth();
  const { items, error } = useTasks();
  const [today] = useState(() => dayKey(new Date()));
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [showDone, setShowDone] = useState(false);
  const [plan, setPlan] = useState<SavedPlan | null>(null);
  const parsed = parseQuickTask(title, today);

  const onError = (err: unknown) => setActionError(friendlyError(err));
  const groups = groupTasks(items ?? [], today);
  const open = (items ?? []).filter((t) => !t.done).length;
  const doneToday = groups.done.length;

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;
    setBusy(true);
    setActionError("");
    try {
      await addTask(user.uid, parsed.title, due || parsed.due);
      haptic("success");
      setTitle("");
      setDue("");
    } catch (err) {
      onError(err);
    }
    setBusy(false);
  };


  // One-tap ideas from the study plan and exam date, so the list fills itself. Ones already on the list are hidden.
  const nextDay = (weekday: number) => { const d = new Date(`${today}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + ((weekday - d.getUTCDay() + 7) % 7 || 7)); return d.toISOString().slice(0, 10); };
  const examIn = plan ? daysBetween(today, examDate(plan.setup.examTerm) ?? today) : null;
  const ideas = [
    ...(plan?.days.filter((d) => d.day >= today && d.blocks.length).slice(0, 2).map((d) => ({ title: `Make short notes: ${d.blocks[0].chapter.split(":")[0]}`, due: d.day })) ?? []),
    ...(plan?.setup.weak.slice(0, 1).map((id) => ({ title: `Solve a past exam paper: Paper ${id}`, due: nextDay(plan.setup.restDays.includes(0) ? 6 : 0) })) ?? []),
    ...(examIn !== null && examIn <= 45 ? [{ title: "Full 3-hour mock test", due: nextDay(0) }] : []),
    { title: "Make a 1-page formula sheet", due: nextDay(6) },
    { title: "Revise this week's chapters", due: nextDay(0) },
  ].filter((x, i, all) => all.findIndex((y) => y.title === x.title) === i && !(items ?? []).some((t) => t.title.toLowerCase() === x.title.toLowerCase())).slice(0, 4);
  const addIdea = (idea: { title: string; due: string }) => { if (!user) return; haptic("success"); addTask(user.uid, idea.title, idea.due).catch(onError); };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <PageTitle title="Study plan" sub="AI plans your days from your goal, exam date, hard papers and what you studied lately." />
      </div>

      <AutoPlan onPlan={setPlan} />

      <h2 className="profile-group-title">Your to-do list</h2>
      <form onSubmit={add} className={`${cardClass} p-3 space-y-3`}>
        <div className="flex items-center gap-2">
          <label className="flex-1">
            <span className="sr-only">New task</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="Type a task, like Mock test on Sunday"
              className="w-full h-12 px-3 bg-transparent text-base outline-none placeholder:text-[var(--text-muted)]"
            />
          </label>
          <button type="submit" disabled={!title.trim() || busy} aria-label="Add task" className={`${pillButton} shrink-0 h-11 px-4 text-sm bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-[var(--on-brand)]`}>
            <Plus className="w-4 h-4" aria-hidden /> <span className="hidden sm:inline">Add</span>
          </button>
        </div>
        <div className="todo-hint">
          {due || parsed.due
            ? <span className="todo-due"><CalendarDays size={14} aria-hidden="true" />Due {prettyDue(due || parsed.due!, today)}{!due && " · from what you typed"}{due && <button type="button" aria-label="Remove due date" onClick={() => setDue("")}><X size={13} /></button>}</span>
            : <span>Tip: write &quot;kal&quot;, &quot;Sunday&quot; or &quot;in 3 days&quot; and the date is set for you.</span>}
          <label className="todo-pick"><CalendarDays size={16} aria-hidden="true" /><span className="sr-only">Pick a due date</span><input type="date" value={due} min={today} onChange={(e) => setDue(e.target.value)} /></label>
        </div>
      </form>

      <ErrorText>{error || actionError}</ErrorText>

      {!!ideas.length && (
        <div className="todo-ideas">
          <span className="cma-eyebrow"><Sparkles size={13} aria-hidden="true" />Add in one tap</span>
          <div>{ideas.map((x, i) => <button type="button" key={x.title} onClick={() => addIdea(x)} style={{ "--i": i } as React.CSSProperties}><Plus size={15} aria-hidden="true" /><span>{x.title}</span><small>{prettyDue(x.due, today)}</small></button>)}</div>
        </div>
      )}

      {items === null && !error && <div role="status" className={`${cardClass} p-8 text-sm text-[var(--text-secondary)]`}>Loading your study plan…</div>}

      {items && items.length === 0 && (
        <div className={`${cardClass} p-8 text-center`}>
          <span className="mx-auto w-14 h-14 rounded-2xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
            <ListTodo className="w-6 h-6" aria-hidden />
          </span>
          <h2 className="mt-4 font-heading font-bold">Nothing extra to do</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Your study plan above is ready. Add anything else here, like a mock test or a form to fill.</p>
        </div>
      )}

      {items && items.length > 0 && open === 0 && (
        <p className="text-center text-sm text-[var(--text-secondary)] py-2">🎉 All done. Nothing left on your list.</p>
      )}

      {(["overdue", "today", "upcoming", "someday"] as const).map((g) =>
        groups[g].length ? (
          <section key={g} className="space-y-2">
            <h2 className={`px-1 text-xs font-bold uppercase tracking-wider ${GROUP_STYLE[g]}`}>
              {GROUP_LABELS[g]} <span className="text-[var(--text-muted)] tabular-nums">{groups[g].length}</span>
            </h2>
            <ul className={`${cardClass} divide-y divide-[var(--border-subtle)] overflow-hidden`}>
              {groups[g].map((t) => <TaskRow key={t.id} task={t} group={g} today={today} onError={onError} />)}
            </ul>
          </section>
        ) : null
      )}

      {doneToday > 0 && (
        <section className="space-y-2">
          <button onClick={() => setShowDone(!showDone)} aria-expanded={showDone} className="flex min-h-11 items-center gap-1.5 px-1 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <ChevronDown className={`w-4 h-4 transition-transform ${showDone ? "" : "-rotate-90"}`} aria-hidden />
            {GROUP_LABELS.done} <span className="tabular-nums">{doneToday}</span>
          </button>
          {showDone && (
            <ul className={`${cardClass} divide-y divide-[var(--border-subtle)] overflow-hidden`}>
              {groups.done.map((t) => <TaskRow key={t.id} task={t} group="done" today={today} onError={onError} />)}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
