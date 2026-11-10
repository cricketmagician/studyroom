"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Shield,
  Smartphone,
  Lock,
  CheckCircle2,
  Clock,
  Flame,
  Ban,
  BookOpen,
  X,
  Volume2,
  VolumeX,
} from "lucide-react";

// Web Audio API click synthesizer for tactile physical feel
function playHapticTone(type: "brick" | "unbrick" | "block" | "click") {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === "brick") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "unbrick") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "block") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.2);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch {
    // AudioContext blocked or unsupported
  }
}

interface BlockedApp {
  id: string;
  name: string;
  category: string;
  iconLetter: string;
  blocked: boolean;
  intercepts: number;
}

interface StudySlot {
  id: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  completed: boolean;
  priority: "HIGH" | "CORE" | "REVISION";
}

export default function BrickStudyApp() {
  const [mounted, setMounted] = useState(false);
  const [isBricked, setIsBricked] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(50 * 60);
  const [targetDuration, setTargetDuration] = useState(50); // minutes
  const [impulsesBlocked, setImpulsesBlocked] = useState(14);
  const [reclaimedMinutes, setReclaimedMinutes] = useState(135);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // App Blocker list state
  const [apps, setApps] = useState<BlockedApp[]>([
    { id: "ig", name: "Instagram", category: "Social & Reels", iconLetter: "IG", blocked: true, intercepts: 7 },
    { id: "yt", name: "YouTube & Shorts", category: "Video & Media", iconLetter: "YT", blocked: true, intercepts: 4 },
    { id: "x", name: "X (Twitter)", category: "Social Feed", iconLetter: "X", blocked: true, intercepts: 2 },
    { id: "reddit", name: "Reddit", category: "Communities", iconLetter: "RD", blocked: true, intercepts: 1 },
    { id: "tiktok", name: "TikTok", category: "Short Video", iconLetter: "TT", blocked: true, intercepts: 0 },
    { id: "netflix", name: "Streaming & OTT", category: "Entertainment", iconLetter: "NF", blocked: false, intercepts: 0 },
  ]);

  // Academic Study Slots (Option B)
  const [activeSlotId, setActiveSlotId] = useState("slot-1");
  const [studySlots, setStudySlots] = useState<StudySlot[]>([
    {
      id: "slot-1",
      subject: "Cost Accounting",
      topic: "Marginal Costing & Break-Even Analysis",
      durationMinutes: 50,
      completed: false,
      priority: "HIGH",
    },
    {
      id: "slot-2",
      subject: "Direct Taxation",
      topic: "Capital Gains & Deductions u/s 80C-80U",
      durationMinutes: 45,
      completed: false,
      priority: "CORE",
    },
    {
      id: "slot-3",
      subject: "Spaced Revision",
      topic: "Formula Sheet & 20 High-Yield MCQs",
      durationMinutes: 30,
      completed: false,
      priority: "REVISION",
    },
  ]);

  // Simulated Block Screen Modal
  const [simulatedBlockApp, setSimulatedBlockApp] = useState<BlockedApp | null>(null);
  const [unbrickHolding, setUnbrickHolding] = useState(false);
  const unbrickTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Prevent SSR hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!isBricked) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsBricked(false);
          return 0;
        }
        return prev - 1;
      });
      setReclaimedMinutes((prev) => prev + 1 / 60);
    }, 1000);

    return () => clearInterval(interval);
  }, [isBricked]);

  const toggleBrick = () => {
    if (soundEnabled) playHapticTone(isBricked ? "unbrick" : "brick");
    if (!isBricked) {
      setSecondsRemaining(targetDuration * 60);
      setIsBricked(true);
    } else {
      setIsBricked(false);
    }
  };

  const handleToggleApp = (id: string) => {
    if (soundEnabled) playHapticTone("click");
    setApps((prev) =>
      prev.map((app) => (app.id === id ? { ...app, blocked: !app.blocked } : app))
    );
  };

  const simulateOpenApp = (app: BlockedApp) => {
    if (!isBricked) {
      alert(`Brick is not active. ${app.name} opens normally.`);
      return;
    }
    if (!app.blocked) {
      alert(`${app.name} is whitelisted in your current shield.`);
      return;
    }
    if (soundEnabled) playHapticTone("block");
    setImpulsesBlocked((prev) => prev + 1);
    setApps((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, intercepts: a.intercepts + 1 } : a))
    );
    setSimulatedBlockApp(app);
  };

  const toggleSlotCompletion = (id: string) => {
    if (soundEnabled) playHapticTone("click");
    setStudySlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, completed: !slot.completed } : slot))
    );
  };

  // Emergency Unbrick long-press simulation
  const startEmergencyUnbrick = () => {
    setUnbrickHolding(true);
    unbrickTimerRef.current = setTimeout(() => {
      setIsBricked(false);
      setSimulatedBlockApp(null);
      setUnbrickHolding(false);
      if (soundEnabled) playHapticTone("unbrick");
    }, 2500);
  };

  const cancelEmergencyUnbrick = () => {
    setUnbrickHolding(false);
    if (unbrickTimerRef.current) {
      clearTimeout(unbrickTimerRef.current);
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const activeSlot = studySlots.find((s) => s.id === activeSlotId) || studySlots[0];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#070707] text-[#999999] flex items-center justify-center font-mono text-xs tracking-widest">
        INITIALIZING BRICK SHIELD...
      </div>
    );
  }

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#090909] text-[#E5E5E5] selection:bg-[#333333] font-sans antialiased pb-24"
    >
      {/* Top Swiss Status Bar */}
      <header className="border-b border-[#1A1A1A] bg-[#090909]/90 backdrop-blur sticky top-0 z-30 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-sm bg-white" />
          <span className="font-mono text-xs tracking-[0.2em] font-semibold text-white uppercase">
            BRICK // OS
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#262626] text-[#777777]">
            v2.4 ACADEMIC
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded text-[#777777] hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? "Mute haptics" : "Enable haptics"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#888888]">
            <span
              className={`w-2 h-2 rounded-full ${
                isBricked ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" : "bg-[#444444]"
              }`}
            />
            <span>{isBricked ? "BRICKED" : "UNBRICKED"}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-5 pt-8 space-y-7">
        {/* Physical Brick Slab (The Iconic Brick UI) */}
        <section className="text-center pt-2">
          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#666666] mb-3">
            {isBricked ? "// DISTRACTION SHIELD ENGAGED" : "// TAP SLAB TO LOCK DISTRACTIONS"}
          </div>

          {/* The Physical Brick Object */}
          <button
            onClick={toggleBrick}
            type="button"
            className={`w-full group relative overflow-hidden rounded-2xl transition-all duration-300 select-none p-8 flex flex-col items-center justify-center text-center cursor-pointer border ${
              isBricked
                ? "bg-[#111111] border-[#2A2A2A] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)]"
                : "bg-[#EDEDED] text-[#0A0A0A] border-[#D4D4D4] shadow-[0_18px_30px_-10px_rgba(255,255,255,0.08),0_6px_0_#BCBCBC] active:translate-y-1 active:shadow-[0_2px_0_#BCBCBC]"
            }`}
          >
            {/* Subtle Texture Grain */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

            {/* Inner Icon */}
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 ${
                isBricked
                  ? "bg-[#181818] border border-[#2E2E2E] text-white"
                  : "bg-[#0A0A0A] text-white shadow-sm"
              }`}
            >
              {isBricked ? <Lock className="w-5 h-5 text-emerald-400" /> : <Smartphone className="w-5 h-5" />}
            </div>

            {/* Slab Typography */}
            {isBricked ? (
              <div className="space-y-1">
                <div className="font-mono text-4xl font-bold tracking-tight text-white">
                  {formatTimer(secondsRemaining)}
                </div>
                <div className="text-xs font-mono tracking-widest text-emerald-400 font-semibold uppercase pt-1">
                  BRICK ACTIVE • {activeSlot.subject}
                </div>
                <div className="text-[11px] text-[#666666] pt-1">
                  Tap to end session
                </div>
              </div>
            ) : (
              <div className="space-y-1 text-[#0A0A0A]">
                <div className="text-2xl font-black tracking-tight uppercase">
                  BRICK DEVICE
                </div>
                <div className="text-[11px] font-mono tracking-wider text-[#555555] font-medium uppercase">
                  TAP TO ACTIVATE PHYSICAL SHIELD
                </div>
                <div className="text-[11px] text-[#777777] pt-2">
                  Duration: {targetDuration} minutes • {apps.filter((a) => a.blocked).length} Apps Shielded
                </div>
              </div>
            )}
          </button>

          {/* Quick Duration Selector (When unbricked) */}
          {!isBricked && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {[25, 50, 90].map((dur) => (
                <button
                  key={dur}
                  onClick={() => {
                    setTargetDuration(dur);
                    setSecondsRemaining(dur * 60);
                    if (soundEnabled) playHapticTone("click");
                  }}
                  className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                    targetDuration === dur
                      ? "bg-[#222222] text-white border border-[#444444]"
                      : "text-[#666666] hover:text-[#AAAAAA]"
                  }`}
                >
                  {dur}m
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Reclaimed Focus Telemetry */}
        <section className="grid grid-cols-3 gap-2.5">
          <div className="p-3.5 rounded-xl bg-[#121212] border border-[#1F1F1F]">
            <div className="text-[10px] font-mono text-[#666666] uppercase tracking-wider">
              RECLAIMED
            </div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              {Math.floor(reclaimedMinutes / 60)}h {Math.floor(reclaimedMinutes % 60)}m
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#121212] border border-[#1F1F1F]">
            <div className="text-[10px] font-mono text-[#666666] uppercase tracking-wider">
              IMPULSES STOPPED
            </div>
            <div className="text-lg font-bold font-mono text-white mt-1 flex items-center gap-1.5">
              <span>{impulsesBlocked}</span>
              <span className="text-[10px] text-emerald-400 font-normal">blocked</span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#121212] border border-[#1F1F1F]">
            <div className="text-[10px] font-mono text-[#666666] uppercase tracking-wider">
              STREAK
            </div>
            <div className="text-lg font-bold font-mono text-white mt-1 flex items-center gap-1">
              <span>5</span>
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </div>
          </div>
        </section>

        {/* Feature 1: The App Blocker / Distraction Shield Matrix (User requested) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#888888]" />
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] font-semibold text-[#888888]">
                APP BLOCKER & SHIELD MATRIX
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[#555555]">
              {apps.filter((a) => a.blocked).length}/{apps.length} BLOCKED
            </span>
          </div>

          <div className="rounded-xl border border-[#1E1E1E] bg-[#121212] divide-y divide-[#1A1A1A] overflow-hidden">
            {apps.map((app) => (
              <div
                key={app.id}
                className="p-3.5 flex items-center justify-between hover:bg-[#161616] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg font-mono text-xs font-bold flex items-center justify-center transition-colors ${
                      app.blocked
                        ? "bg-[#1E1E1E] text-white border border-[#2E2E2E]"
                        : "bg-[#141414] text-[#555555] border border-transparent"
                    }`}
                  >
                    {app.iconLetter}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white flex items-center gap-2">
                      <span>{app.name}</span>
                      {app.intercepts > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1F1414] text-red-400 border border-red-900/40">
                          {app.intercepts} prevented
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#666666]">{app.category}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Test block trigger button */}
                  <button
                    onClick={() => simulateOpenApp(app)}
                    className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded bg-[#1A1A1A] hover:bg-[#252525] text-[#AAAAAA] hover:text-white border border-[#2E2E2E] transition-colors cursor-pointer"
                  >
                    Test Open
                  </button>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleToggleApp(app.id)}
                    aria-label={`Toggle ${app.name}`}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      app.blocked ? "bg-white" : "bg-[#252525]"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full transition-transform absolute top-1 ${
                        app.blocked ? "bg-[#090909] translate-x-6" : "bg-[#666666] translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#555555] leading-relaxed">
            When Brick is active, opening any enabled app triggers the impenetrable Brick shield screen. Whitelisted tools (Calculator, Formula Vault) remain accessible.
          </p>
        </section>

        {/* Feature 2: Academic Study Slots (Option B) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#888888]" />
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] font-semibold text-[#888888]">
                TODAY&apos;S FOCUS PROTOCOL
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[#555555]">
              {studySlots.filter((s) => s.completed).length}/{studySlots.length} DONE
            </span>
          </div>

          <div className="space-y-2.5">
            {studySlots.map((slot) => {
              const isActive = activeSlotId === slot.id;
              return (
                <div
                  key={slot.id}
                  onClick={() => setActiveSlotId(slot.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#151515] border-[#383838] shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                      : "bg-[#101010] border-[#1C1C1C] hover:border-[#2C2C2C]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1C1C1C] text-[#AAAAAA] border border-[#2A2A2A]">
                          {slot.priority}
                        </span>
                        <span className="text-xs font-mono text-[#777777] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {slot.durationMinutes}m
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                            ACTIVE TARGET
                          </span>
                        )}
                      </div>
                      <h3
                        className={`text-sm font-semibold transition-colors ${
                          slot.completed ? "line-through text-[#666666]" : "text-white"
                        }`}
                      >
                        {slot.subject}
                      </h3>
                      <p className="text-xs text-[#888888]">{slot.topic}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSlotCompletion(slot.id);
                      }}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        slot.completed
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                          : "border-[#2A2A2A] text-[#444444] hover:text-white"
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Whitelisted Study Arsenal */}
        <section className="p-4 rounded-xl border border-[#1C1C1C] bg-[#101010] space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#666666]">
            // PERMITTED STUDY UTILITIES
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 rounded-lg bg-[#141414] border border-[#1F1F1F] text-xs font-mono text-[#CCCCCC] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Formula Codex
            </div>
            <div className="p-2.5 rounded-lg bg-[#141414] border border-[#1F1F1F] text-xs font-mono text-[#CCCCCC] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              CMA Question Drill
            </div>
          </div>
        </section>
      </main>

      {/* Simulated Brick Full-Screen Blocker Screen Modal (Exact Brick iOS experience) */}
      {simulatedBlockApp && (
        <div className="fixed inset-0 z-50 bg-[#000000] text-white flex flex-col justify-between p-8 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white" />
              <span className="font-mono text-xs tracking-[0.3em] font-bold">
                BRICK IS ACTIVE
              </span>
            </div>
            <button
              onClick={() => setSimulatedBlockApp(null)}
              className="p-2 text-[#777777] hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stark Center Blocked Message */}
          <div className="max-w-xs mx-auto text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-[#141414] border border-[#2A2A2A] flex items-center justify-center">
              <Ban className="w-10 h-10 text-red-500" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight uppercase">
                {simulatedBlockApp.name} IS BRICKED
              </h1>
              <p className="text-sm text-[#888888] leading-relaxed">
                You committed to focusing on{" "}
                <span className="text-white font-medium">{activeSlot.subject}</span>. Put your phone down.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[#222222] font-mono">
              <div className="text-[10px] text-[#666666] uppercase tracking-widest">
                TIME REMAINING
              </div>
              <div className="text-3xl font-bold text-white pt-1">
                {formatTimer(secondsRemaining)}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="space-y-3 max-w-xs mx-auto w-full text-center">
            <button
              onClick={() => setSimulatedBlockApp(null)}
              className="w-full py-4 rounded-xl bg-white text-[#0A0A0A] font-bold text-sm tracking-wide uppercase hover:bg-[#E5E5E5] transition-colors cursor-pointer"
            >
              Return to Study
            </button>

            {/* Emergency Hold to Unbrick */}
            <div className="pt-2">
              <button
                onMouseDown={startEmergencyUnbrick}
                onMouseUp={cancelEmergencyUnbrick}
                onTouchStart={startEmergencyUnbrick}
                onTouchEnd={cancelEmergencyUnbrick}
                className="text-xs font-mono text-[#555555] hover:text-[#888888] transition-colors cursor-pointer select-none"
              >
                {unbrickHolding ? "HOLDING... (2.5s)" : "Press & hold for emergency unbrick"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
