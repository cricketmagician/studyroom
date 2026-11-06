"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store/app-store";
import { useTheme } from "@/components/providers/theme-provider";
import {
  Play,
  Pause,
  RotateCcw,
  PlayCircle,
  Clock,
  BookOpen,
  Calendar,
  Flame,
  Search,
  Bell,
  CheckCircle2,
  Bookmark,
  MessageSquare,
  LayoutGrid,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  ChevronDown,
  X,
  FileText,
  TrendingUp,
  Sun,
  Moon,
  GraduationCap,
  Building2,
  Globe,
  LogOut
} from "lucide-react";

export function SkillverseDashboard() {
  const router = useRouter();
  const { currentUser, currentCollege, allColleges, switchCollege, switchRole, courses, lessons, assignments, watchProgress } = useApp();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<"overview" | "tasklist" | "schedule">("overview");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  // Available high-resolution student hero images
  const heroImages = [
    { id: "portrait", url: "/student-portrait.jpg", label: "University Scholar" },
    { id: "solo", url: "/student-solo.jpg", label: "Editorial Studio" },
    { id: "classroom", url: "/student-classroom.jpg", label: "Lecture Hall" },
    { id: "study", url: "/student-study.jpg", label: "Design Lab" },
    { id: "group", url: "/student-hero-banner.jpg", label: "Study Cohort" },
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const cycleHeroImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  };

  // Active resume lesson (CS-301 or first lesson)
  const activeCourse = courses.find((c) => c.id === "cs301") || courses[0];
  const activeLesson = lessons.find((l) => l.course_id === activeCourse.id && l.lesson_type === "video") || lessons[0];

  const filteredCourses = searchQuery.trim()
    ? courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase()))
    : courses;

  // Active Real-Time Study Timer State (Auto-starts as soon as app opens)
  // Active Real-Time Study Timer State with persistent Auto-Save
  const [studySeconds, setStudySeconds] = useState(0);
  const [todayTotalSeconds, setTodayTotalSeconds] = useState(6420); // 1h 47m initial base
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [selectedStudySubject, setSelectedStudySubject] = useState("CS-301: Neural Radiance Fields");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isHydrated = useRef(false);

  // 1. Restore saved study time and session state from localStorage on initial load
  useEffect(() => {
    if (typeof window === "undefined") return;
    const todayKey = new Date().toISOString().slice(0, 10);
    
    // Load cumulative study time for today
    const savedToday = localStorage.getItem(`skillverse_today_total_sec_${todayKey}`);
    const initialToday = savedToday ? parseInt(savedToday, 10) : 6420;
    setTodayTotalSeconds(initialToday);

    // Load active session stopwatch time
    const savedSession = localStorage.getItem("skillverse_study_session_sec");
    if (savedSession) {
      setStudySeconds(parseInt(savedSession, 10) || 0);
    }

    const savedSubject = localStorage.getItem("skillverse_study_subject");
    if (savedSubject) {
      setSelectedStudySubject(savedSubject);
    }

    const savedRunning = localStorage.getItem("skillverse_timer_is_running");
    if (savedRunning !== null) {
      setIsTimerRunning(savedRunning === "true");
    }

    // Mark hydration as finished so we don't overwrite saved data with 0
    isHydrated.current = true;
  }, []);

  // 2. Tick timer every second when active: BOTH session stopwatch & today total advance
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setStudySeconds((s) => s + 1);
        setTodayTotalSeconds((t) => t + 1);
      }, 1000);
    } else if (!isTimerRunning && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // 3. Continuous live Auto-Save to localStorage on every second & state update (AFTER hydration)
  useEffect(() => {
    if (!isHydrated.current || typeof window === "undefined") return;
    const todayKey = new Date().toISOString().slice(0, 10);
    localStorage.setItem("skillverse_study_session_sec", studySeconds.toString());
    localStorage.setItem(`skillverse_today_total_sec_${todayKey}`, todayTotalSeconds.toString());
    localStorage.setItem("skillverse_study_subject", selectedStudySubject);
    localStorage.setItem("skillverse_timer_is_running", isTimerRunning.toString());
  }, [studySeconds, todayTotalSeconds, selectedStudySubject, isTimerRunning]);

  // 4. Auto-save on page exit / refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isHydrated.current) return;
      const todayKey = new Date().toISOString().slice(0, 10);
      localStorage.setItem("skillverse_study_session_sec", studySeconds.toString());
      localStorage.setItem(`skillverse_today_total_sec_${todayKey}`, todayTotalSeconds.toString());
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [studySeconds, todayTotalSeconds]);

  const toggleTimer = () => {
    const nextState = !isTimerRunning;
    setIsTimerRunning(nextState);
    if (!nextState) {
      // Auto-save on pause
      const todayKey = new Date().toISOString().slice(0, 10);
      localStorage.setItem(`skillverse_today_total_sec_${todayKey}`, todayTotalSeconds.toString());
      setToastMessage("✓ Session paused & auto-saved to record!");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const resetTimer = () => {
    setStudySeconds(0);
    if (typeof window !== "undefined") {
      localStorage.setItem("skillverse_study_session_sec", "0");
    }
    setToastMessage("✓ Session stopwatch reset! Daily total remains saved.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const manualSaveLog = () => {
    if (typeof window !== "undefined") {
      const todayKey = new Date().toISOString().slice(0, 10);
      localStorage.setItem("skillverse_study_session_sec", studySeconds.toString());
      localStorage.setItem(`skillverse_today_total_sec_${todayKey}`, todayTotalSeconds.toString());
    }
    const tot = formatTimer(todayTotalSeconds);
    setToastMessage(`✓ Saved! Total recorded today: ${tot.h}h ${tot.m}m ${tot.s}s`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const formatTimer = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return {
      h: h.toString().padStart(2, "0"),
      m: m.toString().padStart(2, "0"),
      s: s.toString().padStart(2, "0"),
    };
  };

  const currentFormatted = formatTimer(studySeconds);
  const todayFormatted = formatTimer(todayTotalSeconds);

  // Daily Check-In & Streak State (Fully Functional)
  const todayDayIndex = (() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1; // 0 = Monday, 6 = Sunday
  })();

  const [streakDays, setStreakDays] = useState(32);
  const [checkedDays, setCheckedDays] = useState<boolean[]>([true, true, true, true, true, true, false]);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(true);
  const [checkInRewardToast, setCheckInRewardToast] = useState<string | null>(null);

  // AUTOMATIC DAILY CHECK-IN (Zero manual effort: logs on app visit)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const todayKey = new Date().toISOString().slice(0, 10);
    const lastCheckinDate = localStorage.getItem("skillverse_last_checkin_date");
    let currentStreak = parseInt(localStorage.getItem("skillverse_streak_days") || "32", 10);

    let weekCheckins = [true, true, true, true, true, true, false];
    const savedWeek = localStorage.getItem("skillverse_week_checkins");
    if (savedWeek) {
      try {
        const parsed = JSON.parse(savedWeek);
        if (Array.isArray(parsed) && parsed.length === 7) weekCheckins = parsed;
      } catch {}
    }

    // Auto-mark all past days and today as checked in
    for (let i = 0; i <= todayDayIndex; i++) {
      weekCheckins[i] = true;
    }

    // If new day, automatically advance streak and confirm check-in
    if (lastCheckinDate !== todayKey) {
      currentStreak += 1;
      localStorage.setItem("skillverse_last_checkin_date", todayKey);
      localStorage.setItem("skillverse_streak_days", currentStreak.toString());
      localStorage.setItem("skillverse_week_checkins", JSON.stringify(weekCheckins));
      setCheckInRewardToast(`✨ Daily check-in recorded automatically! Streak: ${currentStreak} days 🔥`);
      setTimeout(() => setCheckInRewardToast(null), 3500);
    }

    setStreakDays(currentStreak);
    setCheckedDays(weekCheckins);
    setHasCheckedInToday(true);
  }, [todayDayIndex]);

  // Optional manual toggle if user clicks on specific days
  const handleCheckIn = (dayIdx?: number) => {
    const targetIdx = dayIdx !== undefined ? dayIdx : todayDayIndex;
    const isCurrentlyChecked = checkedDays[targetIdx];
    const willBeChecked = !isCurrentlyChecked;
    const newChecked = [...checkedDays];
    newChecked[targetIdx] = willBeChecked;
    setCheckedDays(newChecked);

    if (targetIdx === todayDayIndex) {
      setHasCheckedInToday(willBeChecked);
      const todayKey = new Date().toISOString().slice(0, 10);
      const newStreak = willBeChecked ? streakDays + 1 : Math.max(1, streakDays - 1);
      setStreakDays(newStreak);
      localStorage.setItem("skillverse_streak_days", newStreak.toString());
    }

    localStorage.setItem("skillverse_week_checkins", JSON.stringify(newChecked));
  };

  // Weekly check-in rate percentage
  const checkinRate = Math.round((checkedDays.filter(Boolean).length / 7) * 100);

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* MAIN WEBSITE CONTENT (Clean, centered, editorial) */}
      <main className="w-full max-w-xl sm:max-w-2xl px-4 sm:px-6 pt-6 pb-28 space-y-6">
        
        {/* Greeting & Title */}
        <div>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-normal tracking-tight font-sans">
            Hello, Simatupang!
          </p>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-[#111110] dark:text-white tracking-tight leading-tight mt-0.5">
            Course Learning
          </h1>
        </div>

        {/* Filter Navigation Pills: [🔍 Search] [Overview] [Tasklist] [Schedule] */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* Black Circular Search Icon */}
          <button
            onClick={() => setSearchOpen(true)}
            className="w-10 h-10 rounded-full bg-[#111110] text-white flex items-center justify-center shrink-0 shadow-sm hover:scale-105 transition-transform"
            title="Search Courses"
          >
            <Search className="w-4 h-4 text-white" />
          </button>

          {/* Overview Pill */}
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "overview"
                ? "bg-white dark:bg-[#20201E] text-[#111110] dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm"
                : "text-gray-400 hover:text-black dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-800"
            }`}
          >
            Overview
          </button>

          {/* Tasklist Pill */}
          <button
            onClick={() => setActiveTab("tasklist")}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "tasklist"
                ? "bg-white dark:bg-[#20201E] text-[#111110] dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm"
                : "text-gray-400 hover:text-black dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-800"
            }`}
          >
            Tasklist
          </button>

          {/* Schedule Pill */}
          <button
            onClick={() => setActiveTab("schedule")}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "schedule"
                ? "bg-white dark:bg-[#20201E] text-[#111110] dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm"
                : "text-gray-400 hover:text-black dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-800"
            }`}
          >
            Schedule
          </button>
        </div>

        {/* TAB CONTENT */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            
            {/* 1. HERO RESUME LEARNING CARD (Exact 1:1 match with user reference) */}
            <Link
              href={`/student/courses/${activeCourse.id}/video`}
              className="block rounded-[32px] overflow-hidden relative shadow-lg group transition-transform hover:scale-[1.01] active:scale-[0.99] bg-gradient-to-b from-[#A4CBE3] via-[#91BFDF] to-[#7DAFD4]"
            >
              {/* Top-Left Pill: "Resume Learning" with Hourglass icon */}
              <div className="absolute top-4 left-4 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white/95 text-xs font-semibold shadow-sm">
                <span>⏳</span>
                <span>Resume Learning</span>
              </div>

              {/* Top-Right: Quick Image Switcher */}
              <button
                onClick={cycleHeroImage}
                className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white/95 text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                title={`Current: ${heroImages[currentImageIndex].label}. Click to switch photo`}
              >
                <span>📷</span>
                <span>Change Image</span>
              </button>

              {/* High-res clean image with proper face headroom */}
              <div className="relative w-full h-[320px] sm:h-[360px] flex items-end justify-center overflow-hidden">
                <img
                  src={heroImages[currentImageIndex].url}
                  alt={heroImages[currentImageIndex].label}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              </div>

              {/* Frosted Glass Floating Capsule Bar (Exact glassmorphism from reference image) */}
              <div className="absolute inset-x-3.5 bottom-3.5 z-20 backdrop-blur-md bg-white/40 dark:bg-black/40 border border-white/60 dark:border-white/20 rounded-2xl p-3 flex items-center justify-between shadow-xl">
                
                {/* Left: Remaining time with pie progress */}
                <div className="flex items-center gap-2.5 pl-1">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5 shadow-xs">
                    <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.3" />
                      <path d="M12 3a9 9 0 0 1 9 9h-9z" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-white/90 font-medium leading-none">Remaining</span>
                    <span className="text-xs font-bold text-white font-mono mt-0.5">12:42</span>
                  </div>
                </div>

                {/* Right: Modules completed with graduation cap */}
                <div className="flex items-center gap-2.5 pr-1">
                  <div className="w-8 h-8 rounded-full bg-[#E57835] text-white flex items-center justify-center shadow-xs">
                    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                      <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                    </svg>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-white/90 font-medium leading-none">All modules</span>
                    <span className="text-xs font-bold text-white mt-0.5">8 of 12</span>
                  </div>
                </div>

              </div>
            </Link>

            {/* 2. REAL-TIME STUDY FOCUS TIMER TILE (Premium Minimal Aesthetic) */}
            <div className="rounded-[30px] bg-white dark:bg-[#1A1A18] border border-gray-100 dark:border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-4 transition-all">
              
              {/* Header: Clean, balanced single-line row */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 dark:bg-orange-950/40 border border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-[#111110] dark:text-white leading-tight">
                      Active Study Timer
                    </h3>
                    <p className="text-[11px] text-gray-400 dark:text-neutral-400 font-sans">
                      Session tracker · Auto-saved
                    </p>
                  </div>
                </div>

                {/* Minimalist Live Status Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold">{isTimerRunning ? "Live Sync" : "Paused"}</span>
                </div>
              </div>

              {/* Main Timer Display & Action Controls */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F6F4EF]/70 dark:bg-[#20201E] border border-black/[0.04] dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Digital Clock */}
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-0.5">
                    Current Session
                  </span>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-3xl sm:text-4xl font-heading font-black text-[#111110] dark:text-white tracking-tight">
                      {currentFormatted.h}:{currentFormatted.m}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400 font-mono">
                      :{currentFormatted.s}
                    </span>
                    <span className="text-[11px] font-sans font-medium text-gray-400 dark:text-neutral-500 ml-2">
                      focus
                    </span>
                  </div>
                </div>

                {/* Minimalist Controls */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {/* Primary Play/Pause Button */}
                  <button
                    onClick={toggleTimer}
                    className={`h-9 px-4 rounded-full text-xs font-semibold flex items-center gap-2 transition-all shadow-xs active:scale-95 ${
                      isTimerRunning
                        ? "bg-[#111110] text-white hover:bg-black dark:bg-white dark:text-[#111110] dark:hover:bg-neutral-100"
                        : "bg-[#E57835] hover:bg-[#D56825] text-white"
                    }`}
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume</span>
                      </>
                    )}
                  </button>

                  {/* Auto-Saved Quick Flush Button */}
                  <button
                    onClick={manualSaveLog}
                    className="h-9 px-3.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors active:scale-95"
                    title="Click to sync session to record"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Auto-Saved</span>
                  </button>

                  {/* Reset Button */}
                  <button
                    onClick={resetTimer}
                    disabled={studySeconds === 0}
                    className="w-9 h-9 rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-neutral-400 hover:text-[#111110] dark:hover:text-white disabled:opacity-20 flex items-center justify-center transition-all active:scale-95"
                    title="Auto-saves current time & resets stopwatch"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* Subject Tag & Daily Summary Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 text-xs text-gray-500 dark:text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-gray-400 dark:text-neutral-500">Course Focus:</span>
                  <select
                    value={selectedStudySubject}
                    onChange={(e) => setSelectedStudySubject(e.target.value)}
                    className="text-xs font-semibold bg-gray-100/70 dark:bg-white/[0.05] border border-gray-200/60 dark:border-white/[0.08] rounded-lg px-2 py-1 text-[#111110] dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="CS-301: Neural Radiance Fields">CS-301 · Neural Radiance Fields</option>
                    <option value="DES-401: Spatial Design Critique">DES-401 · Spatial Design</option>
                    <option value="CS-402: Distributed Systems">CS-402 · Distributed Systems</option>
                    <option value="DS-305: Applied Machine Learning">DS-305 · Machine Learning</option>
                    <option value="General Reading & Research">General Research & Reading</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-gray-400 dark:text-neutral-500">Today Recorded:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-mono">
                    {todayFormatted.h}h {todayFormatted.m}m <span className="opacity-75">{todayFormatted.s}s</span>
                  </strong>
                </div>
              </div>

              {/* Toast confirmation */}
              {toastMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{toastMessage}</span>
                </div>
              )}

            </div>

            {/* 3. STATS SECTION: Learning Streak & Duration (Side-by-side on desktop, stacked on mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card A: Learning Streak & Interactive Daily Check-in */}
              <div className="rounded-[28px] bg-white dark:bg-[#20201E] border border-gray-100 dark:border-gray-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
                {/* Reward Toast Banner */}
                {checkInRewardToast && (
                  <div className="absolute inset-x-2 top-2 z-10 p-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-bold text-center shadow-lg animate-in fade-in slide-in-from-top-1">
                    {checkInRewardToast}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-orange-500/10 dark:bg-orange-950/30 flex items-center justify-center text-xs">
                        🔥
                      </div>
                      <div>
                        <span className="font-heading font-bold text-sm text-[#111110] dark:text-white block leading-tight">
                          Learning streak
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          Daily Check-in
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Circular Gauge */}
                    <div className="relative w-9 h-9 flex items-center justify-center">
                      <svg className="w-9 h-9 transform -rotate-90">
                        <circle cx="18" cy="18" r="14" stroke="currentColor" strokeWidth="2.5" className="text-gray-200 dark:text-gray-700" fill="transparent" />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          stroke="#FF6B35"
                          strokeWidth="2.5"
                          strokeDasharray="88"
                          strokeDashoffset={Math.max(0, 88 - (88 * checkinRate) / 100)}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-500"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-bold text-orange-600 dark:text-orange-400 font-mono">
                        {checkinRate}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between mb-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-heading font-extrabold text-[#111110] dark:text-white tracking-tight">
                        {streakDays}
                      </span>
                      <span className="text-sm font-normal text-gray-400 font-sans">
                        days
                      </span>
                    </div>

                    {/* Automatic Check-In Status Indicator */}
                    <div className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Auto-Checked In</span>
                    </div>
                  </div>
                </div>

                {/* Weekday consistency dots (Fully Interactive) */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60">
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => {
                      const isChecked = checkedDays[i];
                      const isToday = i === todayDayIndex;
                      return (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <span className={`text-[9px] font-semibold ${isToday ? "text-[#2563EB] font-bold" : ""}`}>
                            {day}
                          </span>
                          <button
                            onClick={() => handleCheckIn(i)}
                            title={isToday ? (isChecked ? "Today checked in! Click to toggle" : "Click to check in today") : `Day ${day} check-in`}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all hover:scale-110 active:scale-95 ${
                              isChecked
                                ? "bg-[#2563EB] text-white shadow-2xs"
                                : isToday
                                ? "bg-blue-500/10 border-2 border-dashed border-[#2563EB] text-[#2563EB] animate-pulse"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                          >
                            {isChecked ? "✓" : isToday ? "+" : ""}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Card B: Duration & Analytics (From Reference Right Screen) */}
              <div className="rounded-[28px] bg-white dark:bg-[#20201E] border border-gray-100 dark:border-gray-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Duration</span>
                  </div>

                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-4xl font-heading font-extrabold text-[#111110] dark:text-white tracking-tight">
                      248
                    </span>
                    <span className="text-sm font-semibold text-gray-500">h</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">Learning minutes this semester</p>
                </div>

                {/* Trend sparkline curve */}
                <div className="bg-gray-50 dark:bg-[#252522] rounded-2xl p-3 border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                    <span>300m</span>
                    <span>Week 1 Peak</span>
                  </div>
                  <svg className="w-full h-10 my-1" viewBox="0 0 100 30">
                    <path d="M0,25 Q30,22 50,15 T100,5" fill="none" stroke="#2563EB" strokeWidth="2.5" />
                  </svg>
                  <div className="flex items-center justify-between text-[10px] text-emerald-600 font-medium">
                    <span>+18% vs last week</span>
                    <span>Consistent</span>
                  </div>
                </div>
              </div>

            </div>

            {/* 3. MY ENROLLED COURSES SECTION */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Academic Courses
                </span>
                <Link href="/student/courses" className="text-xs text-orange-600 font-semibold hover:underline flex items-center gap-0.5">
                  <span>View full catalog</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {courses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/student/courses/${course.id}`}
                    className="p-4 rounded-2xl bg-white dark:bg-[#20201E] border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all flex items-center justify-between group shadow-2xs"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs font-mono">
                        {course.code.split("-")[0]}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-orange-600 transition-colors">
                          {course.title}
                        </h4>
                        <span className="text-[11px] text-gray-400">
                          {course.code} · {course.instructor?.full_name || "Faculty Director"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden sm:inline-block text-[11px] font-mono text-gray-400">
                        12 Lessons
                      </span>
                      <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TASKLIST TAB */}
        {activeTab === "tasklist" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Pending Assignments
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px]">
                {assignments.length} Tasks Due
              </span>
            </div>

            <div className="space-y-3">
              {assignments.map((task) => (
                <div
                  key={task.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#20201E] border border-gray-100 dark:border-gray-800 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                        {task.title}
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-semibold text-gray-400">
                      100 pts
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {task.description}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 font-mono">
                    <span>Due: {task.due_date}</span>
                    <button
                      onClick={() => alert(`Submitting work for: ${task.title}`)}
                      className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity"
                    >
                      Submit Assignment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCHEDULE TAB */}
        {activeTab === "schedule" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Weekly Class Timetable
              </span>
              <span className="text-xs text-blue-600 font-medium">Semester 2</span>
            </div>

            <div className="space-y-3">
              {[
                { time: "10:00 AM", title: "CS-301: Neural Radiance Fields & Vision", instructor: "Dr. Sarah Jenkins", room: "Auditorium Hall B" },
                { time: "02:15 PM", title: "DES-401: Spatial Design Critique Lab", instructor: "Prof. Elena Rostova", room: "Studio Lab 4" },
                { time: "04:30 PM", title: "CS-402: Distributed Consensus & Raft", instructor: "Dr. Michael Chen", room: "Computer Lab 12" },
              ].map((lecture, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white dark:bg-[#20201E] border border-gray-100 dark:border-gray-800 shadow-2xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="text-center px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 font-mono">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">{lecture.time.split(" ")[0]}</span>
                      <span className="text-[10px] text-gray-400 block">{lecture.time.split(" ")[1]}</span>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                        {lecture.title}
                      </h4>
                      <span className="text-xs text-gray-400">
                        {lecture.instructor} · {lecture.room}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/student/courses/cs301/video"
                    className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Quick Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#20201E] w-full max-w-md rounded-3xl p-5 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <span className="font-heading font-bold text-sm text-gray-900 dark:text-white">Search Academic Library</span>
              <button
                onClick={() => setSearchOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                autoFocus
                placeholder="Search courses, modules, video chapters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredCourses.map((c) => (
                <Link
                  key={c.id}
                  href={`/student/courses/${c.id}`}
                  onClick={() => setSearchOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{c.title}</div>
                    <div className="text-[10px] text-gray-400">{c.code} · {c.instructor?.full_name || "Faculty"}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
