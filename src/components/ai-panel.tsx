"use client";

import React, { useEffect, useRef, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { BookOpen, Brain, Check, Layers, ListChecks, Loader2, MessageCircle, RefreshCw, Send, Sparkles, X } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { friendlyError } from "@/lib/firebase/errors";
import { useAuth } from "@/lib/auth";
import { postAi } from "@/lib/ai-client";
import { AnswerPart, ChatTurn, MAX_QUESTION, MAX_TURNS } from "@/lib/chat";
import { Material } from "@/lib/materials";
import { MindMap, PackDoc, StudyPack } from "@/lib/study-pack";
import { ErrorText } from "@/components/auth-card";
import { cardClass, pillButton } from "@/components/ui";

type Tab = "pack" | "map" | "quiz" | "cards" | "ask";
type GoToPage = (page: number) => void;

const sectionTitle = "text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]";

function PageChip({ page, onGoToPage }: { page: number; onGoToPage: GoToPage }) {
  return (
    <button
      onClick={() => onGoToPage(page)}
      className={`${pillButton} h-7 px-2.5 text-[11px] bg-[var(--accent-light)] text-[var(--accent-text)] hover:bg-[var(--accent)] hover:text-white`}
      title={`Open page ${page} in the PDF`}
    >
      Page {page}
    </button>
  );
}

/** AI help for one PDF: study pack, quiz, flashcards and doubt chat. Teachers also make and publish the pack here. */
export function AiPanel({ material, onGoToPage }: { material: Material; onGoToPage: GoToPage }) {
  const { user, profile } = useAuth();
  const isOwner = user?.uid === material.teacherId;
  // Only teachers chat with AI; students study from the pack their teacher published, so they cost no tokens.
  const canChat = profile?.role === "teacher";
  // undefined = loading, null = none (or not published yet, which students aren't allowed to read)
  const [pack, setPack] = useState<PackDoc | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab | null>(null);

  useEffect(
    () =>
      onSnapshot(
        doc(db, "materials", material.id, "ai", "pack"),
        (snap) => setPack(snap.exists() ? (snap.data() as PackDoc) : null),
        () => setPack(null)
      ),
    [material.id]
  );

  const ready = pack?.status === "ready" && (pack.published || isOwner) ? pack : null;
  const tabs: { value: Tab; label: string; icon: React.ReactNode }[] = [
    ...(ready
      ? [
          { value: "pack" as const, label: "Study pack", icon: <BookOpen className="w-4 h-4" /> },
          ...(ready.mindMap ? [{ value: "map" as const, label: "Mind map", icon: <Brain className="w-4 h-4" /> }] : []),
          { value: "quiz" as const, label: "Quiz", icon: <ListChecks className="w-4 h-4" /> },
          { value: "cards" as const, label: "Flashcards", icon: <Layers className="w-4 h-4" /> },
        ]
      : []),
    ...(canChat ? [{ value: "ask" as const, label: "Ask AI", icon: <MessageCircle className="w-4 h-4" /> }] : []),
  ];
  const active = tab && tabs.some((t) => t.value === tab) ? tab : tabs[0]?.value;
  // A student with nothing published yet sees nothing here.
  if (!tabs.length) return null;

  return (
    <section className="space-y-4" aria-label="AI study help">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="w-4 h-4 text-[var(--accent)]" aria-hidden />
        <h2 className="text-lg font-heading font-black tracking-tight">Study with AI</h2>
      </div>

      {isOwner && <TeacherControls material={material} pack={pack} />}

      <div role="tablist" aria-label="AI study tools" className="flex gap-1 p-1 rounded-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.value}
            role="tab"
            aria-selected={active === t.value}
            onClick={() => setTab(t.value)}
            className={`${pillButton} flex-1 h-10 px-4 text-xs whitespace-nowrap ${
              active === t.value ? "bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {active === "pack" && ready && <PackView pack={ready} />}
      {active === "map" && ready?.mindMap && <MindMapView map={ready.mindMap} />}
      {active === "quiz" && ready && <QuizView pack={ready} onGoToPage={onGoToPage} />}
      {active === "cards" && ready && <FlashcardsView pack={ready} />}
      {active === "ask" && <AskView material={material} onGoToPage={onGoToPage} />}

      <p className="px-1 text-[11px] text-[var(--text-muted)]">AI can make mistakes. If something looks wrong, check the file or ask your teacher.</p>
    </section>
  );
}

function TeacherControls({ material, pack }: { material: Material; pack: PackDoc | null | undefined }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const make = async (regenerate: boolean) => {
    setBusy(true);
    setError("");
    try {
      await postAi("/api/ai/study-pack", { materialId: material.id, regenerate });
    } catch (err) {
      setError((err as Error).message);
    }
    setBusy(false);
  };

  const setPublished = (published: boolean) =>
    updateDoc(doc(db, "materials", material.id, "ai", "pack"), { published }).catch((err) => setError(friendlyError(err)));

  const working = busy || pack?.status === "generating";
  const box = `${cardClass} p-4 flex flex-wrap items-center justify-between gap-3`;

  return (
    <div className="space-y-2">
      {pack === undefined ? null : working ? (
        <div className={box} role="status">
          <span className="flex items-center gap-2.5 text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" aria-hidden />
            AI is reading the file and making the study pack. This takes a minute or two.
          </span>
        </div>
      ) : !pack || pack.status === "error" ? (
        <div className={box}>
          <span className="text-sm">
            {pack?.status === "error" ? pack.error : "Let AI make a summary, quiz and flashcards from this PDF. You check it before students see it."}
          </span>
          <button onClick={() => make(false)} className={`${pillButton} h-10 px-4 text-xs bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white`}>
            <Sparkles className="w-4 h-4" aria-hidden /> {pack ? "Try again" : "Make study pack"}
          </button>
        </div>
      ) : pack.status === "ready" && !pack.published ? (
        <div className={`${box} border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800`}>
          <span className="text-sm font-medium text-amber-900 dark:text-amber-200">Students can&apos;t see this yet. Check the quiz answers below, then publish.</span>
          <span className="flex gap-2">
            <button onClick={() => make(true)} className={`${pillButton} h-10 px-3 text-xs border border-amber-300 dark:border-amber-800`}>
              <RefreshCw className="w-3.5 h-3.5" aria-hidden /> Make again
            </button>
            <button onClick={() => setPublished(true)} className={`${pillButton} h-10 px-4 text-xs bg-emerald-600 hover:bg-emerald-700 text-white`}>
              <Check className="w-4 h-4" aria-hidden /> Publish to students
            </button>
          </span>
        </div>
      ) : (
        <div className={box}>
          <span className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 font-medium">
            <Check className="w-4 h-4" aria-hidden /> Study pack is live for students
          </span>
          <span className="flex gap-2">
            <button onClick={() => make(true)} className={`${pillButton} h-9 px-3 text-xs border border-[var(--border-color)]`}>
              <RefreshCw className="w-3.5 h-3.5" aria-hidden /> Make again
            </button>
            <button onClick={() => setPublished(false)} className={`${pillButton} h-9 px-3 text-xs border border-[var(--border-color)]`}>Hide from students</button>
          </span>
        </div>
      )}
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

function PackView({ pack }: { pack: StudyPack }) {
  return (
    <div className={`${cardClass} p-5 sm:p-6 space-y-6`}>
      <div>
        <h3 className={sectionTitle}>Summary</h3>
        <p className="mt-2 leading-relaxed">{pack.summary}</p>
      </div>
      {pack.keyPoints.length > 0 && (
        <div>
          <h3 className={sectionTitle}>Key points</h3>
          <ul className="mt-2 space-y-2">
            {pack.keyPoints.map((p, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" aria-hidden /> {p}
              </li>
            ))}
          </ul>
        </div>
      )}
      {pack.terms.length > 0 && (
        <div>
          <h3 className={sectionTitle}>Important terms</h3>
          <dl className="mt-2 grid sm:grid-cols-2 gap-2">
            {pack.terms.map((t, i) => (
              <div key={i} className="p-3 rounded-2xl bg-[var(--bg-surface-subtle)]">
                <dt className="text-sm font-bold">{t.term}</dt>
                <dd className="text-sm text-[var(--text-secondary)]">{t.meaning}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      {pack.examQuestions.length > 0 && (
        <div>
          <h3 className={sectionTitle}>Likely exam questions</h3>
          <ol className="mt-2 space-y-1.5 list-decimal pl-5 text-sm leading-relaxed">
            {pack.examQuestions.map((q, i) => <li key={i}>{q}</li>)}
          </ol>
        </div>
      )}
    </div>
  );
}

const BRANCH_COLORS = ["#E57835", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899"];

/** Topic in the middle, branches on both sides (stacked under it on phones). */
function MindMapView({ map }: { map: MindMap }) {
  const half = Math.ceil(map.branches.length / 2);
  const branch = (b: MindMap["branches"][number], i: number, side: "left" | "right") => {
    const color = BRANCH_COLORS[i % BRANCH_COLORS.length];
    return (
      <li key={i} className="relative">
        <span aria-hidden className={`hidden md:block absolute top-6 h-0.5 w-10 ${side === "left" ? "-right-10" : "-left-10"}`} style={{ background: color }} />
        <div className="rounded-2xl p-4 bg-[var(--bg-surface)] border-2" style={{ borderColor: `${color}66` }}>
          <p className="font-heading font-bold text-sm" style={{ color }}>{b.title}</p>
          <ul className="mt-2 space-y-1.5">
            {b.points.map((p, j) => (
              <li key={j} className="flex gap-2 text-sm leading-snug">
                <span aria-hidden className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: color }} /> {p}
              </li>
            ))}
          </ul>
        </div>
      </li>
    );
  };
  return (
    <div className={`${cardClass} p-5 sm:p-6`}>
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:gap-x-10 items-center">
        <div className="flex justify-center md:order-2">
          <p className="px-6 py-5 rounded-[28px] bg-[#111110] text-white dark:bg-white dark:text-[#111110] font-heading font-black text-lg text-center leading-tight max-w-[13rem] shadow-[var(--shadow-lg)]">
            {map.center}
          </p>
        </div>
        <ul className="space-y-4 md:order-1">{map.branches.slice(0, half).map((b, i) => branch(b, i, "left"))}</ul>
        <ul className="space-y-4 md:order-3">{map.branches.slice(half).map((b, i) => branch(b, i + half, "right"))}</ul>
      </div>
    </div>
  );
}

function QuizView({ pack, onGoToPage }: { pack: StudyPack; onGoToPage: GoToPage }) {
  const [chosen, setChosen] = useState<Record<number, number>>({});
  const answered = Object.keys(chosen).length;
  const correct = pack.quiz.filter((q, i) => chosen[i] === q.answer).length;

  return (
    <div className="space-y-3">
      <div className={`${cardClass} p-4 flex items-center justify-between gap-3`}>
        <p className="text-sm">
          <span className="font-heading font-black text-2xl">{correct}</span>
          <span className="text-[var(--text-secondary)]"> / {pack.quiz.length} correct · {answered} answered</span>
        </p>
        {answered > 0 && (
          <button onClick={() => setChosen({})} className={`${pillButton} h-9 px-3 text-xs border border-[var(--border-color)]`}>
            <RefreshCw className="w-3.5 h-3.5" aria-hidden /> Start over
          </button>
        )}
      </div>
      {answered === pack.quiz.length && (
        <p className="text-center text-sm font-semibold" role="status">
          {correct / pack.quiz.length >= 0.7 ? "🎉 Great job! You know this file well." : "Keep going: read the pages marked on the questions you missed, then try again."}
        </p>
      )}
      <ol className="space-y-3">
        {pack.quiz.map((q, i) => {
          const pick = chosen[i];
          const done = pick !== undefined;
          return (
            <li key={i} className={`${cardClass} p-5 space-y-3`}>
              <p className="font-semibold leading-snug">
                <span className="text-[var(--text-muted)] mr-1.5">{i + 1}.</span>
                {q.question}
              </p>
              <div className="grid gap-2" role="group" aria-label={`Question ${i + 1} options`}>
                {q.options.map((opt, j) => {
                  const isAnswer = j === q.answer;
                  const style = !done
                    ? "border-[var(--border-color)] hover:border-[var(--accent)] hover:bg-[var(--accent-light)]"
                    : isAnswer
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                      : j === pick
                        ? "border-red-400 bg-red-50 dark:bg-red-950/30"
                        : "border-[var(--border-subtle)] opacity-60";
                  return (
                    <button
                      key={j}
                      disabled={done}
                      onClick={() => setChosen({ ...chosen, [i]: j })}
                      className={`flex items-center gap-3 w-full text-left text-sm px-4 py-3 rounded-2xl border transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-color)] ${style}`}
                    >
                      <span className="shrink-0 w-6 h-6 rounded-full border border-[var(--border-color)] flex items-center justify-center text-xs font-bold">
                        {done && isAnswer ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : done && j === pick ? <X className="w-3.5 h-3.5 text-red-500" /> : "ABCDEF"[j]}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {done && (
                <div className="flex flex-wrap items-start justify-between gap-2 text-sm text-[var(--text-secondary)]">
                  <p className="flex-1 min-w-[12rem]">
                    <span className={`font-bold ${pick === q.answer ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                      {pick === q.answer ? "Correct! " : "Not quite. "}
                    </span>
                    {q.explanation}
                  </p>
                  <PageChip page={q.page} onGoToPage={onGoToPage} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function FlashcardsView({ pack }: { pack: StudyPack }) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const toggle = (i: number) => {
    const next = new Set(flipped);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setFlipped(next);
  };
  return (
    <div className="space-y-2">
      <p className="px-1 text-xs text-[var(--text-muted)]">Tap a card to see the answer. Try to answer in your head first.</p>
      <ul className="grid sm:grid-cols-2 gap-3">
        {pack.flashcards.map((c, i) => {
          const open = flipped.has(i);
          return (
            <li key={i}>
              <button
                onClick={() => toggle(i)}
                aria-pressed={open}
                className={`w-full min-h-[8.5rem] p-5 rounded-[24px] text-left border transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-color)] ${
                  open ? "bg-[#111110] text-white border-transparent dark:bg-white dark:text-[#111110]" : "bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--accent)]"
                }`}
              >
                <span className={`block text-[10px] font-bold uppercase tracking-wider ${open ? "opacity-60" : "text-[var(--accent)]"}`}>{open ? "Answer" : "Question"}</span>
                <span className="mt-2 block font-semibold leading-snug">{open ? c.back : c.front}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const SUGGESTIONS = ["Which parts will students find hardest?", "Give 5 extra exam questions with answers", "Isko simple Hinglish mein samjhao"];

function AskView({ material, onGoToPage }: { material: Material; onGoToPage: GoToPage }) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  // Answers keep their page citations for display; the API only needs their text.
  const [answers, setAnswers] = useState<AnswerPart[][]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (turns.length) endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [turns, busy]);

  const full = turns.length + 1 > MAX_TURNS;

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy || full) return;
    const next: ChatTurn[] = [...turns, { role: "user", content: q }];
    setTurns(next);
    setDraft("");
    setBusy(true);
    setError("");
    try {
      const { parts } = await postAi<{ parts: AnswerPart[] }>("/api/ai/ask", { materialId: material.id, turns: next });
      setTurns([...next, { role: "assistant", content: parts.map((p) => p.text).join("") }]);
      setAnswers([...answers, parts]);
    } catch (err) {
      setTurns(turns); // drop the unanswered question so history stays valid
      setDraft(q);
      setError((err as Error).message);
    }
    setBusy(false);
  };

  return (
    <div className={`${cardClass} p-4 sm:p-5 space-y-4`}>
      {turns.length === 0 && (
        <div className="space-y-3">
          <p className="text-sm text-[var(--text-secondary)]">Ask anything about <span className="font-semibold text-[var(--text-primary)]">{material.title}</span>. Answers come from this file, with page links. Students don&apos;t see this chat.</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => ask(s)} className={`${pillButton} h-9 px-3.5 text-xs bg-[var(--bg-surface-subtle)] hover:bg-[var(--accent-light)] hover:text-[var(--accent-text)]`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {turns.length > 0 && (
        <ol className="space-y-3" aria-live="polite">
          {turns.map((t, i) =>
            t.role === "user" ? (
              <li key={i} className="flex justify-end">
                <p className="max-w-[85%] px-4 py-2.5 rounded-[20px] rounded-br-md bg-[#111110] text-white dark:bg-white dark:text-[#111110] text-sm whitespace-pre-wrap">{t.content}</p>
              </li>
            ) : (
              <li key={i} className="max-w-[92%] px-4 py-3 rounded-[20px] rounded-bl-md bg-[var(--bg-surface-subtle)] text-sm leading-relaxed space-y-2">
                <p className="whitespace-pre-wrap">{t.content}</p>
                {(() => {
                  const pages = [...new Set((answers[(i - 1) / 2] ?? []).flatMap((p) => p.pages))].sort((a, b) => a - b);
                  return pages.length ? (
                    <span className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-[var(--text-muted)]">From</span>
                      {pages.map((p) => <PageChip key={p} page={p} onGoToPage={onGoToPage} />)}
                    </span>
                  ) : null;
                })()}
              </li>
            )
          )}
          {busy && (
            <li className="inline-flex items-center gap-2 px-4 py-3 rounded-[20px] bg-[var(--bg-surface-subtle)] text-sm text-[var(--text-secondary)]" role="status">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> Reading the file…
            </li>
          )}
        </ol>
      )}
      <div ref={endRef} />

      <ErrorText>{error}</ErrorText>

      {full ? (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-[var(--text-secondary)]">This chat is full.</span>
          <button onClick={() => { setTurns([]); setAnswers([]); }} className={`${pillButton} h-10 px-4 text-xs bg-[#111110] text-white dark:bg-white dark:text-[#111110]`}>
            Start a new chat
          </button>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); ask(draft); }} className="flex items-end gap-2">
          <label className="flex-1">
            <span className="sr-only">Your question</span>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(draft); } }}
              maxLength={MAX_QUESTION}
              rows={1}
              placeholder="Ask about this file…"
              className="w-full max-h-40 min-h-12 px-4 py-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none resize-y focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] focus:ring-4 focus:ring-[var(--ring-color)]"
            />
          </label>
          <button type="submit" disabled={!draft.trim() || busy} aria-label="Send question" className={`${pillButton} shrink-0 w-12 h-12 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white`}>
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
