"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Plus, Check, Volume2, VolumeX, X, Trophy } from "lucide-react";

interface ActiveStudySessionProps {
  subject: string;
  initialMinutes: number;
  onComplete: (studiedMinutes: number, subject: string) => void;
  onExit: () => void;
}

export function ActiveStudySession({
  subject,
  initialMinutes = 45,
  onComplete,
  onExit,
}: ActiveStudySessionProps) {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setSessionCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, remainingSeconds]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const progressPct = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;
  const studiedMinutes = Math.max(1, Math.round((totalSeconds - remainingSeconds) / 60));

  const addTime = (mins: number) => {
    setTotalSeconds((prev) => prev + mins * 60);
    setRemainingSeconds((prev) => prev + mins * 60);
  };

  const handleFinish = () => {
    setIsRunning(false);
    onComplete(studiedMinutes, subject);
  };

  // Circular gauge metrics
  const radius = 100;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF9F5] text-[#111110] flex flex-col justify-between p-6 sm:p-10 select-none overflow-y-auto animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
          <span className="font-mono text-xs uppercase tracking-wider text-[#059669] font-bold">
            Focus Session Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-9 h-9 rounded-full border transition-colors flex items-center justify-center cursor-pointer ${
              soundEnabled
                ? "bg-[#111110] text-white border-[#111110]"
                : "bg-white text-[#71717A] border-[#EBE8E1] hover:text-[#111110]"
            }`}
            title="Toggle Ambient Audio"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onExit}
            className="w-9 h-9 rounded-full bg-white border border-[#EBE8E1] text-[#71717A] hover:text-[#111110] flex items-center justify-center cursor-pointer"
            title="Exit Session"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Focus Stage */}
      <div className="flex-1 flex flex-col items-center justify-center py-8 max-w-md mx-auto w-full space-y-7 text-center">
        {/* Subject Header */}
        <div className="space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#88867E]">
            Target Subject
          </span>
          <h2 className="text-2xl sm:text-3xl font-apfel font-bold text-[#111110] tracking-tight">
            {subject}
          </h2>
          <p className="text-xs text-[#71717A] font-absans">
            Deep focus block. No distractions, pure learning.
          </p>
        </div>

        {/* Circular Countdown Timer */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 240 240">
            {/* Background Track */}
            <circle
              cx="120"
              cy="120"
              r={radius}
              fill="transparent"
              stroke="#EFECE6"
              strokeWidth={strokeWidth}
            />
            {/* Animated Progress Ring */}
            <circle
              cx="120"
              cy="120"
              r={radius}
              fill="transparent"
              stroke="#10B981"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Time Digits Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1 pointer-events-none">
            <div className="text-5xl sm:text-6xl font-apfel font-bold tracking-tight text-[#111110] tabular-nums">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
            <div className="text-xs font-mono text-[#059669] font-semibold bg-[#EAF7EE] px-2.5 py-0.5 rounded-full border border-[#D1F2DD]">
              {isRunning ? "Studying" : "Paused"}
            </div>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => addTime(5)}
            className="px-3.5 py-2 rounded-2xl bg-white border border-[#EBE8E1] hover:bg-gray-50 text-xs font-mono font-medium text-[#71717A] hover:text-[#111110] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
            title="Add 5 Minutes"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>5m</span>
          </button>

          {/* Main Play / Pause Capsule */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="w-16 h-16 rounded-3xl bg-[#111110] hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
            title={isRunning ? "Pause" : "Start"}
          >
            {isRunning ? (
              <Pause className="w-7 h-7 fill-white" />
            ) : (
              <Play className="w-7 h-7 fill-white translate-x-0.5" />
            )}
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setRemainingSeconds(totalSeconds);
            }}
            className="p-3.5 rounded-2xl bg-white border border-[#EBE8E1] hover:bg-gray-50 text-[#71717A] hover:text-[#111110] transition-all cursor-pointer shadow-xs"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Completion Bar */}
      <div className="max-w-md mx-auto w-full pt-4 border-t border-[#EFECE6] flex items-center justify-between">
        <div className="text-xs text-[#71717A]">
          Studied so far: <span className="font-mono font-bold text-[#111110]">{studiedMinutes}m</span>
        </div>

        <button
          onClick={handleFinish}
          className="px-5 py-2.5 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-apfel font-bold text-xs tracking-wide shadow-xs flex items-center gap-2 cursor-pointer transition-all"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Finish &amp; Save</span>
        </button>
      </div>

      {/* Completion Modal when timer hits 0 */}
      {sessionCompleted && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-[#EBE8E1] p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-[#EAF7EE] text-[#059669] flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-apfel font-bold text-xl text-[#111110]">Session Complete! 🎓</h3>
              <p className="text-xs text-[#71717A]">
                You studied <span className="font-bold text-[#111110]">{studiedMinutes} minutes</span> of{" "}
                <span className="font-bold text-[#111110]">{subject}</span>.
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3 rounded-xl bg-[#111110] text-white font-apfel font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Save to Tracker
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
