"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Flame,
  CheckCircle2,
  Plus,
  Trash2,
  Headphones,
  AlertOctagon,
  X,
  ChevronRight,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  ArrowRight,
  Sparkles,
  Shield,
  Layers,
  CircleDot,
  Fingerprint,
} from "lucide-react";

// Web Audio API engine for tactile mechanical clicks & haptics
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

  playHaptic(type: "slab" | "unslab" | "block" | "click" | "complete") {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === "slab") {
        // Heavy, satisfying physical dampening thud
        osc.type = "sine";
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.16);
        gain.gain.setValueAtTime(0.38, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === "unslab") {
        // High precision spring release
        osc.type = "sine";
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.18);
        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === "block") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === "complete") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(750, now);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.start(now);
        osc.stop(now + 0.035);
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
        this.droneOsc.frequency.setValueAtTime(196, ctx.currentTime);
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

// Data models
interface UserSession {
  email: string;
  name: string;
}

interface BlockedApp {
  id: string;
  name: string;
  category: string;
  iconLetter: string;
  blocked: boolean;
  intercepts: number;
}

interface FocusMode {
  id: string;
  title: string;
  subtitle: string;
  durationMinutes: number;
  subject: string;
}

interface StudySlot {
  id: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  completed: boolean;
  timeSlot: string;
}

