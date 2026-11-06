"use client";

import React, { useState } from "react";
import { CalendarDays, Check, ChevronDown, ListTodo, Plus, Trash2 } from "lucide-react";
import { RequireRole, useAuth } from "@/lib/auth";
import { friendlyError } from "@/lib/firebase/errors";
import { addTask, deleteTask, updateTask, useTasks } from "@/lib/hooks";
import { dayKey } from "@/lib/streak";
import { GROUP_LABELS, groupTasks, Task, TaskGroup } from "@/lib/tasks";
import { ErrorText } from "@/components/auth-card";
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
    <li className="group flex items-center gap-3 px-4 py-3 min-h-14">
      <button
        onClick={toggle}
        role="checkbox"
        aria-checked={task.done}
        aria-label={`Mark "${task.title}" as ${task.done ? "not done" : "done"}`}
        className={`${pillButton} shrink-0 w-7 h-7 border-2 ${
          task.done ? "bg-emerald-600 border-emerald-600 text-white" : "border-[var(--border-color)] hover:border-emerald-500 text-transparent hover:text-emerald-500"
        }`}
      >
        <Check className="w-4 h-4" strokeWidth={3} />
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
        className={`${pillButton} shrink-0 w-9 h-9 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </li>
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
      await addTask(user.uid, title.trim(), due || null);
      setTitle("");
      setDue("");
    } catch (err) {
      onError(err);
    }
    setBusy(false);
  };

  const quickDue = [
    { label: "Today", value: today },
    { label: "Tomorrow", value: dayKey(new Date(Date.parse(`${today}T12:00:00`) + 86400000)) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <PageTitle title="Tasks" />
        {items && (
          <p className="shrink-0 text-sm text-[var(--text-secondary)]">
            <span className="font-heading font-black text-2xl text-[var(--text-primary)]">{open}</span> to do
          </p>
        )}
      </div>

      <form onSubmit={add} className={`${cardClass} p-3 space-y-3`}>
        <div className="flex items-center gap-2">
          <label className="flex-1">
            <span className="sr-only">New task</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="Add a task, e.g. Revise chapter 2"
              className="w-full h-12 px-3 bg-transparent text-base outline-none placeholder:text-[var(--text-muted)]"
            />
          </label>
          <button type="submit" disabled={!title.trim() || busy} aria-label="Add task" className={`${pillButton} shrink-0 h-11 px-4 text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white`}>
            <Plus className="w-4 h-4" aria-hidden /> <span className="hidden sm:inline">Add</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 px-1 pb-1">
          <span className="text-xs text-[var(--text-muted)] mr-1">Due:</span>
          {quickDue.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => setDue(due === q.value ? "" : q.value)}
              aria-pressed={due === q.value}
              className={`${pillButton} h-8 px-3 text-xs ${due === q.value ? "bg-[#111110] text-white dark:bg-white dark:text-[#111110]" : "bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
            >
              {q.label}
            </button>
          ))}
          <label className={`${pillButton} h-8 px-3 text-xs cursor-pointer ${due && !quickDue.some((q) => q.value === due) ? "bg-[#111110] text-white dark:bg-white dark:text-[#111110]" : "bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)]"}`}>
            <CalendarDays className="w-3.5 h-3.5" aria-hidden />
            <span className="sr-only">Pick a due date</span>
            <input type="date" value={due} min={today} onChange={(e) => setDue(e.target.value)} className="bg-transparent outline-none w-[7.5rem] cursor-pointer [color-scheme:light] dark:[color-scheme:dark]" />
          </label>
        </div>
      </form>

      <ErrorText>{error || actionError}</ErrorText>

      {items && items.length === 0 && (
        <div className={`${cardClass} p-8 text-center`}>
          <span className="mx-auto w-14 h-14 rounded-2xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
            <ListTodo className="w-6 h-6" aria-hidden />
          </span>
          <h2 className="mt-4 font-heading font-bold">No tasks yet</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Add homework, revision and exam dates above. Tick them off as you go.</p>
        </div>
      )}

      {items && items.length > 0 && open === 0 && (
        <p className="text-center text-sm text-[var(--text-secondary)] py-2">🎉 All done. Nothing left on your list.</p>
      )}

      {(["overdue", "today", "upcoming", "someday"] as const).map((g) =>
        groups[g].length ? (
          <section key={g} className="space-y-2">
            <h2 className={`px-1 text-xs font-bold uppercase tracking-wider ${GROUP_STYLE[g]}`}>
              {GROUP_LABELS[g]} <span className="text-[var(--text-muted)] font-mono">{groups[g].length}</span>
            </h2>
            <ul className={`${cardClass} divide-y divide-[var(--border-subtle)] overflow-hidden`}>
              {groups[g].map((t) => <TaskRow key={t.id} task={t} group={g} today={today} onError={onError} />)}
            </ul>
          </section>
        ) : null
      )}

      {doneToday > 0 && (
        <section className="space-y-2">
          <button onClick={() => setShowDone(!showDone)} aria-expanded={showDone} className="flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <ChevronDown className={`w-4 h-4 transition-transform ${showDone ? "" : "-rotate-90"}`} aria-hidden />
            {GROUP_LABELS.done} <span className="font-mono">{doneToday}</span>
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
