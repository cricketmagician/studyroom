"use client";
/* eslint-disable @next/next/no-img-element -- Local SVG artwork. */
import React, { useEffect, useRef, useState } from "react";
import { updateProfile } from "firebase/auth";
import { ArrowLeft, Check, X } from "@phosphor-icons/react";
import { auth } from "@/lib/firebase/config";
import { DEFAULT_GOAL_MINUTES, examTerms, indiaDay, Level, SUBJECTS } from "@/lib/cma";
import { getSubjectSyllabus } from "@/lib/syllabus-data";
import { daysBetween, examDate } from "@/lib/planner";
import { postAi } from "@/lib/ai-client";
import "./onboarding.css";

interface ProfileSetupModalProps {
  isOpen: boolean;
  initialName?: string;
  onComplete: (data: { name: string; level: Level; dailyGoalMinutes: number }) => void;
  onClose?: () => void;
  canDismiss?: boolean;
}

const GROUPS = [
  { value: "Group 1", emoji: "📘", title: "Group 1", note: "Papers 5 to 8 · Laws, Accounts, Tax, Costing" },
  { value: "Group 2", emoji: "📗", title: "Group 2", note: "Papers 9 to 12 · Ops & Strategy, Audit, FM, MA" },
  { value: "Both Groups", emoji: "📚", title: "Both groups", note: "All 8 papers together" },
];
const ATTEMPTS = [
  { value: "First Attempt", emoji: "🌱", title: "First attempt", note: "Starting fresh. We will build the habit first." },
  { value: "Second Attempt", emoji: "🔁", title: "Second attempt", note: "We will put weak papers first." },
  { value: "Third or More", emoji: "🎯", title: "Third or more", note: "Focused revision and mock tests." },
];
const GOALS = [
  { minutes: 60, emoji: "🙂", title: "1 hour a day", note: "Light" },
  { minutes: 90, emoji: "💪", title: "1.5 hours a day", note: "Steady" },
  { minutes: 150, emoji: "🔥", title: "2.5 hours a day", note: "Recommended", badge: true },
  { minutes: 240, emoji: "🚀", title: "4 hours a day", note: "Intense" },
];
const TINTS = ["blue", "amber", "green", "pink", "violet", "orange"];
const STEPS = 7;
const hours = (m: number) => (m % 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m / 60}h`);

function Option({ selected, onSelect, emoji, title, note, badge, tint }: { selected: boolean; onSelect: () => void; emoji?: string; title: string; note?: string; badge?: string; tint?: string }) {
  return (
    <button type="button" role="radio" aria-checked={selected} className="ob-option" onClick={onSelect}>
      {emoji ? <span className="ob-emoji" aria-hidden="true">{emoji}</span> : <span className="tint ob-num" data-tint={tint} aria-hidden="true">{badge}</span>}
      <span className="ob-option-text"><b>{title}</b>{note && <small>{note}</small>}</span>
      {emoji && badge && <span className="ob-badge">{badge}</span>}
      <span className="ob-check" aria-hidden="true"><Check size={14} weight="bold" /></span>
    </button>
  );
}

function Q({ icon, title, help, headingRef, children }: { icon: string; title: string; help?: string; headingRef: React.RefObject<HTMLHeadingElement | null>; children: React.ReactNode }) {
  return (
    <>
      <span className="ob-icon" aria-hidden="true">{icon}</span>
      <h1 ref={headingRef} tabIndex={-1} id="ob-title">{title}</h1>
      {help && <p className="ob-help">{help}</p>}
      {children}
    </>
  );
}

/** Full-screen, one-question-per-screen profile setup (Nibble / Duolingo pattern). Everything saves once, on the last step. */
export function ProfileSetupModal({ isOpen, initialName = "", onComplete, onClose, canDismiss = false }: ProfileSetupModalProps) {
  const level: Level = "Intermediate";
  const [step, setStep] = useState(1);
  const [back, setBack] = useState(false);
  const [typed, setName] = useState<string | null>(null);
  const name = typed ?? initialName; // the profile name can arrive after the first render
  const [targetExam, setTargetExam] = useState("");
  const [group, setGroup] = useState("");
  const [attempt, setAttempt] = useState("");
  const [primarySubject, setPrimarySubject] = useState("");
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => { heading.current?.focus(); }, [step]);
  useEffect(() => {
    if (!isOpen || !canDismiss || !onClose) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [isOpen, canDismiss, onClose]);
  if (!isOpen) return null;

  const today = indiaDay();
  const daysTo = (term: string) => { const d = examDate(term); return d ? Math.max(0, daysBetween(today, d)) : null; };
  const papers = SUBJECTS.filter((s) => group === "Both Groups" || !group || getSubjectSyllabus(s.id)?.group === group);
  const first = name.trim().split(/\s+/)[0] || "there";
  const valid = [true, !!name.trim(), !!targetExam, !!group, !!attempt, !!primarySubject, !!dailyGoalMinutes, true][step];

  const go = (to: number) => { setBack(to < step); setError(""); setStep(to); };
  const next = () => { if (valid) go(step + 1); };

  const save = async () => {
    setBusy(true); setError("");
    try {
      if (auth.currentUser && name.trim()) await updateProfile(auth.currentUser, { displayName: name.trim() }).catch(() => {});
      await postAi("/api/study", { action: "setup_profile", name: name.trim(), level, dailyGoalMinutes, targetExam, primarySubject, group, attemptCount: attempt });
      onComplete({ name: name.trim(), level, dailyGoalMinutes });
    } catch (err) {
      setError((err as Error).message || "Could not save. Check your internet and try again.");
    } finally { setBusy(false); }
  };

  return (
    <div className="ob" role="dialog" aria-modal="true" aria-labelledby="ob-title">
      {step < STEPS && (
        <header className="ob-top">
          {step > 1 ? <button type="button" className="ob-round" onClick={() => go(step - 1)} aria-label="Back"><ArrowLeft size={18} weight="bold" /></button> : <span className="ob-round-space" />}
          <div className="ob-progress" role="progressbar" aria-label="Setup progress" aria-valuemin={1} aria-valuemax={STEPS - 1} aria-valuenow={step}><span style={{ width: `${(step / (STEPS - 1)) * 100}%` }} /></div>
          {canDismiss && onClose ? <button type="button" className="ob-round" onClick={onClose} aria-label="Close"><X size={18} weight="bold" /></button> : <span className="ob-step">{step}/{STEPS - 1}</span>}
        </header>
      )}

      <main className="ob-body" key={step} data-back={back || undefined}>
        {step === 1 && (
          <Q headingRef={heading} icon="👋" title="What should we call you?" help="Your teacher and study friends will see this name.">
            <form onSubmit={(e) => { e.preventDefault(); next(); }}>
              <input className="ob-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" maxLength={80} autoComplete="name" aria-label="Your full name" autoFocus />
            </form>
          </Q>
        )}

        {step === 2 && (
          <Q headingRef={heading} icon="🗓️" title="Which exam are you writing?" help="We count down to it and plan your days around it.">
            <div className="ob-options" role="radiogroup" aria-label="Exam term">
              {examTerms().map((t, i) => { const d = daysTo(t); return <Option key={t} selected={targetExam === t} onSelect={() => setTargetExam(t)} emoji={["⏳", "📅", "🧭"][i]} title={t.replace(" Term", "")} note={d !== null ? `${d} days to go` : undefined} />; })}
            </div>
          </Q>
        )}

        {step === 3 && (
          <Q headingRef={heading} icon="📚" title="Which group are you preparing?" help="CMA Intermediate has 8 papers in two groups.">
            <div className="ob-options" role="radiogroup" aria-label="Group">
              {GROUPS.map((g) => <Option key={g.value} selected={group === g.value} onSelect={() => { setGroup(g.value); setPrimarySubject(""); }} emoji={g.emoji} title={g.title} note={g.note} />)}
            </div>
          </Q>
        )}

        {step === 4 && (
          <Q headingRef={heading} icon="🎓" title="Which attempt is this?" help="No judgement. It only changes how we plan.">
            <div className="ob-options" role="radiogroup" aria-label="Attempt">
              {ATTEMPTS.map((a) => <Option key={a.value} selected={attempt === a.value} onSelect={() => setAttempt(a.value)} emoji={a.emoji} title={a.title} note={a.note} />)}
            </div>
          </Q>
        )}

        {step === 5 && (
          <Q headingRef={heading} icon="🎯" title="Which paper needs the most work?" help="We will put it first in your plan. You can change it any time.">
            <div className="ob-options ob-papers" role="radiogroup" aria-label="Focus paper">
              {papers.map((s, i) => <Option key={s.id} selected={primarySubject === s.name} onSelect={() => setPrimarySubject(s.name)} badge={s.id} tint={TINTS[i % TINTS.length]} title={s.name} note={getSubjectSyllabus(s.id)?.scoringDifficulty} />)}
            </div>
          </Q>
        )}

        {step === 6 && (
          <Q headingRef={heading} icon="⏱️" title="How much can you study each day?" help="Pick what you can keep up. Small and daily beats big and rare.">
            <div className="ob-options" role="radiogroup" aria-label="Daily goal">
              {GOALS.map((g) => { const d = daysTo(targetExam); return <Option key={g.minutes} selected={dailyGoalMinutes === g.minutes} onSelect={() => setDailyGoalMinutes(g.minutes)} emoji={g.emoji} title={g.title} note={d ? `${g.note} · about ${Math.round((g.minutes * d) / 60)} hours before your exam` : g.note} badge={g.badge ? "Best" : undefined} />; })}
            </div>
          </Q>
        )}

        {step === 7 && (
          <div className="ob-done">
            <span className="ob-confetti" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ "--i": i } as React.CSSProperties} />)}</span>
            <img src="/illustrations/surface/success-victory.svg" alt="" className="ob-done-art" />
            <h1 ref={heading} tabIndex={-1} id="ob-title">You are all set, {first}!</h1>
            <p className="ob-help">Your plan is ready. Study a little every day and watch your streak grow.</p>
            <ul className="ob-summary">
              <li><span>Exam</span><b>{targetExam.replace(" Term", "")}{daysTo(targetExam) !== null && ` · ${daysTo(targetExam)} days`}</b></li>
              <li><span>Group</span><b>{group}</b></li>
              <li><span>Focus paper</span><b>{primarySubject}</b></li>
              <li><span>Daily goal</span><b>{hours(dailyGoalMinutes || DEFAULT_GOAL_MINUTES)}</b></li>
            </ul>
          </div>
        )}
      </main>

      <footer className="ob-foot">
        {error && <p role="alert" className="ob-error">{error}</p>}
        {step < STEPS
          ? <button type="button" className="ob-cta" disabled={!valid} onClick={next}>Continue</button>
          : <button type="button" className="ob-cta" disabled={busy} onClick={save}>{busy ? "Saving…" : "Start studying"}</button>}
        {step === STEPS && <button type="button" className="ob-link" disabled={busy} onClick={() => go(1)}>Change my answers</button>}
      </footer>
    </div>
  );
}