export default function SlabApp() {
  const [mounted, setMounted] = useState(false);

  // Authentication: User session (defaults to null to showcase the Apple-grade login experience)
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");

  // App Theme: 'alabaster' (Screen 4 & 5) or 'dark' (Stealth obsidian)
  const [theme, setTheme] = useState<"alabaster" | "dark">("alabaster");

  // Navigation: "slab" | "schedule" | "activity" | "settings"
  const [activeTab, setActiveTab] = useState<"slab" | "schedule" | "activity" | "settings">("slab");

  // Slab Physical State
  const [isSlabbed, setIsSlabbed] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(50 * 60);
  const [reclaimedSeconds, setReclaimedSeconds] = useState(12 * 3600 + 51 * 60);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [binauralAudio, setBinauralAudio] = useState(false);

  // Focus Modes
  const [modes] = useState<FocusMode[]>([
    {
      id: "mode-no-socials",
      title: "No Socials",
      subtitle: "Blocks 4 apps • 3 websites",
      durationMinutes: 50,
      subject: "Cost Accounting",
    },
    {
      id: "mode-deep-study",
      title: "Deep Academic Flow",
      subtitle: "Blocks 6 apps • Strict Mode",
      durationMinutes: 90,
      subject: "Direct Taxation",
    },
    {
      id: "mode-spaced-revision",
      title: "Spaced Revision",
      subtitle: "Blocks all media • 30m sprint",
      durationMinutes: 30,
      subject: "Revision MCQs",
    },
  ]);
  const [selectedModeId, setSelectedModeId] = useState("mode-no-socials");
  const [showModeDrawer, setShowModeDrawer] = useState(false);

  // Blocked Apps Matrix
  const [apps, setApps] = useState<BlockedApp[]>([
    { id: "ig", name: "Instagram", category: "Social & Reels", iconLetter: "IG", blocked: true, intercepts: 9 },
    { id: "yt", name: "YouTube Shorts", category: "Video & Media", iconLetter: "YT", blocked: true, intercepts: 5 },
    { id: "x", name: "X (Twitter)", category: "Microblogging", iconLetter: "X", blocked: true, intercepts: 3 },
    { id: "reddit", name: "Reddit", category: "Forums", iconLetter: "RD", blocked: true, intercepts: 2 },
    { id: "tiktok", name: "TikTok", category: "Shortform", iconLetter: "TT", blocked: true, intercepts: 0 },
    { id: "netflix", name: "Netflix & OTT", category: "Entertainment", iconLetter: "NF", blocked: false, intercepts: 0 },
  ]);

  // Today's Study Slots (Schedule Tab)
  const [studySlots, setStudySlots] = useState<StudySlot[]>([
    {
      id: "slot-1",
      subject: "Cost Accounting",
      topic: "Marginal Costing & Break-Even Decision Matrix",
      durationMinutes: 50,
      completed: false,
      timeSlot: "09:00 - 09:50 AM",
    },
    {
      id: "slot-2",
      subject: "Direct Taxation",
      topic: "Capital Gains u/s 45-55 & Deductions u/s 80C-80U",
      durationMinutes: 45,
      completed: false,
      timeSlot: "11:30 - 12:15 PM",
    },
    {
      id: "slot-3",
      subject: "Spaced Revision",
      topic: "Formula Sheet & 20 High-Yield Exam MCQs",
      durationMinutes: 30,
      completed: false,
      timeSlot: "04:00 - 04:30 PM",
    },
  ]);

  // Simulated Block Screen Modal
  const [simulatedBlockApp, setSimulatedBlockApp] = useState<BlockedApp | null>(null);
  const [unslabProgress, setUnslabProgress] = useState(0);
  const unslabHoldInterval = useRef<NodeJS.Timeout | null>(null);

  // Intercept Audit Logs
  const [interceptLogs, setInterceptLogs] = useState<
    { id: string; app: string; time: string; focusSubject: string }[]
  >([
    { id: "log-1", app: "Instagram", time: "11:15", focusSubject: "Cost Accounting" },
    { id: "log-2", app: "YouTube Shorts", time: "12:02", focusSubject: "Cost Accounting" },
    { id: "log-3", app: "X (Twitter)", time: "16:40", focusSubject: "Direct Taxation" },
  ]);

  // Carousel Slides for Apple-grade Onboarding
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselSlides = [
    {
      id: "physical-lock",
      caption: "Tactile ceramic lock to break screen addiction.",
      illustration: "/illustrations/desk-coffee.svg",
    },
    {
      id: "curated-study",
      caption: "Curated academic sprints & revision blocks.",
      illustration: "/illustrations/study-notes.svg",
    },
    {
      id: "app-shield",
      caption: "Strict distraction intercept matrix.",
      illustration: "/illustrations/reading-bench.svg",
    },
    {
      id: "binaural-drone",
      caption: "Synthesized 40Hz acoustic focus sanctuary.",
      illustration: "/illustrations/bookshelf.svg",
    },
  ];

  const handleSocialLogin = (provider: "Google" | "GitHub") => {
    if (soundEnabled) audioEngine.playHaptic("unslab");
    const user: UserSession = {
      email: provider === "Google" ? "neeraj@student.ac.in" : "neerajsingh@github.com",
      name: "NEERAJ",
    };
    setCurrentUser(user);
    try {
      localStorage.setItem("still_user", JSON.stringify(user));
    } catch {
      // ignore
    }
  };

  // Safe SSR Mount & LocalStorage load
  useEffect(() => {
    setMounted(true);
    try {
      const savedUser =
        localStorage.getItem("still_user") ||
        localStorage.getItem("intersemester_user") ||
        localStorage.getItem("slab_user");
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
      const savedTheme = localStorage.getItem("slab_theme") as "alabaster" | "dark" | null;
      if (savedTheme) setTheme(savedTheme);
      const savedReclaimed = localStorage.getItem("slab_reclaimed_sec");
      if (savedReclaimed) setReclaimedSeconds(parseInt(savedReclaimed, 10));
    } catch {
      // storage unavailable
    }
  }, []);

  // Timer countdown loop
  useEffect(() => {
    if (!isSlabbed) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsSlabbed(false);
          audioEngine.playHaptic("complete");
          audioEngine.toggleBinauralDrone(false);
          setBinauralAudio(false);
          return 0;
        }
        return prev - 1;
      });
      setReclaimedSeconds((prev) => {
        const next = prev + 1;
        try {
          localStorage.setItem("slab_reclaimed_sec", next.toString());
        } catch {
          // ignore
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSlabbed]);

  // Active Focus Mode
  const activeMode = modes.find((m) => m.id === selectedModeId) || modes[0];

  // Slab Toggle (The physical action)
  const handleToggleSlab = () => {
    if (soundEnabled) audioEngine.playHaptic(isSlabbed ? "unslab" : "slab");
    if (!isSlabbed) {
      setSecondsRemaining(activeMode.durationMinutes * 60);
      setIsSlabbed(true);
      if (binauralAudio) audioEngine.toggleBinauralDrone(true);
    } else {
      setIsSlabbed(false);
      audioEngine.toggleBinauralDrone(false);
    }
  };

  // App Toggle
  const handleToggleApp = (id: string) => {
    if (soundEnabled) audioEngine.playHaptic("click");
    setApps((prev) =>
      prev.map((app) => (app.id === id ? { ...app, blocked: !app.blocked } : app))
    );
  };

  // Test Open App Simulation
  const simulateOpenApp = (app: BlockedApp) => {
    if (!isSlabbed) {
      alert(`SLAB is idle. ${app.name} opens normally.`);
      return;
    }
    if (!app.blocked) {
      alert(`${app.name} is whitelisted in ${activeMode.title}.`);
      return;
    }
    if (soundEnabled) audioEngine.playHaptic("block");
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    setApps((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, intercepts: a.intercepts + 1 } : a))
    );
    setInterceptLogs((prev) => [
      { id: `log-${Date.now()}`, app: app.name, time: timeStr, focusSubject: activeMode.subject },
      ...prev,
    ]);
    setSimulatedBlockApp(app);
  };

  // Emergency Hold to Unslab
  const startHoldUnslab = () => {
    setUnslabProgress(0);
    const start = Date.now();
    const duration = 3000;

    unslabHoldInterval.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setUnslabProgress(pct);

      if (pct >= 100) {
        if (unslabHoldInterval.current) clearInterval(unslabHoldInterval.current);
        setIsSlabbed(false);
        setSimulatedBlockApp(null);
        setUnslabProgress(0);
        audioEngine.playHaptic("unslab");
        audioEngine.toggleBinauralDrone(false);
      }
    }, 40);
  };

  const cancelHoldUnslab = () => {
    if (unslabHoldInterval.current) {
      clearInterval(unslabHoldInterval.current);
      unslabHoldInterval.current = null;
    }
    setUnslabProgress(0);
  };

  // Toggle Theme
  const toggleTheme = () => {
    const next = theme === "alabaster" ? "dark" : "alabaster";
    setTheme(next);
    audioEngine.playHaptic("click");
    try {
      localStorage.setItem("slab_theme", next);
    } catch {
      // ignore
    }
  };

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail.trim()) return;
    const user: UserSession = {
      email: inputEmail.trim(),
      name: inputEmail.split("@")[0].toUpperCase(),
    };
    setCurrentUser(user);
    try {
      localStorage.setItem("slab_user", JSON.stringify(user));
    } catch {
      // ignore
    }
    audioEngine.playHaptic("unslab");
    setShowEmailForm(false);
  };

  // Instant demo login
  const handleInstantDemoLogin = () => {
    const user: UserSession = {
      email: "neeraj@student.ac.in",
      name: "NEERAJ",
    };
    setCurrentUser(user);
    try {
      localStorage.setItem("slab_user", JSON.stringify(user));
    } catch {
      // ignore
    }
    audioEngine.playHaptic("unslab");
  };

  // Sign out / Lock Device
  const handleSignOut = () => {
    audioEngine.playHaptic("click");
    setIsSlabbed(false);
    audioEngine.toggleBinauralDrone(false);
    setCurrentUser(null);
    try {
      localStorage.removeItem("slab_user");
    } catch {
      // ignore
    }
  };

  const formatReclaimed = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    return `${hours}h ${mins}m today`;
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white text-[#999999] flex items-center justify-center font-mono text-xs tracking-widest">
        INITIALIZING STILL...
      </div>
    );
  }

  // =========================================================================
  // APPLE SENIOR DESIGNER LEVEL LOGIN SCREEN (GOLDEN RATIO SPACING & HARMONY)
  // Brand: STILL // Featuring Tegaki dynamic hand-drawn stroke accents
  // & Golden Ratio (phi ~ 1.618) spacing scale [8, 13, 21, 26, 34, 52]
  // =========================================================================
  if (!currentUser) {
    const activeSlide = carouselSlides[carouselIndex];

    return (
      <div
        suppressHydrationWarning
        className="min-h-screen bg-[#FBFBFD] sm:py-8 flex items-center justify-center"
      >
        <div className="w-full max-w-[400px] min-h-screen sm:min-h-[820px] bg-white sm:rounded-[36px] sm:border sm:border-[#E5E7EB] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.06)] flex flex-col justify-between px-[26px] pt-[26px] pb-[21px] relative overflow-hidden text-[#111110] font-absans select-none">
          {/* Top Brand Header (Golden Height & Alignment) */}
          <header className="flex items-center justify-between pb-[13px]">
            <div className="flex items-center gap-[10px]">
              {/* Tactile Monolith Mark (Golden 30px Box) */}
              <div className="w-[30px] h-[30px] rounded-xl bg-[#111110] text-white flex items-center justify-center shadow-xs">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M4 3h-1v1" />
                  <path d="M20 3h1v1" />
                  <path d="M4 21h-1v-1" />
                  <path d="M20 21h1v-1" />
                  <circle cx="12" cy="12" r="2.8" fill="currentColor" />
                </svg>
              </div>
              <span className="font-apfel text-xs tracking-[0.24em] font-black uppercase text-[#111110]">
                STILL
              </span>
            </div>

            <button
              onClick={() => alert("STILL Hardware Companion • Support 24/7 at support@stillfocus.com")}
              className="text-xs font-absans text-[#888888] hover:text-[#111110] transition-colors cursor-pointer"
            >
              Support
            </button>
          </header>

          {/* Centerpiece: Golden Proportion Hero Artwork & Typography */}
          <div className="my-auto flex flex-col items-center w-full">
            {/* Visual Stage: Golden Height with Premium Warm Alabaster Ceramic Plinth */}
            <div className="w-full h-[250px] sm:h-[260px] flex items-center justify-center relative select-none">
              {/* Soft Ambient Warm Halo */}
              <div className="absolute w-[85%] h-[220px] rounded-full bg-gradient-to-tr from-[#FCEEE7]/60 via-[#F6F2E9]/70 to-[#ECE4D8]/50 blur-2xl -z-10 pointer-events-none" />

              {/* Premium Tactile Ceramic Plinth Backdrop */}
              <div className="w-full h-[240px] rounded-[32px] bg-gradient-to-b from-[#F8F6F2] via-[#F3EFE8] to-[#EAE5DC] border border-[#E8E2D6]/70 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] relative flex items-center justify-center p-4 overflow-hidden">
                {/* Hand-Drawn Tegaki Delicate Organic Ring Accent */}
                <svg
                  viewBox="0 0 200 200"
                  className="absolute inset-0 w-full h-full text-[#111110]/[0.03] pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="100" cy="100" r="88" strokeDasharray="5 5" />
                  <path d="M 30 170 Q 100 190 170 170" strokeLinecap="round" strokeDasharray="6 4" />
                </svg>

                {/* Coral Red Hand-Drawn Spark & Dot Accent (Tegaki inspired) */}
                <div className="absolute top-[16%] left-[20%] text-[#FF5F56] text-xl select-none tegaki-float pointer-events-none z-10">
                  ✦
                </div>
                <div className="absolute top-[26%] right-[20%] w-2 h-2 rounded-full bg-[#FF5F56] select-none pointer-events-none z-10" />

                {/* Full-Size Vector Artwork */}
                <img
                  src={activeSlide.illustration}
                  alt={activeSlide.caption}
                  className="w-full h-full max-h-[205px] object-contain filter contrast-105 transition-all duration-300 transform hover:scale-[1.02] relative z-0"
                />
              </div>
            </div>

            {/* Apple Senior Designer Typography: Golden Spacing (mt-34px) */}
            <div className="mt-[28px] sm:mt-[34px] w-full text-left">
              <h1 className="text-[34px] leading-[1.15] font-apfel font-bold tracking-tight text-[#111110]">
                <span className="block animate-text-reveal-1">
                  Silence the noise.
                </span>
                <span className="block animate-text-reveal-2 text-[#111110]">
                  Reclaim your{" "}
                  <span className="relative inline-block text-[#111110]">
                    focus.
                    {/* Tegaki Dynamic Organic Brush Stroke Underline */}
                    <svg
                      viewBox="0 0 110 14"
                      className="absolute -bottom-2 left-0 w-full overflow-visible text-[#FF5F56] pointer-events-none tegaki-stroke-animated"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M 3 8 C 30 13, 75 13, 106 6" />
                    </svg>
                  </span>
                </span>
              </h1>
              {/* Golden Gap (mt-13px) */}
              <p className="mt-[13px] text-[14px] leading-[22px] font-absans text-[#666666] animate-text-reveal-3">
                A tactile hardware sanctuary engineered for deep work.
              </p>
            </div>

            {/* Inline Email Drawer if Toggled */}
            {showEmailForm && (
              <form
                onSubmit={handleLoginSubmit}
                className="w-full mt-[13px] p-[13px] rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] space-y-[10px] animate-in fade-in duration-150"
              >
                <div className="text-xs font-absans font-medium text-[#111110]">
                  Enter your student or university email
                </div>
                <input
                  type="email"
                  placeholder="student@domain.ac.in"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  className="w-full px-[13px] py-[10px] rounded-xl border border-[#E5E7EB] bg-white text-xs font-absans text-[#111110] focus:outline-none focus:border-[#111110]"
                  autoFocus
                  required
                />
                <div className="flex items-center gap-[8px] pt-1">
                  <button
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                    className="w-1/3 py-[10px] text-xs font-absans text-[#666666] hover:text-[#111110] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-[10px] rounded-xl bg-[#111110] text-white text-xs font-absans font-medium hover:bg-black cursor-pointer shadow-xs"
                  >
                    Continue
                  </button>
                </div>
              </form>
            )}

            {/* Primary & Secondary Authentication Buttons: Golden Gap (mt-34px) */}
            <div className="w-full mt-[28px] sm:mt-[34px] space-y-[13px]">
              {/* Primary Black Button: Continue with Google (Golden Height 52px) */}
              <button
                onClick={() => handleSocialLogin("Google")}
                className="w-full h-[52px] px-4 rounded-2xl bg-[#111110] hover:bg-black active:scale-[0.99] text-white font-absans font-semibold text-[14px] transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm"
              >
                <span className="w-5 h-5 rounded-md bg-white flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                </span>
                <span>Continue with Google</span>
              </button>

              {/* Secondary Row: GitHub & Email (Golden Gap 13px) */}
              <div className="grid grid-cols-2 gap-[13px]">
                <button
                  onClick={() => handleSocialLogin("GitHub")}
                  className="h-[46px] px-4 rounded-xl border border-[#E5E7EB] bg-white hover:bg-gray-50 active:scale-[0.99] text-[#111110] font-absans font-medium text-[13px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </button>

                <button
                  onClick={() => setShowEmailForm(!showEmailForm)}
                  className="h-[46px] px-4 rounded-xl border border-[#E5E7EB] bg-white hover:bg-gray-50 active:scale-[0.99] text-[#111110] font-absans font-medium text-[13px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span>Email</span>
                </button>
              </div>
            </div>

            {/* Legal Notice (Golden Gap mt-13px) */}
            <p className="mt-[13px] text-[11px] leading-[16px] text-center text-[#888888] font-absans">
              By continuing you agree to our{" "}
              <a href="#terms" className="underline text-[#555555] hover:text-[#111110]">
                Terms
              </a>{" "}
              and{" "}
              <a href="#privacy" className="underline text-[#555555] hover:text-[#111110]">
                Privacy Policy
              </a>
              .
            </p>
          </div>

          {/* Bottom Footer (Golden Padding pt-21px) */}
          <footer className="pt-[21px] flex items-center justify-between text-[11px] text-[#888888] font-absans border-t border-[#F3F4F6]">
            <span>© 2026 Still Technologies Inc.</span>
            <div className="flex items-center gap-[13px]">
              <a href="#privacy" className="hover:text-[#111110] transition-colors">
                Privacy
              </a>
              <a href="#terms" className="hover:text-[#111110] transition-colors">
                Terms
              </a>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // =========================================================================
  // =========================================================================
  // =========================================================================
  // SCREEN 4 & 5: AUTHENTICATED STILL PHYSICAL FOCUS COCKPIT
  // Dual Experience: True Desktop Studio Dashboard (lg:) + Mobile App (<lg:)
  // =========================================================================
  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#FBFBFD] sm:py-6 lg:py-10 flex items-center justify-center font-absans"
    >
      <div className="w-full max-w-[410px] lg:max-w-6xl min-h-screen sm:min-h-[820px] lg:min-h-[760px] bg-white sm:rounded-[36px] sm:border sm:border-[#E5E7EB] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.06)] flex flex-col lg:flex-row justify-between px-[26px] pt-[26px] pb-[21px] lg:p-10 relative overflow-hidden text-[#111110] select-none">
        {/* =============================================================== */}
        {/* LEFT PANE: FOCUS STAGE & HARDWARE CONTROL (Full on Desktop)     */}
        {/* =============================================================== */}
        <div className="w-full lg:w-[50%] flex flex-col justify-between space-y-6 lg:pr-8">
          {/* Top Header: Brand Monolith Mark & Telemetry Pill */}
          <header className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-[10px]">
              {/* Tactile Monolith Mark (Golden 30px Box) */}
              <div className="w-[30px] h-[30px] rounded-xl bg-[#111110] text-white flex items-center justify-center shadow-xs">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M4 3h-1v1" />
                  <path d="M20 3h1v1" />
                  <path d="M4 21h-1v-1" />
                  <path d="M20 21h1v-1" />
                  <circle cx="12" cy="12" r="2.8" fill="currentColor" />
                </svg>
              </div>
              <span className="font-apfel text-xs tracking-[0.24em] font-black uppercase text-[#111110]">
                STILL
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Click Sound Toggle */}
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  audioEngine.playHaptic("click");
                }}
                className="p-1.5 rounded-full border border-[#E5E7EB] text-[#777777] hover:text-[#111110] transition-colors cursor-pointer"
                title={soundEnabled ? "Mute clicks" : "Enable clicks"}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Iconic Reclaimed Telemetry Pill ("12h 51m today") */}
              <div className="px-3 py-1 rounded-full text-xs font-absans font-medium bg-[#FAFAFA] border border-[#E5E7EB] text-[#111110] shadow-xs">
                {formatReclaimed(reclaimedSeconds)}
              </div>
            </div>
          </header>

          {/* Visual Stage: Golden Height with Premium Warm Alabaster Plinth */}
          <div className="w-full h-[250px] sm:h-[260px] flex items-center justify-center relative select-none">
            {/* Soft Ambient Warm Halo */}
            <div className="absolute w-[85%] h-[220px] rounded-full bg-gradient-to-tr from-[#FCEEE7]/60 via-[#F6F2E9]/70 to-[#ECE4D8]/50 blur-2xl -z-10 pointer-events-none" />

            {/* Premium Tactile Ceramic Plinth Backdrop */}
            <div className="w-full h-[240px] rounded-[32px] bg-gradient-to-b from-[#F8F6F2] via-[#F3EFE8] to-[#EAE5DC] border border-[#E8E2D6]/70 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] relative flex items-center justify-center p-4 overflow-hidden">
              {/* Hand-Drawn Tegaki Delicate Organic Ring Accent */}
              <svg
                viewBox="0 0 200 200"
                className="absolute inset-0 w-full h-full text-[#111110]/[0.03] pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="100" cy="100" r="88" strokeDasharray="5 5" />
                <path d="M 30 170 Q 100 190 170 170" strokeLinecap="round" strokeDasharray="6 4" />
              </svg>

              {/* Coral Red Hand-Drawn Spark & Dot Accent (Tegaki inspired) */}
              <div className="absolute top-[16%] left-[18%] text-[#FF5F56] text-xl select-none tegaki-float pointer-events-none z-10">
                ✦
              </div>
              <div className="absolute top-[26%] right-[18%] w-2 h-2 rounded-full bg-[#FF5F56] select-none pointer-events-none z-10" />

              {/* The 3D Tactile Ceramic Physical STILL Puck */}
              <div
                onClick={handleToggleSlab}
                className={`w-44 h-44 rounded-[28px] transition-all duration-300 flex flex-col items-center justify-center relative select-none cursor-pointer ${
                  isSlabbed
                    ? "bg-white border-2 border-emerald-500 shadow-[0_15px_30px_-5px_rgba(16,185,129,0.2),inset_0_2px_4px_rgba(0,0,0,0.05)] scale-98"
                    : "bg-gradient-to-b from-white to-[#F2EFE8] border border-white/90 shadow-[0_22px_45px_-12px_rgba(0,0,0,0.14),0_8px_16px_-4px_rgba(0,0,0,0.06),inset_0_2px_2px_rgba(255,255,255,0.95)] hover:scale-[1.02] active:scale-95"
                }`}
              >
                {/* Engraved Corner Brackets */}
                <svg
                  viewBox="0 0 100 100"
                  className={`absolute inset-3 w-[calc(100%-24px)] h-[calc(100%-24px)] pointer-events-none transition-colors ${
                    isSlabbed ? "text-emerald-500/70" : "text-[#B8B4AC]"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                >
                  <path d="M22 12H14a4 4 0 0 0-4 4v8" />
                  <path d="M78 12h8a4 4 0 0 1 4 4v8" />
                  <path d="M22 88H14a4 4 0 0 1-4-4v-8" />
                  <path d="M78 88h8a4 4 0 0 0 4-4v-8" />
                </svg>

                {/* Central Engraved STILL Text or Countdown */}
                {isSlabbed ? (
                  <div className="space-y-1 z-10 text-center">
                    <div className="font-apfel text-3xl font-bold tracking-tight text-emerald-600">
                      {formatTimer(secondsRemaining)}
                    </div>
                    <div className="text-[10px] font-mono tracking-widest text-emerald-600 font-bold uppercase flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      STILL ACTIVE
                    </div>
                  </div>
                ) : (
                  <div className="z-10 flex flex-col items-center">
                    <span className="font-apfel text-2xl font-black tracking-[0.28em] pl-1 text-[#2B2926]">
                      STILL
                    </span>
                    <span className="text-[9px] font-mono tracking-widest text-[#88857F] uppercase mt-0.5">
                      TAP TO LOCK
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Typography: Mode Information & Golden Hierarchy */}
          <div className="w-full text-left">
            <h1 className="text-[32px] sm:text-[34px] leading-[1.15] font-apfel font-bold tracking-tight text-[#111110]">
              <span className="block animate-text-reveal-1">
                {isSlabbed ? "Focus locked." : "Silence the noise."}
              </span>
              <span className="block animate-text-reveal-2 text-[#111110]">
                <span className="relative inline-block text-[#111110]">
                  {activeMode.title}
                  {/* Tegaki Dynamic Organic Brush Stroke Underline */}
                  <svg
                    viewBox="0 0 110 14"
                    className="absolute -bottom-2 left-0 w-full overflow-visible text-[#FF5F56] pointer-events-none tegaki-stroke-animated"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M 3 8 C 30 13, 75 13, 106 6" />
                  </svg>
                </span>
              </span>
            </h1>
            <p className="mt-[10px] text-[14px] leading-[22px] font-absans text-[#666666] animate-text-reveal-3">
              {activeMode.subtitle} • {activeMode.durationMinutes}m focus block.
            </p>

            <button
              onClick={() => setShowModeDrawer(true)}
              className="mt-[8px] text-xs font-absans font-medium text-[#111110] hover:text-[#555] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Manage modes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Zone: Primary Button & Secondary Grid */}
          <div className="w-full space-y-[12px]">
            {/* Primary Black Button */}
            <button
              onClick={handleToggleSlab}
              className={`w-full h-[52px] px-4 rounded-2xl font-absans font-semibold text-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99] ${
                isSlabbed
                  ? "bg-[#D9383A] text-white hover:bg-[#C53032]"
                  : "bg-[#111110] text-white hover:bg-black"
              }`}
            >
              <span>{isSlabbed ? "Tap to Unstill (End Sprint)" : "Tap or hold to Still"}</span>
            </button>

            {/* Secondary Row: 4 Apps Blocked & 40Hz Audio Drone */}
            <div className="grid grid-cols-2 gap-[12px]">
              <button
                onClick={() => simulateOpenApp(apps[0])}
                className="h-[46px] px-4 rounded-xl border border-[#E5E7EB] bg-white hover:bg-gray-50 active:scale-[0.99] text-[#111110] font-absans font-medium text-[13px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Shield className="w-4 h-4 text-[#111110]" />
                <span>4 Apps Blocked</span>
              </button>

              <button
                onClick={() => {
                  const next = !binauralAudio;
                  setBinauralAudio(next);
                  audioEngine.toggleBinauralDrone(next);
                }}
                className={`h-[46px] px-4 rounded-xl border transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99] font-absans font-medium text-[13px] ${
                  binauralAudio
                    ? "bg-[#F5FBF7] border-emerald-400 text-emerald-700"
                    : "border-[#E5E7EB] bg-white hover:bg-gray-50 text-[#111110]"
                }`}
              >
                <Headphones className="w-4 h-4" />
                <span>{binauralAudio ? "Drone 40Hz On" : "Drone 40Hz Off"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* =============================================================== */}
        {/* RIGHT PANE: DESKTOP STUDIO DASHBOARD (lg:block, hidden on mobile)*/}
        {/* =============================================================== */}
        <div className="hidden lg:flex lg:w-[50%] flex-col justify-between space-y-6 lg:pl-10 lg:border-l lg:border-[#F2F1EC]">
          {/* Top User Profile & Streak Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-[#F3F4F6]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#111110] text-white flex items-center justify-center font-apfel text-xs font-bold shadow-xs">
                {currentUser.name.slice(0, 2)}
              </div>
              <div>
                <div className="text-xs font-apfel font-bold text-[#111110]">{currentUser.name}</div>
                <div className="text-[11px] text-[#777777] font-absans">{currentUser.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 font-apfel font-bold text-amber-500 text-xs px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/60">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                <span>6 DAY STREAK</span>
              </div>
              <button
                onClick={handleSignOut}
                className="px-3 py-1 rounded-full border border-red-500/20 text-xs font-mono text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                Log out
              </button>
            </div>
          </div>

          {/* Interactive Study Schedule */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-apfel font-bold text-[#111110] uppercase tracking-wider">
                Today&apos;s Focus Schedule
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#FAFAFA] border border-[#E5E7EB] text-[#555555]">
                {studySlots.filter((s) => s.completed).length}/{studySlots.length} DONE
              </span>
            </div>

            <div className="space-y-2.5">
              {studySlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-3 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#D1D5DB] transition-all flex items-center justify-between shadow-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#FAFAFA] border border-[#E5E7EB] text-[#555555]">
                        {slot.timeSlot}
                      </span>
                      <span className="text-[10px] font-mono text-[#888888]">{slot.durationMinutes}m</span>
                    </div>
                    <div
                      className={`text-xs font-apfel font-bold ${
                        slot.completed ? "line-through text-[#999999]" : "text-[#111110]"
                      }`}
                    >
                      {slot.subject}
                    </div>
                    <div className="text-[11px] text-[#666666] font-absans">{slot.topic}</div>
                  </div>

                  <button
                    onClick={() => {
                      audioEngine.playHaptic("complete");
                      setStudySlots((prev) =>
                        prev.map((s) => (s.id === slot.id ? { ...s, completed: !s.completed } : s))
                      );
                    }}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      slot.completed
                        ? "bg-emerald-500 text-white"
                        : "bg-[#FAFAFA] border border-[#E5E7EB] text-[#888888] hover:text-[#111110]"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Distraction Matrix Checklist */}
          <div className="p-3.5 rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] space-y-2">
            <div className="flex items-center justify-between text-xs font-apfel font-bold uppercase tracking-wider">
              <span>Distraction Shield</span>
              <span className="font-mono text-[10px] text-[#777777]">
                {apps.filter((a) => a.blocked).length} apps locked
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleToggleApp(app.id)}
                  className={`p-2 rounded-xl text-[11px] font-absans flex items-center justify-between border cursor-pointer transition-colors ${
                    app.blocked
                      ? "bg-white border-[#E5E7EB] text-[#111110] font-medium shadow-xs"
                      : "bg-transparent border-dashed border-[#E5E7EB] text-[#999999]"
                  }`}
                >
                  <span className="truncate">{app.name.split(" ")[0]}</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      app.blocked ? "bg-emerald-500" : "bg-transparent border border-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Reclaimed Time & Distraction Prevented Log */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-3.5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-apfel font-bold uppercase tracking-wider text-[#777777]">
                Impulse Intercept Log
              </span>
              <span className="text-[10px] font-mono text-emerald-600 font-semibold">
                ACTIVE PROTECTION
              </span>
            </div>
            <div className="divide-y divide-[#F3F4F6] max-h-28 overflow-y-auto pr-1">
              {interceptLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="font-apfel font-semibold text-[#111110]">{log.app}</span>
                    <span className="text-[11px] text-[#777777]">intercepted</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#888888]">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =============================================================== */}
        {/* MOBILE BOTTOM NAVIGATION BAR (<lg: only)                        */}
        {/* =============================================================== */}
        <footer className="lg:hidden pt-[18px] flex items-center justify-around select-none border-t border-[#F3F4F6] text-[#888888] mt-4">
          {[
            { id: "slab", label: "Still" },
            { id: "schedule", label: "Schedule" },
            { id: "activity", label: "Activity" },
            { id: "settings", label: "Settings" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  if (soundEnabled) audioEngine.playHaptic("click");
                }}
                className={`flex flex-col items-center gap-1.5 cursor-pointer transition-colors ${
                  isActive ? "text-[#111110] font-semibold" : "text-[#888888] hover:text-[#333333]"
                }`}
              >
                <span className="text-xs font-absans">{tab.label}</span>
                <span
                  className={`w-1 h-1 rounded-full transition-all ${
                    isActive ? "bg-[#111110]" : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </footer>
      </div>

        {/* ================================================================= */}
        {/* TAB 2: SCHEDULE (Daily Academic Timetable & Routines)             */}
        {/* ================================================================= */}
        {activeTab === "schedule" && (
          <main className="my-auto py-2 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-apfel font-bold text-[#111110] tracking-tight">
                  Focus Schedule
                </h2>
                <p className="text-xs text-[#777777] font-absans">
                  Today&apos;s spaced academic revision intervals.
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[#FAFAFA] border border-[#E5E7EB] text-[#111110]">
                {studySlots.filter((s) => s.completed).length}/{studySlots.length} DONE
              </span>
            </div>

            <div className="space-y-3">
              {studySlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 rounded-2xl border border-[#E5E7EB] bg-white hover:border-[#D1D5DB] transition-all shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#FAFAFA] border border-[#E5E7EB] text-[#555555]">
                          {slot.timeSlot}
                        </span>
                        <span className="text-[10px] font-mono text-[#888888]">
                          {slot.durationMinutes}m
                        </span>
                      </div>
                      <h3
                        className={`text-sm font-apfel font-bold ${
                          slot.completed ? "line-through text-[#999999]" : "text-[#111110]"
                        }`}
                      >
                        {slot.subject}
                      </h3>
                      <p className="text-xs text-[#666666] font-absans">{slot.topic}</p>
                    </div>

                    <button
                      onClick={() => {
                        audioEngine.playHaptic("complete");
                        setStudySlots((prev) =>
                          prev.map((s) => (s.id === slot.id ? { ...s, completed: !s.completed } : s))
                        );
                      }}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        slot.completed
                          ? "bg-emerald-500 text-white"
                          : "bg-[#FAFAFA] border border-[#E5E7EB] text-[#888888] hover:text-[#111110]"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Shielded Apps Checklist */}
            <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA]">
              <div className="flex items-center justify-between text-xs font-apfel font-bold uppercase tracking-wider mb-2.5">
                <span>Shielded Distractions</span>
                <span className="font-mono text-[10px] text-[#777777]">
                  {apps.filter((a) => a.blocked).length} active
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {apps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleToggleApp(app.id)}
                    className={`p-2.5 rounded-xl text-[11px] font-absans flex items-center justify-between border cursor-pointer transition-colors ${
                      app.blocked
                        ? "bg-white border-[#E5E7EB] text-[#111110] font-medium shadow-xs"
                        : "bg-transparent border-dashed border-[#E5E7EB] text-[#999999]"
                    }`}
                  >
                    <span>{app.name.split(" ")[0]}</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        app.blocked ? "bg-emerald-500" : "bg-transparent border border-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </main>
        )}

        {/* ================================================================= */}
        {/* TAB 3: ACTIVITY (Reclaimed Metrics & Blocked Impulse Log)         */}
        {/* ================================================================= */}
        {activeTab === "activity" && (
          <main className="my-auto py-2 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-apfel font-bold text-[#111110] tracking-tight">
                  Activity & Focus
                </h2>
                <p className="text-xs text-[#777777] font-absans">
                  Reclaimed time and intercepted screen impulses.
                </p>
              </div>
              <div className="flex items-center gap-1 font-apfel font-bold text-amber-500 text-xs px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/60">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                <span>6 DAY STREAK</span>
              </div>
            </div>

            {/* Main Stats Card */}
            <div className="p-5 rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#777777]">
                NET RECLAIMED TIME TODAY
              </div>
              <div className="text-3xl font-apfel font-bold mt-1 text-[#111110]">
                {Math.floor(reclaimedSeconds / 3600)}h {Math.floor((reclaimedSeconds % 3600) / 60)}m
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-1">
                Saved from infinite reels & social feeds
              </div>
            </div>

            {/* Impulse Intercept Audit Trail */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white divide-y divide-[#F3F4F6] overflow-hidden shadow-xs">
              <div className="p-3.5 text-xs font-apfel font-bold uppercase tracking-wider text-[#777777]">
                Prevented Distraction Attempts
              </div>
              {interceptLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <div>
                      <div className="text-xs font-apfel font-bold text-[#111110]">{log.app} Blocked</div>
                      <div className="text-[10px] text-[#777777]">During {log.focusSubject}</div>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-[#888888]">{log.time}</span>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* ================================================================= */}
        {/* TAB 4: SETTINGS (Hardware Profile & Log Out)                      */}
        {/* ================================================================= */}
        {activeTab === "settings" && (
          <main className="my-auto py-2 space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-apfel font-bold text-[#111110] tracking-tight">
                Settings & Device
              </h2>
              <p className="text-xs text-[#777777] font-absans">
                STILL hardware profile and account management.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-white divide-y divide-[#F3F4F6] overflow-hidden shadow-xs">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-apfel font-bold text-[#111110]">Active Profile</div>
                  <div className="text-xs text-[#777777]">{currentUser.email}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded-full border border-red-500/30 text-xs font-mono text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  Log out
                </button>
              </div>

              <div
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  audioEngine.playHaptic("click");
                }}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="text-sm font-apfel font-bold text-[#111110]">Tactile Audio Clicks</div>
                  <div className="text-xs text-[#777777]">Synthesized mechanical haptics</div>
                </div>
                <span className="text-xs font-mono font-medium text-[#111110]">
                  {soundEnabled ? "ENABLED" : "MUTED"}
                </span>
              </div>

              <div
                onClick={() => simulateOpenApp(apps[0])}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="text-sm font-apfel font-bold text-[#111110]">Test Impenetrable Block</div>
                  <div className="text-xs text-[#777777]">Trigger full-screen interception overlay</div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#888888]" />
              </div>
            </div>
          </main>
        )}

        {/* ================================================================= */}
        {/* BOTTOM NAVIGATION BAR (Exact 4 Tabs: Still, Schedule, Activity, Settings) */}
        {/* ================================================================= */}
        <footer className="pt-[18px] flex items-center justify-around select-none border-t border-[#F3F4F6] text-[#888888]">
          {[
            { id: "slab", label: "Still" },
            { id: "schedule", label: "Schedule" },
            { id: "activity", label: "Activity" },
            { id: "settings", label: "Settings" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  if (soundEnabled) audioEngine.playHaptic("click");
                }}
                className={`flex flex-col items-center gap-1.5 cursor-pointer transition-colors ${
                  isActive ? "text-[#111110] font-semibold" : "text-[#888888] hover:text-[#333333]"
                }`}
              >
                <span className="text-xs font-absans">{tab.label}</span>
                <span
                  className={`w-1 h-1 rounded-full transition-all ${
                    isActive ? "bg-[#111110]" : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </footer>
      </div>

      {/* ================================================================= */}
      {/* MANAGE MODES DRAWER / MODAL                                       */}
      {/* ================================================================= */}
      {showModeDrawer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in select-none">
          <div className="w-full max-w-[390px] rounded-t-3xl sm:rounded-3xl p-6 space-y-4 animate-in slide-in-from-bottom duration-200 border border-[#E5E7EB] bg-white shadow-2xl text-[#111110]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-apfel text-lg font-bold text-[#111110]">Select Focus Mode</h3>
                <p className="text-xs text-[#777777] font-absans">Choose focus duration & strictness.</p>
              </div>
              <button
                onClick={() => setShowModeDrawer(false)}
                className="p-1.5 rounded-full text-[#888888] hover:text-[#111110] cursor-pointer hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 pt-1">
              {modes.map((mode) => (
                <div
                  key={mode.id}
                  onClick={() => {
                    setSelectedModeId(mode.id);
                    setSecondsRemaining(mode.durationMinutes * 60);
                    setShowModeDrawer(false);
                    audioEngine.playHaptic("click");
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedModeId === mode.id
                      ? "bg-[#FAFAFA] border-[#111110] shadow-sm"
                      : "bg-white border-[#E5E7EB] hover:bg-[#FAFAFA]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-apfel font-bold text-sm text-[#111110]">{mode.title}</div>
                      <div className="text-xs text-[#777777] font-absans">{mode.subtitle}</div>
                    </div>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-[#111110]">
                      {mode.durationMinutes}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* SIMULATED FULL-SCREEN SLAB BLOCK SCREEN                           */}
      {/* ================================================================= */}
      {simulatedBlockApp && (
        <div className="fixed inset-0 z-50 bg-[#000000] text-white flex flex-col justify-between p-8 animate-in fade-in duration-200 select-none">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white" />
              <span className="font-apfel text-xs tracking-[0.3em] font-bold">
                SLAB IS ACTIVE
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
                {simulatedBlockApp.name} IS SLABBED
              </h1>
              <p className="text-sm font-absans text-[#888888] leading-relaxed">
                You committed to focusing on{" "}
                <span className="text-white font-medium">{activeMode.subject}</span>. Put your device down.
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
              className="w-full py-4 rounded-full bg-white text-[#0A0A0A] font-apfel font-bold text-sm tracking-wide uppercase hover:bg-[#E5E5E5] transition-colors cursor-pointer"
            >
              Return to Study
            </button>

            {/* Emergency Hold to Unslab */}
            <div className="pt-2 space-y-2">
              <button
                onMouseDown={startHoldUnslab}
                onMouseUp={cancelHoldUnslab}
                onTouchStart={startHoldUnslab}
                onTouchEnd={cancelHoldUnslab}
                className="text-xs font-mono text-[#666666] hover:text-[#999999] transition-colors cursor-pointer select-none"
              >
                {unslabProgress > 0 ? `HOLDING... ${unslabProgress}%` : "Press & hold 3s to emergency unslab"}
              </button>

              {unslabProgress > 0 && (
                <div className="w-full h-1 bg-[#222222] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-75"
                    style={{ width: `${unslabProgress}%` }}
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
