"use client";

import React, { useState } from "react";
import { ArrowLeft, Target } from "lucide-react";

type TimeRange = "today" | "week" | "month";

interface SubjectSlice {
  name: string;
  time: string;
  minutes: number;
  color: string;
  pct: number;
}

interface DayTrend {
  day: string;
  label: string;
  hours: number;
  timeStr: string;
  isToday?: boolean;
}

const DATA_BY_RANGE: Record<
  TimeRange,
  {
    totalStr: string;
    totalMin: number;
    goalStr: string;
    goalMin: number;
    pct: number;
    subjects: SubjectSlice[];
    trend: DayTrend[];
  }
> = {
  today: {
    totalStr: "5 h 20 m",
    totalMin: 320,
    goalStr: "6 h 00 m",
    goalMin: 360,
    pct: 88,
    subjects: [
      { name: "Financial Accounting", time: "2h 10m", minutes: 130, color: "#2EC486", pct: 40.6 },
      { name: "Cost Accounting", time: "1h 05m", minutes: 65, color: "#FB7185", pct: 20.3 },
      { name: "Taxation", time: "50m", minutes: 50, color: "#60A5FA", pct: 15.6 },
      { name: "Business Laws", time: "45m", minutes: 45, color: "#F472B6", pct: 14.1 },
      { name: "Others", time: "30m", minutes: 30, color: "#A5B4FC", pct: 9.4 },
    ],
    trend: [
      { day: "Mon", label: "Monday", hours: 2.3, timeStr: "2h 20m" },
      { day: "Tue", label: "Tuesday", hours: 3.5, timeStr: "3h 30m" },
      { day: "Wed", label: "Wednesday", hours: 3.0, timeStr: "3h 00m" },
      { day: "Thu", label: "Thursday", hours: 3.9, timeStr: "3h 55m" },
      { day: "Fri", label: "Friday (Today)", hours: 5.33, timeStr: "5h 20m", isToday: true },
      { day: "Sat", label: "Saturday", hours: 3.1, timeStr: "3h 05m" },
      { day: "Sun", label: "Sunday", hours: 4.4, timeStr: "4h 25m" },
    ],
  },
  week: {
    totalStr: "31 h 45 m",
    totalMin: 1905,
    goalStr: "36 h 00 m",
    goalMin: 2160,
    pct: 88,
    subjects: [
      { name: "Financial Accounting", time: "12h 40m", minutes: 760, color: "#2EC486", pct: 40 },
      { name: "Cost Accounting", time: "7h 15m", minutes: 435, color: "#FB7185", pct: 23 },
      { name: "Taxation", time: "5h 20m", minutes: 320, color: "#60A5FA", pct: 17 },
      { name: "Business Laws", time: "4h 10m", minutes: 250, color: "#F472B6", pct: 13 },
      { name: "Others", time: "2h 20m", minutes: 140, color: "#A5B4FC", pct: 7 },
    ],
    trend: [
      { day: "W1", label: "Week 1", hours: 28.5, timeStr: "28h 30m" },
      { day: "W2", label: "Week 2", hours: 30.0, timeStr: "30h 00m" },
      { day: "W3", label: "Week 3", hours: 27.2, timeStr: "27h 15m" },
      { day: "W4", label: "Week 4 (Current)", hours: 31.75, timeStr: "31h 45m", isToday: true },
    ],
  },
  month: {
    totalStr: "128 h 10 m",
    totalMin: 7690,
    goalStr: "150 h 00 m",
    goalMin: 9000,
    pct: 85,
    subjects: [
      { name: "Financial Accounting", time: "52h 00m", minutes: 3120, color: "#2EC486", pct: 41 },
      { name: "Cost Accounting", time: "30h 10m", minutes: 1810, color: "#FB7185", pct: 24 },
      { name: "Taxation", time: "22h 30m", minutes: 1350, color: "#60A5FA", pct: 17 },
      { name: "Business Laws", time: "15h 30m", minutes: 930, color: "#F472B6", pct: 12 },
      { name: "Others", time: "8h 00m", minutes: 480, color: "#A5B4FC", pct: 6 },
    ],
    trend: [
      { day: "Aug", label: "August", hours: 95, timeStr: "95h" },
      { day: "Sep", label: "September", hours: 110, timeStr: "110h" },
      { day: "Oct", label: "October", hours: 122, timeStr: "122h" },
      { day: "Nov", label: "November", hours: 128.1, timeStr: "128h 10m", isToday: true },
    ],
  },
};

