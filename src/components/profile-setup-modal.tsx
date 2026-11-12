"use client";

import React, { useState, useEffect } from "react";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import {
  GraduationCap,
  Calendar,
  Target,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  BookOpen,
  Clock,
  User,
  ShieldCheck,
  Zap,
  Trophy,
} from "lucide-react";
import { DEFAULT_GOAL_MINUTES, examTerms, LEVELS, Level, SUBJECTS } from "@/lib/cma";
import { postAi } from "@/lib/ai-client";

interface ProfileSetupModalProps {
  isOpen: boolean;
  initialName?: string;
  initialLevel?: Level;
  onComplete: (data: { name: string; level: Level; dailyGoalMinutes: number }) => void;
  onClose?: () => void;
  canDismiss?: boolean;
}

export function ProfileSetupModal({
  isOpen,
  initialName = "",
  initialLevel = "Intermediate",
  onComplete,
  onClose,
  canDismiss = false,
}: ProfileSetupModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState(initialName);
  const [level, setLevel] = useState<Level>(initialLevel);
  const [targetExam, setTargetExam] = useState(() => examTerms()[0]);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(DEFAULT_GOAL_MINUTES);
  const [primarySubject, setPrimarySubject] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialName && !name) {
      setName(initialName);
    }
    if (initialLevel) {
      setLevel(initialLevel);
    }
  }, [initialName, initialLevel]);

  if (!isOpen) return null;

  const filteredSubjects = SUBJECTS.filter((s) => s.level === level);

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        setError("Please enter your name.");
        return;
      }
      setError("");
      setStep(2);
    } else if (step === 2) {
      setError("");
      if (!primarySubject && filteredSubjects.length > 0) {
        setPrimarySubject(filteredSubjects[0].name);
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setBusy(true);
    setError("");

    try {
      if (auth.currentUser && name.trim()) {
        await updateProfile(auth.currentUser, { displayName: name.trim() }).catch(() => {});
      }
      await postAi("/api/study", {
        action: "setup_profile",
        name: name.trim(),
        level,
        dailyGoalMinutes,
        targetExam,
        primarySubject: primarySubject || (filteredSubjects[0]?.name ?? "Cost Accounting"),
      });

      onComplete({
        name: name.trim(),
        level,
        dailyGoalMinutes,
      });
    } catch (err) {
      setError((err as Error).message || "Failed to save profile. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="apple-glass-backdrop animate-in fade-in duration-200">
      {/* Pure Crystal Glass Card (Zero Gradients) */}
      <div className="apple-glass-card p-6 sm:p-9 space-y-6 max-w-lg w-full relative z-10 animate-in zoom-in-95 duration-150">
        
        {/* Step Indicator Header */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs tabular-nums font-bold tracking-wider text-[#4E4D48] dark:text-[#B0AEA6]">
            <span className="px-3 py-1 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md border border-white/90 dark:border-white/20 shadow-xs">
              STEP {step} OF 3
            </span>
            <span className="text-[11px] font-semibold text-[#5A5852] dark:text-[#9A9890]">
              {step === 1 ? "Profile & Course" : step === 2 ? "Goal & Target" : "First Focus"}
            </span>
          </div>

          {/* Solid Pure Progress Bar (No Gradients) */}
          <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-[var(--brand)] transition-all duration-200 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Name & CMA Level */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] tabular-nums font-bold uppercase tracking-wider bg-white/80 dark:bg-white/10 backdrop-blur-md border border-white/90 dark:border-white/20 text-[#2B2A26] dark:text-white shadow-xs">
                <Sparkles className="w-3 h-3 text-[#111110] dark:text-white" />
                WELCOME TO ABHYAS
              </span>
              <h2 className="text-2xl sm:text-3xl font-apfel font-bold text-[#111110] dark:text-white mt-2 tracking-tight">
                Let’s personalize your CMA journey
              </h2>
              <p className="text-xs sm:text-sm text-[#504E47] dark:text-[#B5B3AA] mt-1 leading-relaxed">
                Tell us your name and ICMAI Syllabus 2022 level so we can prepare your papers and study materials.
              </p>
            </div>

            <div className="space-y-4">
              {/* Bulletproof Clean Input with Dedicated Avatar Icon */}
              <div>
                <label className="block text-[11px] tabular-nums uppercase tracking-wider font-bold text-[#2A2925] dark:text-white mb-2">
                  Your Full Name
                </label>
                <div className="apple-glass-input-wrapper flex items-center px-4 py-3 gap-3">
                  <div className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0 border border-black/5 dark:border-white/10">
                    <User className="w-4 h-4 text-[#4A4842] dark:text-white" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Nihal Kumar"
                    maxLength={80}
                    className="flex-1 font-semibold text-base text-[#111110] dark:text-white placeholder:text-[#8E8B83]"
                  />
                </div>
              </div>

              {/* CMA Course Cards (Pure Frosted Glass, Zero Gradients) */}
              <div>
                <label className="block text-[11px] tabular-nums uppercase tracking-wider font-bold text-[#2A2925] dark:text-white mb-2">
                  Select Your CMA Level
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    {
                      lvl: "Foundation" as Level,
                      title: "CMA Foundation",
                      desc: "Papers 1 to 4 · Business Laws, Maths, Accounting & Economics",
                      badge: "Entry Level",
                      icon: GraduationCap,
                    },
                    {
                      lvl: "Intermediate" as Level,
                      title: "CMA Intermediate",
                      desc: "Papers 5 to 12 · Group 1 & Group 2 (Direct/Indirect Tax, Costing)",
                      badge: "Most Popular",
                      icon: BookOpen,
                    },
                    {
                      lvl: "Final" as Level,
                      title: "CMA Final",
                      desc: "Papers 13 to 20 · Group 3 & Group 4 (Corporate Law, SFM, CFR)",
                      badge: "Advanced",
                      icon: Trophy,
                    },
                  ].map((item) => {
                    const isSelected = level === item.lvl;
                    const Icon = item.icon;
                    return (
                      <button
                        type="button"
                        key={item.lvl}
                        onClick={() => setLevel(item.lvl)}
                        className={`w-full p-4 text-left transition-all cursor-pointer flex items-center justify-between gap-3.5 ${
                          isSelected ? "apple-glass-tile-selected" : "apple-glass-tile"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? "bg-white/15 border-white/20 text-white"
                                : "bg-black/5 dark:bg-white/10 border-black/5 dark:border-white/10 text-[#111110] dark:text-white"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-apfel font-bold text-sm sm:text-base leading-snug truncate">
                                {item.title}
                              </span>
                              <span
                                className={`text-[10px] tabular-nums px-2.5 py-0.5 rounded-full font-bold shrink-0 ${
                                  isSelected
                                    ? "bg-white/20 text-white border border-white/20"
                                    : "bg-black/5 dark:bg-white/10 text-[#4E4C46] dark:text-gray-200 border border-black/5"
                                }`}
                              >
                                {item.badge}
                              </span>
                            </div>
                            <p
                              className={`text-xs leading-relaxed truncate sm:text-clip ${
                                isSelected ? "text-white/85" : "text-[#5A5852] dark:text-[#A09E95]"
                              }`}
                            >
                              {item.desc}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ml-2 transition-all ${
                            isSelected
                              ? "bg-white text-black border-white"
                              : "border-black/20 dark:border-white/30 bg-white/40"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Target Exam Term & Daily Goal */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] tabular-nums font-bold uppercase tracking-wider bg-white/80 dark:bg-white/10 backdrop-blur-md border border-white/90 dark:border-white/20 text-[#2B2A26] dark:text-white shadow-xs">
                <Target className="w-3 h-3 text-[#111110] dark:text-white" />
                EXAM MILESTONES
              </span>
              <h2 className="text-2xl sm:text-3xl font-apfel font-bold text-[#111110] dark:text-white mt-2 tracking-tight">
                When is your exam attempt?
              </h2>
              <p className="text-xs sm:text-sm text-[#4E4C46] dark:text-[#B5B3AA] mt-1 leading-relaxed">
                Setting a target term and daily goal builds accountability and keeps your streak alive.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] tabular-nums uppercase tracking-wider font-bold text-[#1C1B18] dark:text-white mb-2">
                  Target Exam Term
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {examTerms().map((term) => {
                    const isSelected = targetExam === term;
                    return (
                      <button
                        type="button"
                        key={term}
                        onClick={() => setTargetExam(term)}
                        className={`p-3 rounded-2xl text-center text-xs font-apfel font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "apple-glass-tile-selected"
                            : "apple-glass-tile text-[#4E4D48] dark:text-gray-200"
                        }`}
                      >
                        {term}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] tabular-nums uppercase tracking-wider font-bold text-[#1C1B18] dark:text-white">
                    Daily Focus Study Goal
                  </label>
                  <span className="tabular-nums text-xs font-bold text-[#111110] dark:text-white bg-white/80 dark:bg-white/10 px-2.5 py-0.5 rounded-full border border-black/10 dark:border-white/20 shadow-xs">
                    {Math.floor(dailyGoalMinutes / 60)}h {dailyGoalMinutes % 60}m per day
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { minutes: 90, label: "1.5h · Consistent" },
                    { minutes: 150, label: "2.5h · Recommended" },
                    { minutes: 240, label: "4.0h · Intensive" },
                  ].map((g) => {
                    const isSelected = dailyGoalMinutes === g.minutes;
                    return (
                      <button
                        type="button"
                        key={g.minutes}
                        onClick={() => setDailyGoalMinutes(g.minutes)}
                        className={`p-2.5 rounded-xl text-center text-xs tabular-nums font-bold transition-all ${
                          isSelected
                            ? "apple-glass-tile-selected"
                            : "apple-glass-tile text-[#5A5852] dark:text-gray-300"
                        }`}
                      >
                        {g.label}
                      </button>
                    );
                  })}
                </div>

                <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/10 border border-white/90 dark:border-white/15 backdrop-blur-md shadow-xs">
                  <input
                    type="range"
                    min={30}
                    max={480}
                    step={15}
                    value={dailyGoalMinutes}
                    onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
                    className="w-full accent-[#111110] dark:accent-white cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] tabular-nums text-[#5A5852] dark:text-gray-300 mt-1 font-bold">
                    <span>30 mins</span>
                    <span>2.5 hours</span>
                    <span>8 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: First Paper to Study */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] tabular-nums font-bold uppercase tracking-wider bg-white/80 dark:bg-white/10 backdrop-blur-md border border-white/90 dark:border-white/20 text-[#2B2A26] dark:text-white shadow-xs">
                <Zap className="w-3 h-3 text-[#111110] dark:text-white" />
                READY TO STUDY
              </span>
              <h2 className="text-2xl sm:text-3xl font-apfel font-bold text-[#111110] dark:text-white mt-2 tracking-tight">
                Which paper are you tackling first?
              </h2>
              <p className="text-xs sm:text-sm text-[#4E4C46] dark:text-[#B5B3AA] mt-1 leading-relaxed">
                Pick a starting paper for your dashboard timer. You can switch papers at any time.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] tabular-nums uppercase tracking-wider font-bold text-[#1C1B18] dark:text-white mb-2">
                  Papers for CMA {level}
                </label>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                  {filteredSubjects.map((s) => {
                    const isSelected = primarySubject === s.name || (!primarySubject && s === filteredSubjects[0]);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => setPrimarySubject(s.name)}
                        className={`w-full p-3.5 text-left text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? "apple-glass-tile-selected font-semibold"
                            : "apple-glass-tile text-[#4E4D48] dark:text-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span
                            className={`tabular-nums text-[10px] px-2 py-0.5 rounded-md font-bold ${
                              isSelected
                                ? "bg-white/25 text-white"
                                : "bg-black/5 dark:bg-white/10 text-[#3F3E3A] dark:text-gray-200"
                            }`}
                          >
                            Paper {s.id}
                          </span>
                          <span className="truncate">{s.name}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-2 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clean Confirmation Card (Zero Gradients) */}
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/10 border border-black/10 dark:border-white/15 backdrop-blur-md space-y-1 text-xs shadow-xs">
                <div className="flex items-center gap-1.5 text-[#111110] dark:text-white font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Your Abhyas profile is ready</span>
                </div>
                <div className="text-[11px] text-[#4E4C46] dark:text-[#A09E95] leading-relaxed">
                  <strong>{name}</strong> · CMA {level} ({targetExam}) · Daily goal:{" "}
                  <strong>{Math.floor(dailyGoalMinutes / 60)}h {dailyGoalMinutes % 60}m</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error alert */}
        {error && (
          <p className="text-xs text-rose-600 bg-rose-50/90 backdrop-blur-md p-3 rounded-2xl border border-rose-200">
            {error}
          </p>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-black/10 dark:border-white/15">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-5 py-3 rounded-full apple-glass-tile text-xs font-bold text-[#4E4C46] dark:text-gray-200 hover:text-black flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : canDismiss && onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-[#66645D] dark:text-gray-300 hover:text-[#111110] px-3 py-2 rounded-xl"
            >
              Skip for now
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="apple-glass-btn px-8 py-3.5 text-xs font-apfel font-bold flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={handleSubmit}
              className="apple-glass-btn px-9 py-3.5 text-xs font-apfel font-bold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{busy ? "Saving..." : "Start using Abhyas"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
