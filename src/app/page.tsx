"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Flame,
  CheckCircle2,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Headphones,
  Award,
  AlertOctagon,
  ArrowRight,
  X,
} from "lucide-react";

// Synthesize tactile haptics & binaural focus audio via Web Audio API
class AudioEngine {
  private ctx: AudioContext | null = null;
  private droneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playHaptic(type: "brick" | "unbrick" | "block" | "click" | "complete") {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === "brick") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(65, now + 0.14);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.14);
      } else if (type === "unbrick") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(460, now + 0.16);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === "block") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.22);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === "complete") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      }
    } catch {
      // AudioContext blocked
    }
  }

  toggleBinauralDrone(enable: boolean) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (enable) {
        if (this.droneOsc) return;
        this.droneOsc = ctx.createOscillator();
        this.droneGain = ctx.createGain();
        this.droneOsc.type = "sine";
        this.droneOsc.frequency.setValueAtTime(196, ctx.currentTime); // G3 warm base
        this.droneGain.gain.setValueAtTime(0.001, ctx.currentTime);
        this.droneGain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 1.5);
        this.droneOsc.connect(this.droneGain);
        this.droneGain.connect(ctx.destination);
        this.droneOsc.start();
      } else {
        if (this.droneOsc && this.droneGain) {
          this.droneGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
          setTimeout(() => {
            try {
              this.droneOsc?.stop();
              this.droneOsc?.disconnect();
              this.droneOsc = null;
              this.droneGain = null;
            } catch {
              // ignore
            }
          }, 900);
        }
      }
    } catch {
      // Audio error
    }
  }
}

const audioEngine = new AudioEngine();

// Data Structures
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

interface Flashcard {
  id: string;
  subject: string;
  question: string;
  answer: string;
  category: string;
}

