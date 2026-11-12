"use client";

import { useMemo, useState } from "react";
import {
  X,
  Radio,
  Flame,
  Clock,
  TrendingUp,
  BookOpen,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Award,
  FileText,
  Video,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  GraduationCap,
  ChevronRight,
  ShieldAlert,
  BarChart2,
  CheckCircle2,
} from "lucide-react";
import { DEFAULT_GOAL_MINUTES, duration, indiaWeek, StudyState } from "@/lib/cma";
import { ErrorText } from "@/components/auth-card";

export type StudentRecord = StudyState & {
  id: string;
  name: string;
  email: string;
  role?: string;
  targetExam?: string;
  primarySubject?: string;
  phone?: string;
  city?: string;
  registrationNumber?: string;
  group?: string;
  coachingType?: string;
  attemptCount?: string;
  studyTimePreference?: string;
  instituteChapter?: string;
};

export type StudentDetail = {
  daily: { day: string; seconds: number }[];
  sessions: { subject: string; seconds: number; startedAt: number }[];
  checkins: { day: string }[];
  opened: { title: string; at: number }[];
};

interface StudentDossierProps {
  student: StudentRecord;
  detail: StudentDetail | null;
  detailError: string;
  now: number;
  onClose: () => void;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function StudentDossier({
  student,
  detail,
  detailError,
  now,
  onClose,
}: StudentDossierProps) {
  const [tab, setTab] = useState<"overview" | "subjects" | "sessions" | "profile">("overview");
  const [copiedReg, setCopiedReg] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const isLive = Boolean(student.active && now - student.active.last < 90000);

  // Calculate 7-day week activity
  const weekDays = useMemo(() => indiaWeek(now), [now]);
  const dailyGoalSec = (student.dailyGoalMinutes || DEFAULT_GOAL_MINUTES) * 60;

  const weekActivity = useMemo(() => {
    if (!detail) return [];
    return weekDays.map((dayIso, idx) => {
      const match = detail.daily.find((d) => d.day === dayIso);
      const seconds = match?.seconds ?? 0;
      const pct = Math.min(100, Math.round((seconds / dailyGoalSec) * 100));
      return {
        iso: dayIso,
        dayName: DAY_NAMES[idx],
        seconds,
        pct,
        isToday: dayIso === new Date(now).toISOString().slice(0, 10),
      };
    });
  }, [detail, weekDays, dailyGoalSec, now]);

  const thisWeekSeconds = useMemo(() => {
    return weekActivity.reduce((sum, d) => sum + d.seconds, 0);
  }, [weekActivity]);

  const weeklyTargetSec = dailyGoalSec * 7;
  const weeklyVelocityPct = Math.min(100, Math.round((thisWeekSeconds / weeklyTargetSec) * 100));

  // Subject distribution
  const subjectStats = useMemo(() => {
    if (!detail?.sessions || detail.sessions.length === 0) return [];
    const map = new Map<string, { seconds: number; sessionCount: number }>();
    for (const s of detail.sessions) {
      const subj = s.subject || "General Study";
      const existing = map.get(subj) || { seconds: 0, sessionCount: 0 };
      map.set(subj, {
        seconds: existing.seconds + s.seconds,
        sessionCount: existing.sessionCount + 1,
      });
    }
    const total = Array.from(map.values()).reduce((sum, item) => sum + item.seconds, 0) || 1;
    return Array.from(map.entries())
      .map(([subject, data]) => ({
        subject,
        seconds: data.seconds,
        sessionCount: data.sessionCount,
        percent: Math.min(100, Math.round((data.seconds / total) * 100)),
      }))
      .sort((a, b) => b.seconds - a.seconds);
  }, [detail]);

  const copyToClipboard = async (text: string, type: "reg" | "phone") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "reg") {
        setCopiedReg(true);
        setTimeout(() => setCopiedReg(false), 2000);
      } else {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      }
    } catch {
      // ignore clipboard error
    }
  };

  return (
    <section
      id="student-activity"
      tabIndex={-1}
      className="apple-glass-card p-4 sm:p-7 space-y-5 sm:space-y-6 focus:outline-none transition-all w-full max-w-full overflow-x-hidden"
    >
      {/* 1. HERO STUDENT HEADER & MENTOR ACTION BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5 border-b border-black/5 dark:border-white/10 pb-5 sm:pb-6">
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          {/* Avatar with dynamic live status badge */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#111110] text-white dark:bg-white dark:text-[#111110] flex items-center justify-center font-apfel font-bold text-xl sm:text-2xl shadow-sm">
              {student.name ? student.name.charAt(0).toUpperCase() : "S"}
            </div>
            {isLive && (
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-3 ring-white dark:ring-[#1a1a19] flex items-center justify-center"
                title="Active Now"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              </span>
            )}
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-apfel font-bold text-[var(--text-primary)] truncate">
                {student.name || "Student"}
              </h3>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] tabular-nums font-bold bg-[#111110] text-white dark:bg-white dark:text-[#111110]">
                {student.level ? `CMA ${student.level}` : "CMA"}
              </span>

              {student.group && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] tabular-nums font-bold bg-black/5 dark:bg-white/10 text-[var(--text-primary)]">
                  {student.group}
                </span>
              )}

              {student.role === "teacher" && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] tabular-nums font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                  Staff / Admin
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap text-xs tabular-nums text-[var(--text-secondary)]">
              <span>{student.email}</span>
              {student.city && (
                <>
                  <span className="text-black/20 dark:text-white/20">·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[var(--text-secondary)]" />
                    {student.city}
                  </span>
                </>
              )}
            </div>

            {/* Live activity indicator subline */}
            <div className="text-xs tabular-nums pt-0.5">
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  Currently studying {student.active?.subject || "Active session"}
                </span>
              ) : (
                <span className="text-[var(--text-secondary)]">
                  {student.lastCheckin
                    ? `Last active on ${student.lastCheckin}`
                    : "No recorded check-in"}
                  {student.lastMaterial && ` · Studied "${student.lastMaterial}"`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mentor Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {student.phone && (
            <>
              <a
                href={`https://wa.me/${student.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="Open WhatsApp chat"
              >
                <span>WhatsApp</span>
              </a>

              <a
                href={`tel:${student.phone}`}
                className="px-3 py-2 rounded-xl border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-xs font-semibold inline-flex items-center gap-1.5 text-[var(--text-primary)] transition-colors cursor-pointer"
                title="Direct Phone Call"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Call</span>
              </a>
            </>
          )}

          <a
            href={`mailto:${student.email}`}
            className="px-3 py-2 rounded-xl border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-xs font-semibold inline-flex items-center gap-1.5 text-[var(--text-primary)] transition-colors cursor-pointer"
            title="Send Email"
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Email</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
            aria-label="Close student dossier"
            title="Close dossier"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. FOUR VITALS CARDS (Precedent: Duolingo & Uxcel) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Vital 1: Streak */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-1 sm:space-y-1.5 min-w-0">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] tabular-nums uppercase tracking-wider text-[var(--text-secondary)]">
            <span className="truncate">Study Streak</span>
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-apfel font-bold text-[var(--text-primary)]">
            {student.checkinCount ?? detail?.checkins.length ?? 0}{" "}
            <span className="text-[10px] sm:text-xs tabular-nums font-normal text-[var(--text-secondary)]">days</span>
          </div>
          <div className="text-[9px] sm:text-[10px] tabular-nums text-[var(--text-secondary)] truncate">
            {student.lastCheckin ? `Last: ${student.lastCheckin}` : "No check-ins yet"}
          </div>
        </div>

        {/* Vital 2: Total Hours */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-1 sm:space-y-1.5 min-w-0">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] tabular-nums uppercase tracking-wider text-[var(--text-secondary)]">
            <span className="truncate">All-Time Focus</span>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--text-secondary)] shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-apfel font-bold text-[var(--text-primary)]">
            {duration(student.totalSeconds || 0)}
          </div>
          <div className="text-[9px] sm:text-[10px] tabular-nums text-[var(--text-secondary)] truncate">
            {detail?.sessions?.length ?? 0} deep sessions logged
          </div>
        </div>

        {/* Vital 3: Weekly Pace */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-1 sm:space-y-1.5 min-w-0">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] tabular-nums uppercase tracking-wider text-[var(--text-secondary)]">
            <span className="truncate">Weekly Pace</span>
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-apfel font-bold text-[var(--text-primary)]">
            {duration(thisWeekSeconds)}
          </div>
          <div className="text-[9px] sm:text-[10px] tabular-nums text-[var(--text-secondary)] truncate">
            {weeklyVelocityPct}% of weekly target
          </div>
        </div>

        {/* Vital 4: Materials Opened */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-1 sm:space-y-1.5 min-w-0">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] tabular-nums uppercase tracking-wider text-[var(--text-secondary)]">
            <span className="truncate">Curriculum</span>
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--text-secondary)] shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-apfel font-bold text-[var(--text-primary)]">
            {detail?.opened?.length ?? 0}{" "}
            <span className="text-[10px] sm:text-xs tabular-nums font-normal text-[var(--text-secondary)]">items</span>
          </div>
          <div className="text-[9px] sm:text-[10px] tabular-nums text-[var(--text-secondary)] truncate">
            {subjectStats.length} subjects engaged
          </div>
        </div>
      </div>

      {/* 3. SEGMENTED DOSSIER SUB-NAVIGATION (Precedent: Uxcel) */}
      <div className="w-full overflow-x-auto pb-2 border-b border-black/5 dark:border-white/10 -mx-3 px-3 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            type="button"
            onClick={() => setTab("overview")}
            className={`px-3 py-1.5 rounded-xl text-xs font-apfel font-bold transition-all cursor-pointer whitespace-nowrap ${
              tab === "overview"
                ? "bg-[#111110] text-white dark:bg-white dark:text-[#111110] shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <span>Overview & Trends</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("subjects")}
            className={`px-3 py-1.5 rounded-xl text-xs font-apfel font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              tab === "subjects"
                ? "bg-[#111110] text-white dark:bg-white dark:text-[#111110] shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <span>Subject Mastery</span>
            {subjectStats.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] tabular-nums bg-black/10 dark:bg-white/20">
                {subjectStats.length}
              </span>
            )}
          </button>

        <button
          type="button"
          onClick={() => setTab("sessions")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-apfel font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            tab === "sessions"
              ? "bg-[#111110] text-white dark:bg-white dark:text-[#111110] shadow-xs"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <span>Session Logs</span>
          {detail && (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] tabular-nums bg-black/10 dark:bg-white/20">
              {detail.sessions.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setTab("profile")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-apfel font-bold transition-all cursor-pointer whitespace-nowrap ${
            tab === "profile"
              ? "bg-[#111110] text-white dark:bg-white dark:text-[#111110] shadow-xs"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <span>Academic Profile</span>
        </button>
        </div>
      </div>

      <ErrorText>{detailError}</ErrorText>

      {/* DETAIL CONTENT BODY */}
      {!detail && !detailError ? (
        <div className="py-12 text-center text-xs tabular-nums text-[var(--text-secondary)] space-y-2">
          <div className="w-5 h-5 border-2 border-black/20 dark:border-white/20 border-t-[var(--text-primary)] rounded-full animate-spin mx-auto" />
          <p>Syncing student telemetry and session logs…</p>
        </div>
      ) : detail ? (
        <div>
          {/* TAB 1: OVERVIEW & 7-DAY TREND (Precedent: Duolingo) */}
          {tab === "overview" && (
            <div className="space-y-6">
              {/* 7-Day Velocity Bar Chart */}
              <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-apfel font-bold text-[var(--text-primary)]">
                      7-Day Study Velocity
                    </h4>
                    <p className="text-[11px] tabular-nums text-[var(--text-secondary)]">
                      Daily focus hours compared against {Math.round(dailyGoalSec / 3600 * 10) / 10}h daily target
                    </p>
                  </div>
                  <div className="text-xs tabular-nums font-bold text-[var(--text-primary)]">
                    Total: {duration(thisWeekSeconds)} this week
                  </div>
                </div>

                {/* Bars Grid */}
                <div className="w-full overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-4 pt-4 pb-2 items-end h-36 sm:h-40 min-w-[280px] border-b border-black/5 dark:border-white/10">
                    {weekActivity.map((day) => (
                      <div key={day.iso} className="flex flex-col items-center gap-1.5 sm:gap-2 h-full justify-end group">
                        <div className="text-[9px] sm:text-[10px] tabular-nums text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                          {day.seconds > 0 ? duration(day.seconds) : "—"}
                        </div>
                        <div className="w-full max-w-[36px] bg-black/5 dark:bg-white/10 rounded-xl h-20 sm:h-24 p-1 flex items-end">
                          <div
                            style={{ height: `${Math.max(8, day.pct)}%` }}
                            className={`w-full rounded-lg transition-all ${
                              day.pct >= 100
                                ? "bg-emerald-500"
                                : day.seconds > 0
                                ? "bg-[#111110] dark:bg-white"
                                : "bg-transparent"
                            }`}
                          />
                        </div>
                        <div className="text-center">
                          <span
                            className={`text-[11px] sm:text-xs tabular-nums font-bold block ${
                              day.isToday ? "text-[var(--text-primary)] underline" : "text-[var(--text-secondary)]"
                            }`}
                          >
                            {day.dayName}
                          </span>
                          <span className="text-[9px] tabular-nums text-[var(--text-secondary)] block">
                            {day.iso.slice(8)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] tabular-nums text-[var(--text-secondary)] pt-1">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      Goal Achieved (100%+)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#111110] dark:bg-white inline-block" />
                      In Progress
                    </span>
                  </div>
                  <span>Benchmark: {student.dailyGoalMinutes || DEFAULT_GOAL_MINUTES} mins / day</span>
                </div>
              </div>

              {/* Study Habit Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-1">
                  <span className="text-[10px] tabular-nums uppercase font-bold text-[var(--text-secondary)] block">
                    Focus Target Paper
                  </span>
                  <div className="font-apfel font-bold text-sm text-[var(--text-primary)] truncate">
                    {student.primarySubject || "All Syllabus Papers"}
                  </div>
                  <span className="text-[11px] tabular-nums text-[var(--text-secondary)] block">
                    Primary focus during self-study
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-1">
                  <span className="text-[10px] tabular-nums uppercase font-bold text-[var(--text-secondary)] block">
                    Routine Preference
                  </span>
                  <div className="font-apfel font-bold text-sm text-[var(--text-primary)]">
                    {student.studyTimePreference || "Flexible Routine"}
                  </div>
                  <span className="text-[11px] tabular-nums text-[var(--text-secondary)] block">
                    Preferred revision window
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-1">
                  <span className="text-[10px] tabular-nums uppercase font-bold text-[var(--text-secondary)] block">
                    Coaching Mode & Attempt
                  </span>
                  <div className="font-apfel font-bold text-sm text-[var(--text-primary)]">
                    {student.coachingType || "Self Study"} · {student.attemptCount || "1st Attempt"}
                  </div>
                  <span className="text-[11px] tabular-nums text-[var(--text-secondary)] block">
                    Target: {student.targetExam || "Not set"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBJECT MASTERY & FOCUS DISTRIBUTION (Precedent: Codecademy) */}
          {tab === "subjects" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-apfel font-bold text-[var(--text-primary)]">
                    Syllabus Subject Allocation
                  </h4>
                  <p className="text-[11px] tabular-nums text-[var(--text-secondary)]">
                    Time distribution across CMA papers from recorded timer sessions
                  </p>
                </div>
                <span className="text-xs tabular-nums font-bold text-[var(--text-secondary)]">
                  {subjectStats.length} active subjects
                </span>
              </div>

              {!subjectStats.length ? (
                <div className="p-8 rounded-2xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 text-center space-y-2">
                  <BookOpen className="w-8 h-8 text-[var(--text-secondary)] mx-auto opacity-50" />
                  <p className="text-xs font-apfel font-bold text-[var(--text-primary)]">
                    No Subject Sessions Recorded Yet
                  </p>
                  <p className="text-[11px] tabular-nums text-[var(--text-secondary)] max-w-sm mx-auto">
                    When this student runs focus timer sessions with a selected subject, hours breakdown will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {subjectStats.map((item) => (
                    <div
                      key={item.subject}
                      className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0">
                          <span className="font-apfel font-bold text-sm text-[var(--text-primary)] block truncate">
                            {item.subject}
                          </span>
                          <span className="text-[10px] tabular-nums text-[var(--text-secondary)]">
                            {item.sessionCount} sessions logged
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="tabular-nums font-bold text-sm text-[var(--text-primary)] block">
                            {duration(item.seconds)}
                          </span>
                          <span className="text-[10px] tabular-nums text-[var(--text-secondary)]">
                            {item.percent}% of focus time
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                        <div
                          style={{ width: `${item.percent}%` }}
                          className="h-full rounded-full bg-[#111110] dark:bg-white transition-all"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SESSION LOGS & MATERIALS (Precedent: Uxcel) */}
          {tab === "sessions" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left Column: Recent Focus Sessions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs tabular-nums font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Recent Study Sessions ({detail.sessions.length})
                  </h4>
                  <span className="text-[10px] tabular-nums text-[var(--text-secondary)]">
                    Newest first
                  </span>
                </div>

                {!detail.sessions.length ? (
                  <div className="p-6 rounded-2xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 text-center text-xs tabular-nums text-[var(--text-secondary)]">
                    No focus sessions recorded yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {detail.sessions.map((sess, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <span className="font-apfel font-bold text-[var(--text-primary)] block truncate">
                            {sess.subject || "General Session"}
                          </span>
                          <span className="text-[10px] tabular-nums text-[var(--text-secondary)] block">
                            {sess.startedAt ? new Date(sess.startedAt).toLocaleString("en-IN", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }) : "Past session"}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] tabular-nums font-bold bg-black/5 dark:bg-white/10 text-[var(--text-primary)] shrink-0">
                          {duration(sess.seconds)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Materials Accessed */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs tabular-nums font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Materials Accessed ({detail.opened.length})
                  </h4>
                  <span className="text-[10px] tabular-nums text-[var(--text-secondary)]">
                    Activity trail
                  </span>
                </div>

                {!detail.opened.length ? (
                  <div className="p-6 rounded-2xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 text-center text-xs tabular-nums text-[var(--text-secondary)]">
                    No materials opened yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {detail.opened.map((mat, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
                          <span className="font-apfel font-semibold text-[var(--text-primary)] truncate">
                            {mat.title}
                          </span>
                        </div>
                        <span className="text-[10px] tabular-nums text-[var(--text-secondary)] shrink-0">
                          {new Date(mat.at).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ACADEMIC PROFILE & SPEC SHEET */}
          {tab === "profile" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: ICMAI Registration */}
              <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between text-[10px] tabular-nums uppercase tracking-wider font-bold text-[var(--text-secondary)]">
                  <span>ICMAI Academic Profile</span>
                  <Award className="w-3.5 h-3.5" />
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[var(--text-secondary)] block text-[10px] tabular-nums">
                      Registration Number:
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="tabular-nums font-bold text-sm text-[var(--text-primary)]">
                        {student.registrationNumber || "Not registered"}
                      </span>
                      {student.registrationNumber && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(student.registrationNumber!, "reg")}
                          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                          title="Copy registration number"
                        >
                          {copiedReg ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[var(--text-secondary)] block text-[10px] tabular-nums">
                      CMA Course Level & Group:
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {student.level ? `CMA ${student.level}` : "Foundation"} {student.group ? `· ${student.group}` : ""}
                    </span>
                  </div>

                  <div>
                    <span className="text-[var(--text-secondary)] block text-[10px] tabular-nums">
                      Target Term:
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {student.targetExam || "Not set"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[var(--text-secondary)] block text-[10px] tabular-nums">
                      Coaching Mode:
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {student.coachingType || "Self Study"} · {student.attemptCount || "First Attempt"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Contact & Regional Location */}
              <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between text-[10px] tabular-nums uppercase tracking-wider font-bold text-[var(--text-secondary)]">
                  <span>Contact & Chapter</span>
                  <MapPin className="w-3.5 h-3.5" />
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[var(--text-secondary)] block text-[10px] tabular-nums">
                      Phone / WhatsApp:
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-semibold text-[var(--text-primary)]">
                        {student.phone || "Not provided"}
                      </span>
                      {student.phone && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(student.phone!, "phone")}
                          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                          title="Copy phone"
                        >
                          {copiedPhone ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[var(--text-secondary)] block text-[10px] tabular-nums">
                      Email Address:
                    </span>
                    <span className="tabular-nums text-[var(--text-primary)] truncate block">
                      {student.email}
                    </span>
                  </div>

                  <div>
                    <span className="text-[var(--text-secondary)] block text-[10px] tabular-nums">
                      City & State:
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {student.city || "Not provided"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[var(--text-secondary)] block text-[10px] tabular-nums">
                      Regional Chapter:
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {student.instituteChapter || "Not specified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Study Habits & Benchmarks */}
              <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between text-[10px] tabular-nums uppercase tracking-wider font-bold text-[var(--text-secondary)]">
                  <span>Study Habits</span>
                  <Calendar className="w-3.5 h-3.5" />
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[var(--text-secondary)] block text-[10px] tabular-nums">
                      Daily Study Target:
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {student.dailyGoalMinutes
                        ? `${Math.floor(student.dailyGoalMinutes / 60)}h ${student.dailyGoalMinutes % 60}m / day`
                        : "2.5 Hours / day"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[var(--text-secondary)] block text-[10px] tabular-nums">
                      Routine Window:
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {student.studyTimePreference || "Flexible"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[var(--text-secondary)] block text-[10px] tabular-nums">
                      Primary Subject:
                    </span>
                    <span className="font-semibold text-[var(--text-primary)] truncate block">
                      {student.primarySubject || "All Syllabus Papers"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[var(--text-secondary)] block text-[10px] tabular-nums">
                      Total Active Check-ins:
                    </span>
                    <span className="tabular-nums font-bold text-[var(--text-primary)]">
                      {student.checkinCount ?? detail.checkins.length} days recorded
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
