"use client";

// These tiles only render after sign-in (client side), so reading localStorage in useState is safe.
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CirclePlay, Clock, FileText, Pause, Play, RotateCcw, Sparkles } from "lucide-react";
import { Material } from "@/lib/materials";
import { dayKey, recordVisit, Streak, weekKeys } from "@/lib/streak";
import { MaterialIcon } from "@/components/material-icon";
import { cardClass, pillButton } from "@/components/ui";

const STREAK_KEY = "studyroom_streak";
export const LAST_OPENED_KEY = "studyroom_last_opened";

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

/** Called by the viewer so the library can offer "continue where you left off". */
export function rememberOpened(id: string) {
  writeJson(LAST_OPENED_KEY, id);
}

const tile = `${cardClass} p-5`;

function TileHeader({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-8 h-8 rounded-full bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center shrink-0">{icon}</span>
      <div>
        <h3 className="font-heading font-bold text-sm leading-tight">{title}</h3>
        <p className="text-[11px] text-[var(--text-muted)]">{sub}</p>
      </div>
    </div>
  );
}

export function StatTiles({ items }: { items: Material[] }) {
  const [weekAgo] = useState(() => Date.now() - 7 * 24 * 60 * 60 * 1000);
  const stats = [
    { label: "PDFs", value: items.filter((m) => m.type === "pdf").length, icon: <FileText className="w-4 h-4" /> },
    { label: "Videos", value: items.filter((m) => m.type === "video").length, icon: <CirclePlay className="w-4 h-4" /> },
    { label: "New this week", value: items.filter((m) => !m.createdAt || m.createdAt.toMillis() > weekAgo).length, icon: <Sparkles className="w-4 h-4" /> },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <div key={s.label} className={`${cardClass} p-4`}>
          <span className="w-8 h-8 rounded-full bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">{s.icon}</span>
          <p className="mt-3 text-3xl font-heading font-black tracking-tight">{s.value}</p>
          <p className="text-xs text-[var(--text-secondary)] leading-tight">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

export function ContinueTile({ items }: { items: Material[] }) {
  const [lastId] = useState(() => readJson<string>(LAST_OPENED_KEY));
  const m = items.find((i) => i.id === lastId);
  if (!m) return null;
  return (
    <Link
      href={`/learn/${m.id}`}
      className={`${tile} group flex items-center gap-4 hover:border-[var(--border-color)] transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-color)]`}
    >
      <span className="shrink-0 w-12 h-12 rounded-2xl bg-[#111110] text-white dark:bg-white dark:text-[#111110] flex items-center justify-center">
        <MaterialIcon type={m.type} className="w-5 h-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">Continue where you left off</span>
        <span className="block font-heading font-bold truncate mt-0.5">{m.title}</span>
      </span>
      <span className={`${pillButton} shrink-0 h-9 px-4 text-xs bg-[var(--accent)] text-white group-hover:bg-[var(--accent-hover)]`}>
        {m.type === "pdf" ? "Read" : "Watch"} <ArrowRight className="w-3.5 h-3.5" />
      </span>
    </Link>
  );
}

const FOCUS_SECONDS = 25 * 60;

export function FocusTimer() {
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

  return (
    <div className={`${tile} flex flex-col justify-between gap-4`}>
      <div className="flex items-center justify-between gap-2">
        <TileHeader icon={<Clock className="w-4 h-4" />} title="Focus timer" sub="25 minutes of study" />
        {running && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Focusing
          </span>
        )}
      </div>

      <p className="font-heading font-black tracking-tight text-4xl" role="timer" aria-live="off">
        {done ? <span className="text-2xl">Time for a break! ☕</span> : <>{mm}<span className="text-[var(--accent)]">:{ss}</span></>}
      </p>

      <div className="flex gap-2">
        {!done && (
          <button
            onClick={() => setRunning(!running)}
            className={`${pillButton} h-9 px-4 text-xs ${running ? "bg-[#111110] text-white dark:bg-white dark:text-[#111110]" : "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white"}`}
          >
            {running ? <><Pause className="w-3.5 h-3.5 fill-current" /> Pause</> : <><Play className="w-3.5 h-3.5 fill-current" /> {left === FOCUS_SECONDS ? "Start" : "Resume"}</>}
          </button>
        )}
        <button
          onClick={() => { setRunning(false); setLeft(FOCUS_SECONDS); }}
          disabled={left === FOCUS_SECONDS}
          aria-label="Reset timer"
          title="Reset"
          className={`${pillButton} h-9 ${done ? "px-4 text-xs bg-[var(--accent)] text-white" : "w-9 border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
        >
          <RotateCcw className="w-3.5 h-3.5" /> {done && "Start again"}
        </button>
      </div>
    </div>
  );
}

export function StreakTile() {
  const [streak] = useState<Streak>(() => recordVisit(readJson<Streak>(STREAK_KEY), new Date()));
  useEffect(() => writeJson(STREAK_KEY, streak), [streak]);

  const today = dayKey(new Date());
  const week = weekKeys(new Date());

  return (
    <div className={`${tile} flex flex-col justify-between gap-4`}>
      <TileHeader icon={<span className="text-sm">🔥</span>} title="Study streak" sub="Days in a row you opened Studyroom" />
      <p className="flex items-baseline gap-2">
        <span className="text-4xl font-heading font-black tracking-tight">{streak.count}</span>
        <span className="text-sm text-[var(--text-secondary)]">{streak.count === 1 ? "day" : "days"}</span>
      </p>
      <ol className="flex justify-between" aria-label="This week">
        {week.map((k, i) => {
          const visited = streak.days.includes(k);
          return (
            <li key={k} className="flex flex-col items-center gap-1">
              <span className={`text-[10px] font-semibold ${k === today ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>{"MTWTFSS"[i]}</span>
              <span
                aria-label={visited ? "studied" : "not studied"}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                  visited ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-surface-subtle)] text-[var(--text-muted)]"
                }`}
              >
                {visited ? "✓" : ""}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
