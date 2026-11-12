"use client";

import React, { useState, useEffect } from "react";
import { Flame, X, Check, Sparkles, Clock, BookOpen, ArrowRight, Trophy } from "lucide-react";
import { dayKey, weekKeys } from "@/lib/streak";

export interface CheckinResult {
  subject: string;
  durationMinutes: number;
}

interface DailyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartStudy: (result: CheckinResult) => void;
  initialStreak?: number;
}

const CMA_SUBJECTS = [
  {
    id: "cost",
    paperCode: "Paper 8",
    name: "Cost Accounting",
    topic: "Marginal Costing & Break-Even",
    color: "#10B981",
    bgPastel: "#EAF7EE",
    borderPastel: "#D1F2DD",
    icon: "📊",
  },
  {
    id: "financial",
    paperCode: "Paper 6",
    name: "Financial Accounting",
    topic: "Consignment & Company Accounts",
    color: "#8B5CF6",
    bgPastel: "#F4EFFE",
    borderPastel: "#E5DAFA",
    icon: "📑",
  },
  {
    id: "tax",
    paperCode: "Paper 7",
    name: "Direct & Indirect Taxation",
    topic: "Capital Gains, GST & Deductions",
    color: "#F59E0B",
    bgPastel: "#FFF6EB",
    borderPastel: "#FCE9D0",
    icon: "🏛️",
  },
  {
    id: "law",
    paperCode: "Paper 5",
    name: "Business Laws & Ethics",
    topic: "Companies Act & Commercial Law",
    color: "#3B82F6",
    bgPastel: "#EFF6FE",
    borderPastel: "#DBEAFE",
    icon: "⚖️",
  },
];

const TARGET_DURATIONS = [
  { label: "25m", minutes: 25, tag: "Pomodoro" },
  { label: "45m", minutes: 45, tag: "Standard" },
  { label: "60m", minutes: 60, tag: "Deep Work" },
  { label: "90m", minutes: 90, tag: "Intensive" },
];

export function DailyCheckinModal({
  isOpen,
  onClose,
  onStartStudy,
  initialStreak = 7,
}: DailyCheckinModalProps) {
  const [selectedSubject, setSelectedSubject] = useState(CMA_SUBJECTS[0].name);
  const [selectedDuration, setSelectedDuration] = useState(45);
  const [streakCount, setStreakCount] = useState(initialStreak);
  const [hasClaimed, setHasClaimed] = useState(false);

  const today = new Date();
  const currentWeek = weekKeys(today);
  const todayKeyStr = dayKey(today);

  const handleClaimAndStart = () => {
    // Save checkin timestamp
    try {
      localStorage.setItem("cma_last_checkin", todayKeyStr);
    } catch {}

    onStartStudy({
      subject: selectedSubject,
      durationMinutes: selectedDuration,
    });
  };

  const handleCheckinOnly = () => {
    try {
      localStorage.setItem("cma_last_checkin", todayKeyStr);
    } catch {}
    setHasClaimed(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-[32px] bg-[#FAF9F5] border border-[#EBE8E1] p-6 sm:p-7 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header Row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-md">
              <Flame className="w-6 h-6 fill-white" />
            </div>
            <div>
              <span className="text-[10px] tabular-nums uppercase tracking-wider text-[#059669] font-bold bg-[#EAF7EE] px-2 py-0.5 rounded-full border border-[#D1F2DD]">
                Daily Check-in
              </span>
              <h2 className="text-xl sm:text-2xl font-apfel font-bold text-[#111110] tracking-tight mt-0.5">
                Welcome to Day {streakCount}!
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#71717A] hover:text-[#111110] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 7-Day Streak Week Tracker */}
        <div className="p-4 rounded-2xl bg-white border border-[#EBE8E1] space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-absans">
            <span className="font-bold text-[#111110] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Weekly Consistency</span>
            </span>
            <span className="tabular-nums text-[#059669] font-semibold text-[11px]">
              Streak Active 🔥
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {["M", "T", "W", "T", "F", "S", "S"].map((dayName, idx) => {
              const isToday = idx === 4; // e.g. Friday active
              const isPast = idx < 4;
              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs tabular-nums font-bold transition-all ${
                      isToday
                        ? "bg-amber-500 text-white shadow-xs scale-105 ring-2 ring-amber-300"
                        : isPast
                        ? "bg-[#EAF7EE] text-[#059669] border border-[#D1F2DD]"
                        : "bg-[#F4F4F5] text-[#A1A1AA]"
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : dayName}
                  </div>
                  <span className="text-[10px] text-[#88867E] font-medium">{dayName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Choose Subject */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs tabular-nums uppercase tracking-wider text-[#71717A] font-semibold">
              1. Choose Today&apos;s Subject
            </label>
            <span className="text-[11px] text-[#88867E]">CMA Inter Group 1</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CMA_SUBJECTS.map((sub) => {
              const isSelected = selectedSubject === sub.name;
              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub.name)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-white border-[#111110] shadow-sm ring-1 ring-[#111110]"
                      : "bg-white/80 border-[#EBE8E1] hover:border-[#D0CABE]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="text-xl shrink-0">{sub.icon}</span>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-[10px] tabular-nums font-semibold px-1.5 py-0.2 rounded bg-black/5 text-[#71717A]">
                          {sub.paperCode}
                        </span>
                        <span className="text-xs font-apfel font-bold text-[#111110] truncate">
                          {sub.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#71717A] truncate font-absans mt-0.5">
                        {sub.topic}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs ${
                      isSelected
                        ? "bg-[var(--brand)] text-[var(--on-brand)]"
                        : "border border-[#D4D4D8] text-transparent"
                    }`}
                  >
                    ✓
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Target Focus Duration */}
        <div className="space-y-2">
          <label className="text-xs tabular-nums uppercase tracking-wider text-[#71717A] font-semibold block">
            2. Target Study Session
          </label>

          <div className="grid grid-cols-4 gap-2">
            {TARGET_DURATIONS.map((dur) => {
              const isSelected = selectedDuration === dur.minutes;
              return (
                <button
                  key={dur.minutes}
                  onClick={() => setSelectedDuration(dur.minutes)}
                  className={`py-2 px-1 rounded-xl text-center border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[var(--brand)] text-[var(--on-brand)] border-[#111110] shadow-xs"
                      : "bg-white text-[#4B5563] border-[#EBE8E1] hover:border-[#D0CABE]"
                  }`}
                >
                  <div className="text-xs tabular-nums font-bold">{dur.label}</div>
                  <div className="text-[9px] opacity-75 truncate">{dur.tag}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleClaimAndStart}
            className="w-full py-3.5 rounded-2xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-[var(--on-brand)] font-apfel font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Start Study Session</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={handleCheckinOnly}
            className="w-full py-2.5 rounded-xl text-xs font-absans font-medium text-[#71717A] hover:text-[#111110] transition-colors cursor-pointer"
          >
            Check In Only (I&apos;ll Study Later)
          </button>
        </div>
      </div>
    </div>
  );
}