export default function BrickStudyApp() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"focus" | "shield" | "drill" | "logs">("focus");

  // Brick Session State
  const [isBricked, setIsBricked] = useState(false);
  const [targetDuration, setTargetDuration] = useState(50); // minutes
  const [secondsRemaining, setSecondsRemaining] = useState(50 * 60);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [binauralAudio, setBinauralAudio] = useState(false);
  const [strictMode, setStrictMode] = useState(true);

  // Reclaimed Metrics
  const [reclaimedMinutes, setReclaimedMinutes] = useState(148);
  const [totalIntercepts, setTotalIntercepts] = useState(19);
  const [streakDays] = useState(6);

  // App Blocker Matrix
  const [apps, setApps] = useState<BlockedApp[]>([
    { id: "ig", name: "Instagram", category: "Reels & Feed", iconLetter: "IG", blocked: true, intercepts: 9 },
    { id: "yt", name: "YouTube Shorts", category: "Algorithmic Video", iconLetter: "YT", blocked: true, intercepts: 5 },
    { id: "x", name: "X (Twitter)", category: "Social Feed", iconLetter: "X", blocked: true, intercepts: 3 },
    { id: "reddit", name: "Reddit", category: "Discussions & Memes", iconLetter: "RD", blocked: true, intercepts: 2 },
    { id: "tiktok", name: "TikTok", category: "Short Video", iconLetter: "TT", blocked: true, intercepts: 0 },
    { id: "netflix", name: "Streaming & OTT", category: "Entertainment", iconLetter: "NF", blocked: false, intercepts: 0 },
  ]);

  // Academic Study Slots
  const [activeSlotId, setActiveSlotId] = useState("slot-1");
  const [studySlots, setStudySlots] = useState<StudySlot[]>([
    {
      id: "slot-1",
      subject: "Cost Accounting",
      topic: "Marginal Costing, P/V Ratio & Break-Even Analysis",
      durationMinutes: 50,
      completed: false,
      priority: "HIGH",
    },
    {
      id: "slot-2",
      subject: "Direct Taxation",
      topic: "Capital Gains (Sec 45-55) & Deductions (80C-80U)",
      durationMinutes: 45,
      completed: false,
      priority: "CORE",
    },
    {
      id: "slot-3",
      subject: "Spaced Revision",
      topic: "Formula Codex & 25 High-Yield CMA Practice MCQs",
      durationMinutes: 30,
      completed: false,
      priority: "REVISION",
    },
  ]);

  // Custom Slot Creator
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newDuration, setNewDuration] = useState("45");

  // Flashcards (Spaced Retention Drill)
  const flashcards: Flashcard[] = [
    {
      id: "fc-1",
      subject: "Cost Accounting",
      question: "What is the formula for Profit-Volume (P/V) Ratio?",
      answer: "P/V Ratio = (Contribution / Sales) × 100\nOR (Change in Profit / Change in Sales) × 100",
      category: "Formulas",
    },
    {
      id: "fc-2",
      subject: "Cost Accounting",
      question: "How do you calculate Break-Even Point (BEP) in Units & Value?",
      answer: "BEP (Units) = Total Fixed Costs / Contribution per unit\nBEP (Value) = Total Fixed Costs / P/V Ratio",
      category: "Decision Making",
    },
    {
      id: "fc-3",
      subject: "Direct Tax",
      question: "What are the holding period thresholds for Long-Term Capital Assets?",
      answer: "Listed Equity & Units: >12 Months\nUnlisted Shares & Immovable Property: >24 Months\nOther Capital Assets: >36 Months",
      category: "Capital Gains",
    },
    {
      id: "fc-4",
      subject: "Cost Accounting",
      question: "Define Margin of Safety (MOS) and its formula.",
      answer: "MOS = Actual Sales - Break-Even Sales\nMOS Ratio = (MOS / Actual Sales) × 100 = Profit / Contribution Ratio",
      category: "CVP Analysis",
    },
  ];
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Simulated Impenetrable Block Screen
  const [simulatedBlockApp, setSimulatedBlockApp] = useState<BlockedApp | null>(null);
  const [unbrickProgress, setUnbrickProgress] = useState(0);
  const unbrickHoldInterval = useRef<NodeJS.Timeout | null>(null);

  // Log Entries of Blocked Impulses
  const [interceptLogs, setInterceptLogs] = useState<
    { id: string; app: string; time: string; focusSubject: string }[]
  >([
    { id: "log-1", app: "Instagram", time: "18:42", focusSubject: "Cost Accounting" },
    { id: "log-2", app: "YouTube Shorts", time: "19:15", focusSubject: "Cost Accounting" },
    { id: "log-3", app: "X (Twitter)", time: "20:05", focusSubject: "Direct Taxation" },
  ]);

  // Safe SSR Mount & LocalStorage load
  useEffect(() => {
    setMounted(true);
    try {
      const savedMinutes = localStorage.getItem("brick_reclaimed");
      if (savedMinutes) setReclaimedMinutes(parseFloat(savedMinutes));
      const savedIntercepts = localStorage.getItem("brick_intercepts");
      if (savedIntercepts) setTotalIntercepts(parseInt(savedIntercepts, 10));
    } catch {
      // storage unavailable
    }
  }, []);

  // Timer countdown loop
  useEffect(() => {
    if (!isBricked) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsBricked(false);
          audioEngine.playHaptic("complete");
          audioEngine.toggleBinauralDrone(false);
          setBinauralAudio(false);
          return 0;
        }
        return prev - 1;
      });
      setReclaimedMinutes((prev) => {
        const next = prev + 1 / 60;
        try {
          localStorage.setItem("brick_reclaimed", next.toString());
        } catch {
          // ignore
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBricked]);

  // Binaural tone sync
  const toggleBinaural = () => {
    const next = !binauralAudio;
    setBinauralAudio(next);
    audioEngine.toggleBinauralDrone(next);
  };

  // Brick Toggle
  const handleToggleBrick = () => {
    if (soundEnabled) audioEngine.playHaptic(isBricked ? "unbrick" : "brick");
    if (!isBricked) {
      setSecondsRemaining(targetDuration * 60);
      setIsBricked(true);
      if (binauralAudio) audioEngine.toggleBinauralDrone(true);
    } else {
      setIsBricked(false);
      audioEngine.toggleBinauralDrone(false);
    }
  };

  // Toggle App in shield
  const handleToggleApp = (id: string) => {
    if (soundEnabled) audioEngine.playHaptic("click");
    setApps((prev) =>
      prev.map((app) => (app.id === id ? { ...app, blocked: !app.blocked } : app))
    );
  };

  // Simulate Opening App
  const simulateOpenApp = (app: BlockedApp) => {
    if (!isBricked) {
      alert(`Physical Brick is not engaged. ${app.name} opened without restriction.`);
      return;
    }
    if (!app.blocked) {
      alert(`${app.name} is on your allowed whitelist.`);
      return;
    }
    if (soundEnabled) audioEngine.playHaptic("block");
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    setTotalIntercepts((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem("brick_intercepts", next.toString());
      } catch {
        // ignore
      }
      return next;
    });

    setApps((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, intercepts: a.intercepts + 1 } : a))
    );

    const activeSlot = studySlots.find((s) => s.id === activeSlotId) || studySlots[0];
    setInterceptLogs((prev) => [
      { id: `log-${Date.now()}`, app: app.name, time: timeStr, focusSubject: activeSlot.subject },
      ...prev,
    ]);

    setSimulatedBlockApp(app);
  };

  // Emergency unbrick hold action
  const startHoldUnbrick = () => {
    setUnbrickProgress(0);
    const start = Date.now();
    const duration = strictMode ? 4000 : 2000;

    unbrickHoldInterval.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setUnbrickProgress(pct);

      if (pct >= 100) {
        if (unbrickHoldInterval.current) clearInterval(unbrickHoldInterval.current);
        setIsBricked(false);
        setSimulatedBlockApp(null);
        setUnbrickProgress(0);
        audioEngine.playHaptic("unbrick");
        audioEngine.toggleBinauralDrone(false);
      }
    }, 40);
  };

  const cancelHoldUnbrick = () => {
    if (unbrickHoldInterval.current) {
      clearInterval(unbrickHoldInterval.current);
      unbrickHoldInterval.current = null;
    }
    setUnbrickProgress(0);
  };

  // Add Study Slot
  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newTopic.trim()) return;
    const slot: StudySlot = {
      id: `slot-${Date.now()}`,
      subject: newSubject.trim(),
      topic: newTopic.trim(),
      durationMinutes: parseInt(newDuration, 10) || 45,
      completed: false,
      priority: "CORE",
    };
    setStudySlots((prev) => [...prev, slot]);
    setNewSubject("");
    setNewTopic("");
    setShowAddSlot(false);
    if (soundEnabled) audioEngine.playHaptic("click");
  };

  const toggleSlotDone = (id: string) => {
    if (soundEnabled) audioEngine.playHaptic("complete");
    setStudySlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, completed: !slot.completed } : slot))
    );
  };

  const deleteSlot = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStudySlots((prev) => prev.filter((s) => s.id !== id));
    if (activeSlotId === id && studySlots.length > 1) {
      setActiveSlotId(studySlots.find((s) => s.id !== id)!.id);
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const activeSlot = studySlots.find((s) => s.id === activeSlotId) || studySlots[0] || {
    id: "default",
    subject: "Deep Study",
    topic: "Concentrated Flow Session",
    durationMinutes: 50,
    completed: false,
    priority: "HIGH",
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#070707] text-[#888888] flex items-center justify-center font-mono text-xs tracking-widest">
        INITIALIZING BRICK OS...
      </div>
    );
  }

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] selection:bg-[#333333] font-absans antialiased pb-28"
    >
      {/* Top Swiss Status Bar */}
      <header className="border-b border-[#181818] bg-[#0A0A0A]/90 backdrop-blur sticky top-0 z-30 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-sm bg-white" />
          <span className="font-apfel text-xs tracking-[0.22em] font-bold text-white uppercase">
            BRICK // OS
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#222222] text-[#888888]">
            ACADEMIC COCKPIT
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Binaural 40Hz Audio Drone Toggle */}
          <button
            onClick={toggleBinaural}
            title={binauralAudio ? "Turn off 40Hz Focus Drone" : "Turn on 40Hz Focus Drone"}
            className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
              binauralAudio
                ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400"
                : "border-[#222222] text-[#666666] hover:text-white"
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              audioEngine.playHaptic("click");
            }}
            className="p-1.5 rounded-md border border-[#222222] text-[#777777] hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? "Mute haptics" : "Enable haptics"}
          >
            <img
              src={soundEnabled ? "/icons/volume-on.svg" : "/icons/volume-off.svg"}
              alt="Haptics"
              className="w-3.5 h-3.5 invert opacity-70 hover:opacity-100"
            />
          </button>

          {/* Live Status Pill */}
          <div className="flex items-center gap-1.5 font-mono text-[11px] px-2 py-0.5 rounded-full bg-[#141414] border border-[#242424]">
            <span
              className={`w-2 h-2 rounded-full ${
                isBricked ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" : "bg-[#444444]"
              }`}
            />
            <span className="text-[#AAAAAA]">{isBricked ? "BRICKED" : "IDLE"}</span>
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <main className="max-w-md mx-auto px-5 pt-6 space-y-6">
        {/* Navigation Tabs (Swiss Minimalist Pill Bar) */}
        <nav className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#121212] border border-[#1E1E1E]">
          {[
            { id: "focus", label: "01 FOCUS" },
            { id: "shield", label: "02 SHIELD" },
            { id: "drill", label: "03 DRILL" },
            { id: "logs", label: "04 STATS" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as typeof activeTab);
                if (soundEnabled) audioEngine.playHaptic("click");
              }}
              className={`py-2 rounded-lg text-[11px] font-mono tracking-wider transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-[#0A0A0A] font-bold shadow-sm"
                  : "text-[#777777] hover:text-[#CCCCCC]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* ============================================================== */}
        {/* TAB 1: FOCUS COCKPIT (The Iconic Brick Slab + Protocol)        */}
        {/* ============================================================== */}
        {activeTab === "focus" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* The Iconic Physical Brick Slab */}
            <section className="text-center">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#666666] mb-3">
                {isBricked ? "// DISTRACTION SHIELD ENGAGED" : "// TAP SLAB TO LOCK DISTRACTIONS"}
              </div>

              <button
                onClick={handleToggleBrick}
                type="button"
                className={`w-full group relative overflow-hidden rounded-2xl transition-all duration-300 select-none p-8 flex flex-col items-center justify-center text-center cursor-pointer border ${
                  isBricked
                    ? "bg-[#111111] border-[#2A2A2A] shadow-[0_20px_45px_-12px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.08)]"
                    : "bg-[#EDEDED] text-[#0A0A0A] border-[#D4D4D4] shadow-[0_18px_30px_-10px_rgba(255,255,255,0.08),0_6px_0_#BCBCBC] active:translate-y-1 active:shadow-[0_2px_0_#BCBCBC]"
                }`}
              >
                {/* Subtle Grain */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

                {/* Inner Icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 ${
                    isBricked
                      ? "bg-[#181818] border border-[#2E2E2E]"
                      : "bg-[#0A0A0A] text-white shadow-sm"
                  }`}
                >
                  <img
                    src={isBricked ? "/icons/lock-clock.svg" : "/icons/shield.svg"}
                    alt="Status Icon"
                    className="w-6 h-6 invert"
                  />
                </div>

                {/* Slab Typography */}
                {isBricked ? (
                  <div className="space-y-1">
                    <div className="font-apfel text-5xl font-black tracking-tight text-white">
                      {formatTimer(secondsRemaining)}
                    </div>
                    <div className="text-xs font-mono tracking-widest text-emerald-400 font-semibold uppercase pt-1">
                      BRICK ACTIVE • {activeSlot.subject}
                    </div>
                    <div className="text-[11px] font-absans text-[#777777] pt-1">
                      Tap slab to disengage
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 text-[#0A0A0A]">
                    <div className="text-3xl font-apfel font-black tracking-tight uppercase">
                      BRICK DEVICE
                    </div>
                    <div className="text-[11px] font-mono tracking-wider text-[#555555] font-medium uppercase">
                      TAP TO ENGAGE IMPENETRABLE SHIELD
                    </div>
                    <div className="text-[11px] font-absans text-[#777777] pt-2">
                      Target: {activeSlot.subject} ({targetDuration}m) • {apps.filter((a) => a.blocked).length} Apps Shielded
                    </div>
                  </div>
                )}
              </button>

              {/* Quick Duration Selector (When unbricked) */}
              {!isBricked && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  {[25, 45, 50, 90].map((dur) => (
                    <button
                      key={dur}
                      onClick={() => {
                        setTargetDuration(dur);
                        setSecondsRemaining(dur * 60);
                        if (soundEnabled) audioEngine.playHaptic("click");
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
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
                <div className="text-xl font-bold font-apfel text-white mt-1">
                  {Math.floor(reclaimedMinutes / 60)}h {Math.floor(reclaimedMinutes % 60)}m
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#121212] border border-[#1F1F1F]">
                <div className="text-[10px] font-mono text-[#666666] uppercase tracking-wider">
                  IMPULSES BLOCKED
                </div>
                <div className="text-xl font-bold font-apfel text-white mt-1 flex items-center gap-1.5">
                  <span>{totalIntercepts}</span>
                  <span className="text-[10px] font-absans text-emerald-400 font-normal">prevented</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#121212] border border-[#1F1F1F]">
                <div className="text-[10px] font-mono text-[#666666] uppercase tracking-wider">
                  STREAK
                </div>
                <div className="text-xl font-bold font-apfel text-white mt-1 flex items-center gap-1">
                  <span>{streakDays}</span>
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
              </div>
            </section>

            {/* Deep Focus Sanctuary Banner (OutlineTone Illustration) */}
            <section className="p-4 rounded-xl border border-[#1E1E1E] bg-[#121212] flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#777777]">
                  // DEEP WORK SANCTUARY
                </span>
                <h3 className="text-sm font-apfel font-bold text-white">
                  Zero Notifications. Pure Flow.
                </h3>
                <p className="text-xs font-absans text-[#888888] leading-relaxed">
                  Targeting <span className="text-[#E0E0E0] font-medium">{activeSlot.subject}</span> — all algorithmic dopamine loops intercepted.
                </p>
              </div>
              <div className="w-18 h-18 shrink-0 rounded-xl bg-[#161616] border border-[#262626] p-2 flex items-center justify-center overflow-hidden">
                <img
                  src="/illustrations/reading-bench.svg"
                  alt="Deep Work"
                  className="w-full h-full object-contain invert opacity-90"
                />
              </div>
            </section>

            {/* Academic Study Protocol (Target Sessions) */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/icons/book.svg" alt="Protocol" className="w-4 h-4 invert opacity-70" />
                  <h2 className="text-xs font-apfel uppercase tracking-[0.2em] font-bold text-[#888888]">
                    TODAY&apos;S FOCUS PROTOCOL
                  </h2>
                </div>
                <button
                  onClick={() => setShowAddSlot(!showAddSlot)}
                  className="text-[11px] font-mono text-[#AAAAAA] hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD BLOCK</span>
                </button>
              </div>

              {/* Add New Session Drawer */}
              {showAddSlot && (
                <form
                  onSubmit={handleAddSlot}
                  className="p-4 rounded-xl border border-[#2E2E2E] bg-[#141414] space-y-3 animate-in fade-in"
                >
                  <div className="text-xs font-apfel font-bold uppercase tracking-wider text-white">
                    New Academic Focus Block
                  </div>
                  <input
                    type="text"
                    placeholder="Subject (e.g. Cost Accounting, Law)"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0D0D0D] border border-[#222222] text-xs font-absans text-white focus:outline-none focus:border-[#444444]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Topic / Target Objective"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0D0D0D] border border-[#222222] text-xs font-absans text-white focus:outline-none focus:border-[#444444]"
                    required
                  />
                  <div className="flex items-center justify-between gap-2">
                    <select
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-[#0D0D0D] border border-[#222222] text-xs font-mono text-[#AAAAAA] focus:outline-none"
                    >
                      <option value="25">25 Minutes (Sprint)</option>
                      <option value="45">45 Minutes (Standard)</option>
                      <option value="60">60 Minutes (Deep Block)</option>
                      <option value="90">90 Minutes (Ultra Flow)</option>
                    </select>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddSlot(false)}
                        className="px-3 py-2 rounded-lg text-xs font-mono text-[#777777] hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-white text-[#0A0A0A] font-apfel font-bold text-xs uppercase"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Study Slots List */}
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
                            <span className="text-xs font-mono text-[#777777]">
                              {slot.durationMinutes}m target
                            </span>
                            {isActive && (
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                                ACTIVE TARGET
                              </span>
                            )}
                          </div>
                          <h3
                            className={`text-sm font-apfel font-bold tracking-tight transition-colors ${
                              slot.completed ? "line-through text-[#666666]" : "text-white"
                            }`}
                          >
                            {slot.subject}
                          </h3>
                          <p className="text-xs font-absans text-[#888888]">{slot.topic}</p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSlotDone(slot.id);
                            }}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              slot.completed
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                                : "border-[#2A2A2A] text-[#444444] hover:text-white"
                            }`}
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          {studySlots.length > 1 && (
                            <button
                              onClick={(e) => deleteSlot(slot.id, e)}
                              className="p-1.5 text-[#444444] hover:text-red-400 transition-colors"
                              title="Delete block"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: DISTRACTION SHIELD MATRIX                               */}
        {/* ============================================================== */}
        {activeTab === "shield" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Strict Mode Configuration Banner */}
            <div className="p-4 rounded-xl border border-[#252525] bg-[#121212] flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-apfel text-xs font-bold uppercase tracking-wider text-white">
                    STRICT IMPENETRABLE LOCK
                  </span>
                  <span className="text-[10px] font-mono px-1 rounded bg-red-950/50 text-red-400 border border-red-800/40">
                    HARD CORE
                  </span>
                </div>
                <p className="text-xs font-absans text-[#888888]">
                  Requires 4-second continuous hold to emergency unbrick device.
                </p>
              </div>
              <button
                onClick={() => {
                  setStrictMode(!strictMode);
                  if (soundEnabled) audioEngine.playHaptic("click");
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  strictMode ? "bg-white" : "bg-[#252525]"
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full transition-transform absolute top-1 ${
                    strictMode ? "bg-[#090909] translate-x-6" : "bg-[#666666] translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Shielded App Matrix */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/icons/shield.svg" alt="Shield" className="w-4 h-4 invert opacity-70" />
                  <h2 className="text-xs font-apfel uppercase tracking-[0.2em] font-bold text-[#888888]">
                    SHIELDED APPLICATIONS
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
                        className={`w-9 h-9 rounded-lg font-apfel text-xs font-bold flex items-center justify-center transition-colors ${
                          app.blocked
                            ? "bg-[#1E1E1E] text-white border border-[#2E2E2E]"
                            : "bg-[#141414] text-[#555555] border border-transparent"
                        }`}
                      >
                        {app.iconLetter}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white flex items-center gap-2">
                          <span className="font-absans">{app.name}</span>
                          {app.intercepts > 0 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1F1414] text-red-400 border border-red-900/40">
                              {app.intercepts} prevented
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-absans text-[#666666]">{app.category}</div>
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
            </section>

            {/* Whitelisted Study Utilities */}
            <section className="p-4 rounded-xl border border-[#1C1C1C] bg-[#101010] space-y-2.5">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#666666]">
                // PERMITTED STUDY WHITELIST (ALWAYS UNLOCKED)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-[#141414] border border-[#202020] text-xs font-mono text-[#CCCCCC] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Formula Codex
                </div>
                <div className="p-3 rounded-lg bg-[#141414] border border-[#202020] text-xs font-mono text-[#CCCCCC] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Practice Questions
                </div>
                <div className="p-3 rounded-lg bg-[#141414] border border-[#202020] text-xs font-mono text-[#CCCCCC] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Financial Calculator
                </div>
                <div className="p-3 rounded-lg bg-[#141414] border border-[#202020] text-xs font-mono text-[#CCCCCC] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Offline Text Vault
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: RETENTION DRILL (Spaced Repetition Flashcards)           */}
        {/* ============================================================== */}
        {activeTab === "drill" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-apfel uppercase tracking-[0.2em] font-bold text-[#888888]">
                  FORMULA & CONCEPT DRILL
                </h2>
                <p className="text-xs font-absans text-[#666666]">
                  Active recall during Pomodoro intervals strengthens neuro-retention.
                </p>
              </div>
              <span className="font-mono text-xs text-[#888888]">
                {activeCardIndex + 1}/{flashcards.length}
              </span>
            </div>

            {/* Flashcard Tile */}
            <div
              onClick={() => {
                setIsCardFlipped(!isCardFlipped);
                if (soundEnabled) audioEngine.playHaptic("click");
              }}
              className="w-full min-h-[220px] p-6 rounded-2xl bg-[#141414] border border-[#262626] hover:border-[#383838] transition-all cursor-pointer flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1E1E1E] text-[#AAAAAA] border border-[#2A2A2A]">
                  {flashcards[activeCardIndex].subject} • {flashcards[activeCardIndex].category}
                </span>
                <span className="text-[10px] font-mono text-[#666666]">
                  {isCardFlipped ? "TAP TO VIEW QUESTION" : "TAP TO REVEAL ANSWER"}
                </span>
              </div>

              <div className="py-4">
                {isCardFlipped ? (
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider">
                      FORMULA / CORE ANSWER
                    </div>
                    <pre className="text-sm font-mono text-white whitespace-pre-wrap leading-relaxed">
                      {flashcards[activeCardIndex].answer}
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono uppercase text-[#777777] tracking-wider">
                      QUESTION
                    </div>
                    <div className="text-lg font-apfel font-bold text-white leading-snug">
                      {flashcards[activeCardIndex].question}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[11px] font-absans text-[#555555] text-right">
                {isCardFlipped ? "Self-grade below" : "Recall in mind first"}
              </div>
            </div>

            {/* Spaced Repetition Grading Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setIsCardFlipped(false);
                  setActiveCardIndex((prev) => (prev + 1) % flashcards.length);
                  if (soundEnabled) audioEngine.playHaptic("click");
                }}
                className="py-3 rounded-xl bg-[#181212] border border-red-950/60 text-red-400 font-mono text-xs font-semibold hover:bg-[#221616] cursor-pointer"
              >
                AGAIN (HARD)
              </button>
              <button
                onClick={() => {
                  setIsCardFlipped(false);
                  setActiveCardIndex((prev) => (prev + 1) % flashcards.length);
                  if (soundEnabled) audioEngine.playHaptic("click");
                }}
                className="py-3 rounded-xl bg-[#141414] border border-[#282828] text-white font-mono text-xs font-semibold hover:bg-[#1E1E1E] cursor-pointer"
              >
                GOOD
              </button>
              <button
                onClick={() => {
                  setIsCardFlipped(false);
                  setActiveCardIndex((prev) => (prev + 1) % flashcards.length);
                  if (soundEnabled) audioEngine.playHaptic("complete");
                }}
                className="py-3 rounded-xl bg-[#121A15] border border-emerald-950/60 text-emerald-400 font-mono text-xs font-semibold hover:bg-[#16221A] cursor-pointer"
              >
                EASY (PASS)
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: TELEMETRY & IMPULSE AUDIT LOGS                          */}
        {/* ============================================================== */}
        {activeTab === "logs" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* High Level Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-[#121212] border border-[#1E1E1E]">
                <div className="text-[10px] font-mono text-[#666666] uppercase tracking-wider">
                  NET FOCUS TIME
                </div>
                <div className="text-2xl font-bold font-apfel text-white mt-1">
                  {Math.floor(reclaimedMinutes / 60)}h {Math.floor(reclaimedMinutes % 60)}m
                </div>
                <div className="text-[11px] font-absans text-emerald-400 mt-1">
                  +38% vs last week
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#121212] border border-[#1E1E1E]">
                <div className="text-[10px] font-mono text-[#666666] uppercase tracking-wider">
                  DOPAMINE IMPULSES INTERCEPTED
                </div>
                <div className="text-2xl font-bold font-apfel text-white mt-1">
                  {totalIntercepts}
                </div>
                <div className="text-[11px] font-absans text-[#888888] mt-1">
                  Social triggers stopped
                </div>
              </div>
            </div>

            {/* Intercept Audit Trail */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-apfel uppercase tracking-[0.2em] font-bold text-[#888888]">
                  IMPULSE INTERCEPT LOG (REAL-TIME)
                </h2>
                <span className="text-[11px] font-mono text-[#555555]">TODAY</span>
              </div>

              <div className="rounded-xl border border-[#1E1E1E] bg-[#121212] divide-y divide-[#1A1A1A] overflow-hidden">
                {interceptLogs.length === 0 ? (
                  <div className="p-6 text-center text-xs font-mono text-[#666666]">
                    NO DISTRACTION ATTEMPTS RECORDED YET.
                  </div>
                ) : (
                  interceptLogs.map((log) => (
                    <div key={log.id} className="p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        <div>
                          <div className="text-xs font-apfel font-bold text-white">
                            {log.app} Blocked
                          </div>
                          <div className="text-[11px] font-absans text-[#777777]">
                            During: {log.focusSubject}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-xs text-[#666666]">{log.time}</span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* SIMULATED BRICK FULL-SCREEN BLOCKER MODAL                     */}
      {/* (The stark impenetrable Brick iOS distraction shield)         */}
      {/* ============================================================== */}
      {simulatedBlockApp && (
        <div className="fixed inset-0 z-50 bg-[#000000] text-white flex flex-col justify-between p-8 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white" />
              <span className="font-apfel text-xs tracking-[0.3em] font-bold">
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
            <div className="relative w-28 h-28 mx-auto rounded-3xl bg-[#141414] border border-[#2A2A2A] overflow-hidden flex items-center justify-center p-3">
              <img
                src="/illustrations/distraction-phone.svg"
                alt="Distraction Intercepted"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 right-2 p-1 rounded-full bg-red-600/90 text-white shadow">
                <AlertOctagon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-apfel font-black tracking-tight uppercase">
                {simulatedBlockApp.name} IS BRICKED
              </h1>
              <p className="text-sm font-absans text-[#888888] leading-relaxed">
                You committed to focusing on{" "}
                <span className="text-white font-medium">{activeSlot.subject}</span>. Put your device down.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[#222222]">
              <div className="text-[10px] font-mono text-[#666666] uppercase tracking-widest">
                TIME REMAINING IN CURRENT BLOCK
              </div>
              <div className="text-4xl font-apfel font-bold text-white pt-1">
                {formatTimer(secondsRemaining)}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="space-y-3 max-w-xs mx-auto w-full text-center">
            <button
              onClick={() => setSimulatedBlockApp(null)}
              className="w-full py-4 rounded-xl bg-white text-[#0A0A0A] font-apfel font-bold text-sm tracking-wide uppercase hover:bg-[#E5E5E5] transition-colors cursor-pointer"
            >
              Return to Study
            </button>

            {/* Emergency Hold to Unbrick with Progress Bar */}
            <div className="pt-2 space-y-2">
              <button
                onMouseDown={startHoldUnbrick}
                onMouseUp={cancelHoldUnbrick}
                onTouchStart={startHoldUnbrick}
                onTouchEnd={cancelHoldUnbrick}
                className="text-xs font-mono text-[#666666] hover:text-[#999999] transition-colors cursor-pointer select-none"
              >
                {unbrickProgress > 0
                  ? `HOLDING... ${unbrickProgress}%`
                  : strictMode
                  ? "Press & hold 4s to emergency unbrick"
                  : "Press & hold 2s to emergency unbrick"}
              </button>

              {unbrickProgress > 0 && (
                <div className="w-full h-1 bg-[#222222] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-75"
                    style={{ width: `${unbrickProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