interface StudyTrackerProps {
  onBack?: () => void;
  showBack?: boolean;
  className?: string;
}

export function StudyTracker({ onBack, showBack = true, className = "" }: StudyTrackerProps) {
  const [range, setRange] = useState<TimeRange>("today");
  const data = DATA_BY_RANGE[range];

  // SVG Donut metrics
  const radius = 54;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className={`space-y-5 max-w-xl mx-auto w-full select-none ${className}`}>
      {/* Top Header Row with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-white border border-[#EBE8E1] hover:bg-gray-50 flex items-center justify-center text-[#111110] transition-colors cursor-pointer shadow-2xs"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <h2 className="text-xl sm:text-2xl font-apfel font-bold text-[#111110] tracking-tight">
            Study Tracker
          </h2>
        </div>

        {/* Range Segmented Pill Switcher */}
        <div className="p-1 rounded-full bg-[#EBECEE] flex items-center gap-0.5 text-xs font-absans">
          {(
            [
              { id: "today", label: "Today" },
              { id: "week", label: "This Week" },
              { id: "month", label: "This Month" },
            ] as const
          ).map((t) => {
            const active = range === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setRange(t.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-[#18181B] text-white shadow-xs"
                    : "text-[#666560] hover:text-[#18181B]"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* =============================================================== */}
      {/* CARD 1: Total Study Time (Mint Green Pastel Wave Card)          */}
      {/* =============================================================== */}
      <div className="p-6 rounded-[28px] bg-gradient-to-br from-[#D8F2E4] to-[#C7EBD7] border border-[#BCE1CD] shadow-[0_4px_20px_-4px_rgba(16,185,129,0.12)] relative overflow-hidden space-y-4">
        {/* Soft Wave Vector Background */}
        <svg
          viewBox="0 0 320 120"
          className="absolute right-0 top-0 w-64 h-auto text-[#62B591]/25 pointer-events-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="14"
        >
          <path d="M 0 30 C 90 80, 180 -10, 320 40" />
        </svg>

        <div className="flex items-start justify-between relative z-10">
          <div>
            <span className="text-xs font-absans font-medium text-[#204936]">
              Total Study Time
            </span>
            <div className="text-3xl sm:text-4xl font-apfel font-bold text-[#0F291E] tracking-tight mt-1">
              {data.totalStr}
            </div>
          </div>

          {/* Goal Squircle Badge */}
          <div className="px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-xs border border-white/60 shadow-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-[#EF4444]">
              <Target className="w-4 h-4 text-[#EF4444]" />
            </div>
            <div>
              <div className="text-[10px] text-[#71717A] font-medium leading-none">Goal</div>
              <div className="text-xs font-mono font-bold text-[#18181B] mt-0.5">
                {data.goalStr}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar + Percentage */}
        <div className="flex items-center gap-3 pt-1 relative z-10">
          <div className="flex-1 h-3 rounded-full bg-white/70 overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full rounded-full bg-[#10B981] transition-all duration-500 ease-out"
              style={{ width: `${Math.min(data.pct, 100)}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-[#0F291E] shrink-0">
            {data.pct}%
          </span>
        </div>
      </div>

      {/* =============================================================== */}
      {/* CARD 2: Subject-wise Time (Donut Chart + Subject Legend)        */}
      {/* =============================================================== */}
      <div className="p-6 rounded-[28px] bg-white border border-[#EBE8E1] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] space-y-4">
        <h3 className="font-apfel font-bold text-base text-[#111110]">
          Subject-wise Time
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-1">
          {/* Donut Chart */}
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
              {/* Background ring */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="transparent"
                stroke="#F4F4F5"
                strokeWidth={strokeWidth}
              />
              {/* Slices */}
              {data.subjects.map((sub, i) => {
                const sliceLength = (sub.pct / 100) * circumference;
                // Add a small 2px visual gap between segments
                const dashLength = Math.max(sliceLength - 2, 0);
                const strokeDasharray = `${dashLength} ${circumference - dashLength}`;
                const strokeDashoffset = -accumulatedOffset;
                accumulatedOffset += sliceLength;

                return (
                  <circle
                    key={i}
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="transparent"
                    stroke={sub.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500 ease-out hover:opacity-90 cursor-pointer"
                  />
                );
              })}
            </svg>

            {/* Donut Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="font-apfel font-bold text-xs sm:text-sm text-[#111110]">
                {data.totalStr.replace(/\s+/g, "")}
              </span>
              <span className="text-[10px] text-[#88867E] uppercase font-mono tracking-wider">
                Total
              </span>
            </div>
          </div>

          {/* Subject Legend Rows */}
          <div className="flex-1 w-full space-y-2.5">
            {data.subjects.map((sub, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: sub.color }}
                  />
                  <span className="font-medium text-[#27272A]">{sub.name}</span>
                </div>
                <span className="font-mono font-semibold text-[#18181B] ml-2">
                  {sub.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =============================================================== */}
      {/* CARD 3: Daily Study Trend (Weekly Bar Chart with Active Tooltip) */}
      {/* =============================================================== */}
      <div className="p-6 rounded-[28px] bg-white border border-[#EBE8E1] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] space-y-4">
        <h3 className="font-apfel font-bold text-base text-[#111110]">
          Daily Study Trend
        </h3>

        {/* Chart Canvas */}
        <div className="pt-8 pb-1">
          <div className="relative flex items-end justify-between h-40 w-full pl-6 pr-2">
            {/* Horizontal Gridlines & Y-Axis Labels */}
            <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between pointer-events-none">
              {[
                { label: range === "month" ? "150h" : "6h", top: "0%" },
                { label: range === "month" ? "100h" : "4h", top: "33%" },
                { label: range === "month" ? "50h" : "2h", top: "66%" },
                { label: "0h", top: "100%" },
              ].map((grid, i) => (
                <div key={i} className="flex items-center w-full">
                  <span className="text-[10px] font-mono text-[#AAA79E] w-6 shrink-0 -ml-1">
                    {grid.label}
                  </span>
                  <div className="flex-1 border-b border-[#F0ECE1] ml-1" />
                </div>
              ))}
            </div>

            {/* Daily Bars */}
            {data.trend.map((item, idx) => {
              const maxHours = range === "month" ? 150 : 6;
              const barHeightPct = Math.min((item.hours / maxHours) * 100, 100);

              return (
                <div
                  key={idx}
                  className="relative z-10 flex flex-col items-center flex-1 h-full justify-end group cursor-pointer"
                >
                  {/* Floating Tooltip Pill for Today (or on hover) */}
                  {item.isToday && (
                    <div className="absolute -top-7 z-20 flex flex-col items-center animate-bounce duration-1000">
                      <span className="px-2 py-0.5 rounded-full bg-[#134E4A] text-white font-mono font-bold text-[10px] shadow-sm whitespace-nowrap">
                        {item.timeStr}
                      </span>
                      <span className="w-1.5 h-1.5 bg-[#134E4A] rotate-45 -mt-0.5" />
                    </div>
                  )}

                  {/* The Bar */}
                  <div className="w-5 sm:w-6 h-full flex items-end">
                    <div
                      className={`w-full rounded-full transition-all duration-500 ease-out ${
                        item.isToday
                          ? "bg-[#10B981] shadow-xs"
                          : "bg-[#A7F3D0] hover:bg-[#86EFAC]"
                      }`}
                      style={{ height: `${barHeightPct}%` }}
                    />
                  </div>

                  {/* Day Label */}
                  <span
                    className={`mt-2 text-xs font-absans ${
                      item.isToday
                        ? "font-bold text-[#10B981]"
                        : "text-[#71717A] group-hover:text-[#111110]"
                    }`}
                  >
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
