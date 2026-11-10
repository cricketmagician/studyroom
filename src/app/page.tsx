"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Video,
  CheckSquare,
  TrendingUp,
  Trophy,
  Calendar,
  Bell,
  Search,
  ArrowUpRight,
  Star,
  Clock,
  Award,
  Play,
  User,
  Home,
  BarChart3,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Bookmark,
  Flame,
  FileText,
  Compass,
  ArrowRight,
  HelpCircle,
  X,
  Target,
  GraduationCap,
} from "lucide-react";

// The 6 Modules from Image 1: Recommended App Structure
interface StudyModule {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bgPastel: string;
  borderPastel: string;
  count: string;
}

const MODULES: StudyModule[] = [
  {
    id: "library",
    title: "Study Library",
    subtitle: "PDFs, notes and books",
    icon: BookOpen,
    color: "#8B5CF6",
    bgPastel: "#F4EFFE",
    borderPastel: "#E5DAFA",
    count: "48 Books & Notes",
  },
  {
    id: "lectures",
    title: "Video Lectures",
    subtitle: "Recorded classes",
    icon: Video,
    color: "#10B981",
    bgPastel: "#EAF7EE",
    borderPastel: "#D2EFE0",
    count: "124 Videos",
  },
  {
    id: "practice",
    title: "Practice Zone",
    subtitle: "MCQs and mock tests",
    icon: CheckSquare,
    color: "#F59E0B",
    bgPastel: "#FEF7EC",
    borderPastel: "#FDEBCB",
    count: "1,200+ Questions",
  },
  {
    id: "analytics",
    title: "Study Analytics",
    subtitle: "Subject-wise study hours",
    icon: TrendingUp,
    color: "#3B82F6",
    bgPastel: "#EFF6FE",
    borderPastel: "#DBEAFE",
    count: "42h This Month",
  },
  {
    id: "challenges",
    title: "Friend Challenges",
    subtitle: "Study competitions",
    icon: Trophy,
    color: "#EC4899",
    bgPastel: "#FDF2F8",
    borderPastel: "#FCE7F3",
    count: "Rank #4 in Group",
  },
  {
    id: "planner",
    title: "Study Planner",
    subtitle: "Goals and exam countdown",
    icon: Calendar,
    color: "#06B6D4",
    bgPastel: "#ECFEFF",
    borderPastel: "#CFFAFE",
    count: "48 Days to Exam",
  },
];

