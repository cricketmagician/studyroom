"use client";

// These widgets only render after sign-in (client side), so reading localStorage in useState is safe.
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Pause, Play, RotateCcw, X } from "lucide-react";
import { Material } from "@/lib/materials";
import type { Entry } from "@/lib/hooks";
import { dayKey, recordVisit, Streak, weekKeys } from "@/lib/streak";
import { MaterialIcon } from "@/components/material-icon";
import { cardClass, pillButton } from "@/components/ui";

const STREAK_KEY = "studyroom_streak";
const LAST_OPENED_KEY = "studyroom_last_opened";

function readJson<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null");
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/** Called by the viewer so the home page can offer "continue where you left off". */
export function rememberOpened(id: string) {
  writeJson(LAST_OPENED_KEY, id);
}

/** Records today's visit and returns the streak. */
export function useStreak() {
  const [streak] = useState<Streak>(() => recordVisit(readJson<Streak>(STREAK_KEY), new Date()));
  useEffect(() => writeJson(STREAK_KEY, streak), [streak]);
  return streak;
}

function Progress({ percent, done, total }: { percent: number; done: number; total: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  return (
    <span className="inline-flex items-center gap-2.5" role="img" aria-label={`${done} of ${total} files done`}>
      <svg viewBox="0 0 44 44" className="w-11 h-11 -rotate-90 shrink-0" aria-hidden>
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
        <circle cx="22" cy="22" r={r} fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * percent) / 100} className="transition-all duration-700" />
      </svg>
      <span className="leading-tight">
        <span className="block text-sm font-heading font-black text-white">{percent}%</span>
        <span className="block text-[11px] text-white/60">{done} of {total} done</span>
      </span>
    </span>
  );
}

/**
 * The one thing to do next: the file you were reading (if unfinished), else the newest unfinished file.
 * Also carries overall progress, so the home page needs no separate progress card.
 */
export function UpNextHero({ items, entries }: { items: Material[]; entries: Record<string, Entry> }) {
  const [lastId] = useState(() => readJson<string>(LAST_OPENED_KEY));
  const done = items.filter((m) => entries[m.id]?.done).length;
  const percent = items.length ? Math.round((done / items.length) * 100) : 0;
  const last = items.find((m) => m.id === lastId && !entries[m.id]?.done);
  const next = last ?? items.find((m) => !entries[m.id]?.done);

  const label = !items.length ? "Welcome" : !next ? "All caught up" : last ? "Continue where you left off" : "Up next";

  return (
    <section className="relative overflow-hidden rounded-[32px] bg-[#1C1917] text-white shadow-lg">
      {/* Photo fades into the card from the left: no hard edge, no grey veil over the face. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- static decorative photo */}
      <img
        src="/student-study.jpg"
        alt=""
        className="absolute inset-y-0 right-0 h-full w-[62%] sm:w-[55%] object-cover object-[center_22%] [mask-image:linear-gradient(to_right,transparent,black_45%)]"
      />
      <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#1C1917]/60 to-transparent" />

      <div className="relative p-6 sm:p-8 flex flex-col gap-6 min-h-[260px]">
        <span className="self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold uppercase tracking-wider text-white/85">
          {label}
        </span>

        <div className="mt-auto max-w-[80%] sm:max-w-[58%]">
          {next ? (
            <>
              <p className="flex items-center gap-2 text-xs text-white/60">
                <MaterialIcon type={next.type} className="w-3.5 h-3.5" /> {next.type === "pdf" ? "PDF" : "Video"} · {next.teacherName}
              </p>
              <h2 className="mt-1.5 text-2xl sm:text-3xl font-heading font-black tracking-tight leading-tight line-clamp-2">{next.title}</h2>
              <div className="mt-5 flex items-center gap-4">
              <Link
                href={`/learn/${next.id}`}
                className={`${pillButton} h-11 px-5 text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white`}
              >
                {next.type === "pdf" ? "Start reading" : "Start watching"} <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
              <Progress percent={percent} done={done} total={items.length} />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight leading-tight">
                {items.length ? "You've finished every file 🎉" : "No files yet"}
              </h2>
              <p className="mt-1.5 text-sm text-white/60">
                {items.length ? "Great work. New uploads from your teacher will show up here." : "When your teacher uploads a PDF or video, it will show up here."}
              </p>
              {items.length > 0 && <div className="mt-5"><Progress percent={percent} done={done} total={items.length} /></div>}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

const FOCUS_SECONDS = 25 * 60;

function FocusTimer() {
  const [left, setLeft] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const done = left === 0;
  const untouched = left === FOCUS_SECONDS;

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold text-[var(--text-secondary)]">
          Focus timer {running && <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse align-middle" aria-label="running" />}
        </p>
        <p className="mt-1 font-heading font-black tracking-tight text-3xl tabular-nums" role="timer">
          {done ? "Break time ☕" : <>{mm}<span className="text-[var(--text-muted)]">:{ss}</span></>}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {!untouched && (
          <button
            onClick={() => { setRunning(false); setLeft(FOCUS_SECONDS); }}
            aria-label="Reset timer"
            title="Reset"
            className={`${pillButton} w-10 h-10 border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
        {!done && (
          <button
            onClick={() => setRunning(!running)}
            aria-label={running ? "Pause timer" : "Start 25 minute focus timer"}
            className={`${pillButton} w-12 h-12 ${running ? "bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] border border-[var(--border-color)]" : "bg-[#111110] text-white dark:bg-white dark:text-[#111110]"}`}
          >
            {running ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
        )}
      </div>
    </div>
  );
}

function WeekDots({ streak }: { streak: Streak }) {
  const today = dayKey(new Date());
  return (
    <ol className="flex justify-between gap-1" aria-label="This week">
      {weekKeys(new Date()).map((k, i) => {
        const visited = streak.days.includes(k);
        const missed = !visited && k < today; // YYYY-MM-DD strings sort by date
        return (
          <li key={k} className="flex flex-col items-center gap-1.5">
            <span
              aria-label={visited ? "studied" : missed ? "missed" : "coming up"}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                visited
                  ? "bg-[var(--accent)] text-white"
                  : missed
                    ? "text-[var(--text-muted)] border border-dashed border-[var(--border-color)]"
                    : "bg-[var(--bg-surface-subtle)]"
              } ${k === today ? "ring-2 ring-offset-2 ring-offset-[var(--bg-surface)] ring-[var(--accent)]" : ""}`}
            >
              {visited ? "✓" : missed ? <X className="w-3 h-3" strokeWidth={3} aria-hidden /> : ""}
            </span>
            <span className={`text-[10px] font-semibold ${k === today ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>{"MTWTFSS"[i]}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** One calm card for today's study habits: focus timer and this week's streak. */
export function TodayCard({ streak }: { streak: Streak }) {
  return (
    <section className={`${cardClass} p-5 sm:p-6`} aria-label="Today">
      <div className="grid sm:grid-cols-2 gap-5 sm:gap-8">
        <FocusTimer />
        <div className="border-t sm:border-t-0 sm:border-l border-[var(--border-subtle)] pt-5 sm:pt-0 sm:pl-8">
          <WeekDots streak={streak} />
        </div>
      </div>
    </section>
  );
}