export default function CMALearningDashboard() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [activeModuleModal, setActiveModuleModal] = useState<StudyModule | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const user = {
    name: "Neeraj Singh",
    role: "CMA Aspirant",
    streakDays: 6,
    examCountdown: 48,
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF9F5] text-[#111110] font-absans flex flex-col lg:flex-row select-none">
      {/* =============================================================== */}
      {/* DESKTOP SIDEBAR (Full width desktop dashboard studio)           */}
      {/* =============================================================== */}
      <aside className="hidden lg:flex w-64 bg-[#FCFBF8] border-r border-[#EFECE6] flex-col justify-between p-6 shrink-0 sticky top-0 h-screen select-none">
        <div className="space-y-8">
          {/* Brand & Recommended Tag */}
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7EE] text-[#059669] text-[11px] font-semibold border border-[#D1F2DD]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Recommended App Structure
            </span>
            <div className="flex items-center gap-2.5 pt-1">
              <div className="w-8 h-8 rounded-xl bg-[#111110] text-white flex items-center justify-center shadow-xs">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-apfel text-sm font-bold tracking-tight text-[#111110]">
                  CMA Study Hub
                </h1>
                <p className="text-[10px] text-[#88867E]">Student learning dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { id: "home", label: "Dashboard", icon: Home },
              { id: "library", label: "Study Library", icon: BookOpen },
              { id: "lectures", label: "Video Lectures", icon: Video },
              { id: "practice", label: "Practice Zone", icon: CheckSquare },
              { id: "analytics", label: "Study Analytics", icon: BarChart3 },
              { id: "challenges", label: "Friend Challenges", icon: Trophy },
              { id: "planner", label: "Study Planner", icon: Calendar },
            ].map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-[13px] font-medium flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#111110] text-white shadow-xs font-semibold"
                      : "text-[#666560] hover:text-[#111110] hover:bg-[#F3EFE7]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#88867E]"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: User Profile */}
        <div className="pt-4 border-t border-[#EFECE6] space-y-3">
          <div className="p-3 rounded-2xl bg-gradient-to-b from-[#F8F6F2] to-[#EAE5DC] border border-[#E8E2D6] space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-apfel font-bold text-[#111110]">CMA Inter Group 1</span>
              <span className="font-mono text-[10px] text-emerald-700 font-semibold">
                {user.examCountdown}d left
              </span>
            </div>
            <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden mt-1.5">
              <div className="h-full bg-[#10B981] rounded-full" style={{ width: "68%" }} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#111110] text-white flex items-center justify-center font-apfel text-xs font-bold">
                {user.name.slice(0, 2)}
              </div>
              <div className="truncate max-w-[110px]">
                <div className="text-xs font-bold text-[#111110] truncate">{user.name}</div>
                <div className="text-[10px] text-[#88867E] truncate">{user.role}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 font-apfel font-bold text-amber-500 text-[11px] px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/60">
              <Flame className="w-3 h-3 fill-amber-500" />
              <span>{user.streakDays}D</span>
            </div>
          </div>
        </div>
      </aside>

      {/* =============================================================== */}
      {/* MAIN CONTENT AREA                                               */}
      {/* =============================================================== */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden pb-24 lg:pb-12">
        {/* Top Header Bar */}
        <header className="h-16 px-6 lg:px-10 border-b border-[#EFECE6] bg-[#FAF9F5]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30 select-none">
          {/* Left: User Avatar & Welcome Details */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#111110] text-white flex items-center justify-center font-apfel text-xs font-bold shadow-xs">
              {user.name.slice(0, 2)}
            </div>
            <div>
              <div className="text-xs font-apfel font-bold text-[#111110] flex items-center gap-1.5">
                <span>{user.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAF7EE] text-[#059669] font-medium border border-[#D1F2DD]">
                  {user.role}
                </span>
              </div>
              <div className="text-[11px] text-[#88867E] font-absans">
                Target: CMA Intermediate 2026
              </div>
            </div>
          </div>

          {/* Right Header: Search & Bell */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#EBE8E1] text-xs text-[#88867E] shadow-2xs w-60">
              <Search className="w-3.5 h-3.5 text-[#AAA79E]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, MCQs, lectures..."
                className="bg-transparent border-none outline-none text-xs text-[#111110] placeholder-[#AAA79E] w-full"
              />
            </div>

            <button
              className="w-10 h-10 rounded-full bg-white border border-[#EBE8E1] flex items-center justify-center text-[#666560] hover:text-[#111110] transition-colors relative cursor-pointer shadow-2xs"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#FF5F56] ring-2 ring-white" />
            </button>
          </div>
        </header>

        {/* Dashboard Main Canvas */}
        <main className="flex-1 p-6 lg:p-10 max-w-6xl w-full mx-auto space-y-8">
          {/* Hero Greeting from Image 2 */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-apfel font-bold tracking-tight text-[#111110]">
              Welcome Back, Learner! 🎓
            </h1>
            <p className="text-sm text-[#77756F] font-absans">
              Continue Your Learning Journey And Achieve Your Goals.
            </p>
          </div>

          {/* ============================================================= */}
          {/* 4 PASTEL SQUIRCLE STAT CARDS (Image 2 style)                   */}
          {/* ============================================================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Lilac/Pink Pastel */}
            <div className="p-5 rounded-[24px] bg-[#F6EEFA] border border-[#ECDDF4] shadow-[0_4px_16px_-4px_rgba(139,92,246,0.06)] flex flex-col justify-between space-y-3 transition-transform hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-full bg-white/90 text-[#8B5CF6] flex items-center justify-center shadow-xs">
                  <Star className="w-4 h-4 fill-[#8B5CF6]/20 text-[#8B5CF6]" />
                </div>
                <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]/40" />
              </div>
              <div>
                <div className="text-2xl font-apfel font-bold text-[#111110]">3 Lessons</div>
                <div className="text-xs text-[#6B5A79] font-absans mt-0.5">
                  Total Completed Courses
                </div>
              </div>
            </div>

            {/* Card 2: Mint Green Pastel */}
            <div className="p-5 rounded-[24px] bg-[#EAF6EE] border border-[#D6EFE0] shadow-[0_4px_16px_-4px_rgba(16,185,129,0.06)] flex flex-col justify-between space-y-3 transition-transform hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-full bg-white/90 text-[#10B981] flex items-center justify-center shadow-xs">
                  <Clock className="w-4 h-4 text-[#10B981]" />
                </div>
                <Sparkles className="w-3.5 h-3.5 text-[#10B981]/40" />
              </div>
              <div>
                <div className="text-2xl font-apfel font-bold text-[#111110]">24 Hours</div>
                <div className="text-xs text-[#456A52] font-absans mt-0.5">
                  Total Classes Watched
                </div>
              </div>
            </div>

            {/* Card 3: Amber/Peach Pastel */}
            <div className="p-5 rounded-[24px] bg-[#FFF6EB] border border-[#FCE9D0] shadow-[0_4px_16px_-4px_rgba(245,158,11,0.06)] flex flex-col justify-between space-y-3 transition-transform hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-full bg-white/90 text-[#F59E0B] flex items-center justify-center shadow-xs">
                  <Award className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]/40" />
              </div>
              <div>
                <div className="text-2xl font-apfel font-bold text-[#111110]">87%</div>
                <div className="text-xs text-[#7B5B2E] font-absans mt-0.5">
                  Scored On Your Last Quiz
                </div>
              </div>
            </div>

            {/* Card 4: Soft Blue Pastel */}
            <div className="p-5 rounded-[24px] bg-[#EDF4FD] border border-[#D7E6FA] shadow-[0_4px_16px_-4px_rgba(59,130,246,0.06)] flex flex-col justify-between space-y-3 transition-transform hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-full bg-white/90 text-[#3B82F6] flex items-center justify-center shadow-xs">
                  <TrendingUp className="w-4 h-4 text-[#3B82F6]" />
                </div>
                <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]/40" />
              </div>
              <div>
                <div className="text-2xl font-apfel font-bold text-[#111110]">+15%</div>
                <div className="text-xs text-[#4A6487] font-absans mt-0.5">
                  Total Progress This Week
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================= */}
          {/* FEATURED: "CONTINUE LEARNING" HERO CARD (Image 2 design)       */}
          {/* ============================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-apfel font-bold text-[#111110]">Continue Learning</h2>
              <span className="text-xs font-absans text-[#88867E] hover:text-[#111110] cursor-pointer">
                View All Courses
              </span>
            </div>

            <div className="w-full rounded-[30px] bg-gradient-to-br from-[#D8EFE4] to-[#CDE8DC] border border-[#BDE0D0] p-6 sm:p-8 relative overflow-hidden shadow-[0_8px_24px_-6px_rgba(16,185,129,0.12)]">
              {/* Organic Curved Ribbon Vector Background (from Image 2) */}
              <svg
                viewBox="0 0 400 200"
                className="absolute right-0 bottom-0 w-80 sm:w-96 h-auto text-[#62B591]/25 pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="18"
                strokeLinecap="round"
              >
                <path d="M 50 180 C 180 50, 320 250, 380 40" />
                <path d="M 120 200 C 240 100, 340 190, 390 100" strokeWidth="8" />
              </svg>

              <div className="relative z-10 space-y-4 max-w-lg">
                {/* Pill Badges */}
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm text-[#059669] text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Beginner</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/90 text-[#333333] text-xs font-mono font-medium flex items-center gap-1.5 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-[#666666]" />
                    <span>45 Min</span>
                  </span>
                </div>

                {/* Course Title & Description */}
                <div className="space-y-1.5">
                  <h3 className="text-xl sm:text-2xl font-apfel font-bold text-[#0F291E] tracking-tight">
                    Cost &amp; Management Accounting
                  </h3>
                  <p className="text-xs sm:text-sm text-[#275340] font-absans leading-relaxed">
                    Marginal Costing, Break-Even Analysis &amp; Standard Cost Variance
                  </p>
                </div>

                {/* Bottom Row: Progress + White Circle Action Button */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="text-xs sm:text-sm font-apfel font-bold text-[#0F291E]">
                    9 Of 12 Lessons
                  </div>

                  <button
                    onClick={() => setActiveModuleModal(MODULES[1])}
                    className="w-11 h-11 rounded-full bg-white text-[#0F291E] hover:scale-105 active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.08)] flex items-center justify-center cursor-pointer group"
                    title="Resume Course"
                  >
                    <ArrowUpRight className="w-5 h-5 text-[#0F291E] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================= */}
          {/* THE 6 MODULES: RECOMMENDED APP STRUCTURE (Image 1)             */}
          {/* ============================================================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-apfel font-bold text-[#111110]">
                  CMA Study Hub Modules
                </h2>
                <p className="text-xs text-[#88867E]">
                  Structured learning ecosystem for comprehensive exam preparation
                </p>
              </div>
              <span className="text-xs font-mono text-[#88867E]">6 Core Modules</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MODULES.map((mod) => {
                const Icon = mod.icon;
                return (
                  <div
                    key={mod.id}
                    onClick={() => setActiveModuleModal(mod)}
                    className="p-5 rounded-[24px] bg-white border border-[#EBE8E1] hover:border-[#D0CABE] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
                        style={{ backgroundColor: mod.bgPastel, color: mod.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-mono text-[#88867E] bg-[#FAF9F5] px-2.5 py-1 rounded-full border border-[#EFECE6]">
                        {mod.count}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-apfel font-bold text-base text-[#111110] group-hover:text-[#000]">
                          {mod.title}
                        </h3>
                        <ArrowRight className="w-4 h-4 text-[#C4C2BC] group-hover:text-[#111110] group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-xs text-[#77756F] font-absans">{mod.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Study Timetable Row */}
          <div className="p-6 rounded-[28px] bg-white border border-[#EBE8E1] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F5F3ED]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#10B981]" />
                <h3 className="font-apfel font-bold text-sm text-[#111110]">
                  Today&apos;s Target Revision Schedule
                </h3>
              </div>
              <span className="text-xs font-mono text-[#88867E]">2 of 3 Done</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  time: "09:00 - 10:15",
                  sub: "Financial Accounting",
                  topic: "Accounting for Consignment",
                  done: true,
                },
                {
                  time: "11:30 - 12:45",
                  sub: "Cost Accounting",
                  topic: "Marginal Costing MCQs",
                  done: true,
                },
                {
                  time: "15:00 - 16:30",
                  sub: "Direct Taxation",
                  topic: "Capital Gains & Deductions 80C",
                  done: false,
                },
              ].map((task, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    task.done
                      ? "bg-[#F7FBF8] border-[#D6EFE0]"
                      : "bg-[#FCFBF9] border-[#EBE8E1]"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-[#88867E]">{task.time}</span>
                    <div
                      className={`text-xs font-apfel font-bold ${
                        task.done ? "line-through text-[#88867E]" : "text-[#111110]"
                      }`}
                    >
                      {task.sub}
                    </div>
                    <div className="text-[11px] text-[#77756F] truncate max-w-[160px]">
                      {task.topic}
                    </div>
                  </div>
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      task.done ? "bg-[#10B981] text-white" : "border border-[#D0CABE] text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* =============================================================== */}
        {/* FLOATING DARK CAPSULE DOCK NAVBAR (Image 2 mobile view)         */}
        {/* =============================================================== */}
        <div className="fixed bottom-5 inset-x-0 flex justify-center z-40 px-4 pointer-events-none lg:hidden">
          <nav className="pointer-events-auto flex items-center justify-between gap-1 p-1.5 rounded-full bg-[#111110] shadow-[0_12px_36px_-6px_rgba(0,0,0,0.35)] border border-white/10 text-white w-full max-w-xs">
            {[
              { id: "home", icon: Home, label: "Home" },
              { id: "library", icon: BookOpen, label: "Library" },
              { id: "lectures", icon: Play, label: "Lectures" },
              { id: "analytics", icon: BarChart3, label: "Stats" },
              { id: "profile", icon: User, label: "Profile" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isActive ? "bg-white text-[#111110] shadow-sm scale-105" : "text-[#999999] hover:text-white"
                  }`}
                  title={tab.label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* =============================================================== */}
      {/* MODULE DETAIL PREVIEW MODAL                                     */}
      {/* =============================================================== */}
      {activeModuleModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in select-none">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[#EBE8E1] p-6 space-y-5 animate-in slide-in-from-bottom duration-200 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: activeModuleModal.bgPastel,
                    color: activeModuleModal.color,
                  }}
                >
                  <activeModuleModal.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-apfel text-lg font-bold text-[#111110]">
                    {activeModuleModal.title}
                  </h3>
                  <p className="text-xs text-[#77756F] font-absans">
                    {activeModuleModal.subtitle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModuleModal(null)}
                className="p-1.5 rounded-full text-[#88867E] hover:text-[#111110] hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EBE8E1] space-y-2">
              <span className="text-[11px] font-mono text-[#88867E] uppercase tracking-wider block">
                Available Resources
              </span>
              <div className="text-sm font-apfel font-bold text-[#111110]">
                {activeModuleModal.count}
              </div>
              <p className="text-xs text-[#666560] leading-relaxed">
                Structured for ICAI / ICMAI Syllabus. Includes past year questions, revision RTPs,
                and chapter-wise mock tests.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setActiveModuleModal(null)}
                className="flex-1 py-3 rounded-xl bg-[#111110] text-white hover:bg-black font-apfel font-semibold text-xs tracking-wide uppercase transition-colors cursor-pointer"
              >
                Enter {activeModuleModal.title}
              </button>
              <button
                onClick={() => setActiveModuleModal(null)}
                className="px-4 py-3 rounded-xl border border-[#EBE8E1] text-[#666560] hover:text-[#111110] hover:bg-gray-50 text-xs font-absans font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
