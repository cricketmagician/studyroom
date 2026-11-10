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
  Settings as SettingsIcon,
  Sun,
  Moon,
  ArrowRight,
  Shield,
  Volume2,
  VolumeX,
  LogOut,
  Mail,
  Lock as LockIcon,
  Sparkles,
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
        // Deep tactile heavy mechanical thud
        osc.type = "sine";
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.16);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === "unbrick") {
        // Crisp spring release click
        osc.type = "sine";
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.18);
        gain.gain.setValueAtTime(0.25, now);
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
        osc.frequency.setValueAtTime(700, now);
        gain.gain.setValueAtTime(0.08, now);
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

export default function BrickApp() {
  const [mounted, setMounted] = useState(false);

  // Authentication: User session (defaults to null to show Screen 2 login!)
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");

  // App Theme: 'alabaster' (Screen 4 & 5) or 'dark' (Screen 1, 2, 3)
  const [theme, setTheme] = useState<"alabaster" | "dark">("alabaster");

  // Navigation: "brick" | "schedule" | "activity" | "settings"
  const [activeTab, setActiveTab] = useState<"brick" | "schedule" | "activity" | "settings">("brick");

  // Brick Physical State
  const [isBricked, setIsBricked] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(50 * 60);
  const [reclaimedSeconds, setReclaimedSeconds] = useState(12 * 3600 + 51 * 60); // "12h 51m today" from screenshot!
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
      title: "Deep Academic Study",
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
  const [unbrickProgress, setUnbrickProgress] = useState(0);
  const unbrickHoldInterval = useRef<NodeJS.Timeout | null>(null);

  // Intercept Audit Logs
  const [interceptLogs, setInterceptLogs] = useState<
    { id: string; app: string; time: string; focusSubject: string }[]
  >([
    { id: "log-1", app: "Instagram", time: "11:15", focusSubject: "Cost Accounting" },
    { id: "log-2", app: "YouTube Shorts", time: "12:02", focusSubject: "Cost Accounting" },
    { id: "log-3", app: "X (Twitter)", time: "16:40", focusSubject: "Direct Taxation" },
  ]);

  // Safe SSR Mount & LocalStorage load
  useEffect(() => {
    setMounted(true);
    try {
      const savedUser = localStorage.getItem("brick_user");
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
      const savedTheme = localStorage.getItem("brick_theme") as "alabaster" | "dark" | null;
      if (savedTheme) setTheme(savedTheme);
      const savedReclaimed = localStorage.getItem("brick_reclaimed_sec");
      if (savedReclaimed) setReclaimedSeconds(parseInt(savedReclaimed, 10));
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
      setReclaimedSeconds((prev) => {
        const next = prev + 1;
        try {
          localStorage.setItem("brick_reclaimed_sec", next.toString());
        } catch {
          // ignore
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBricked]);

  // Active Focus Mode
  const activeMode = modes.find((m) => m.id === selectedModeId) || modes[0];

  // Brick Toggle (The physical action)
  const handleToggleBrick = () => {
    if (soundEnabled) audioEngine.playHaptic(isBricked ? "unbrick" : "brick");
    if (!isBricked) {
      setSecondsRemaining(activeMode.durationMinutes * 60);
      setIsBricked(true);
      if (binauralAudio) audioEngine.toggleBinauralDrone(true);
    } else {
      setIsBricked(false);
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
    if (!isBricked) {
      alert(`Brick is idle. ${app.name} opens normally.`);
      return;
    }
    if (!app.blocked) {
      alert(`${app.name} is allowed in ${activeMode.title}.`);
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

  // Emergency Hold to Unbrick
  const startHoldUnbrick = () => {
    setUnbrickProgress(0);
    const start = Date.now();
    const duration = 3000;

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

  // Toggle Theme
  const toggleTheme = () => {
    const next = theme === "alabaster" ? "dark" : "alabaster";
    setTheme(next);
    audioEngine.playHaptic("click");
    try {
      localStorage.setItem("brick_theme", next);
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
      localStorage.setItem("brick_user", JSON.stringify(user));
    } catch {
      // ignore
    }
    audioEngine.playHaptic("unbrick");
    setShowEmailForm(false);
  };

  // Instant demo login ("I don't have a Brick" / Neeraj Demo)
  const handleInstantDemoLogin = () => {
    const user: UserSession = {
      email: "neeraj@student.ac.in",
      name: "NEERAJ",
    };
    setCurrentUser(user);
    try {
      localStorage.setItem("brick_user", JSON.stringify(user));
    } catch {
      // ignore
    }
    audioEngine.playHaptic("unbrick");
  };

  // Sign out / Lock Device
  const handleSignOut = () => {
    audioEngine.playHaptic("click");
    setIsBricked(false);
    audioEngine.toggleBinauralDrone(false);
    setCurrentUser(null);
    try {
      localStorage.removeItem("brick_user");
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
      <div className="min-h-screen bg-[#111111] text-[#666666] flex items-center justify-center font-mono text-xs tracking-widest">
        INITIALIZING BRICK...
      </div>
    );
  }

  // =========================================================================
  // SCREEN 2: THE BRICK ONBOARDING & LOGIN SCREEN (Pixel-Perfect 1:1)
  // =========================================================================
  if (!currentUser) {
    return (
      <div
        suppressHydrationWarning
        className="min-h-screen bg-[#111111] text-white font-absans flex flex-col justify-between max-w-sm mx-auto select-none relative overflow-hidden shadow-2xl"
      >
        {/* Pristine Photographic Hardware Desk Scene (Zero text overlay) */}
        <div className="absolute inset-x-0 top-0 h-[58%] overflow-hidden pointer-events-none">
          <img
            src="/images/pure-desk.jpg"
            alt="Brick Hardware & iPhone Desk Scene"
            className="w-full h-full object-cover object-center"
          />
          {/* Top Subtle Vignette */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#111111]/80 via-[#111111]/30 to-transparent" />
          {/* Bottom Seamless Gradient Fade into solid #111111 */}
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#111111] via-[#111111]/90 to-transparent" />
        </div>

        {/* Top Centered BRICK Wordmark with Corner Brackets */}
        <header className="relative z-10 px-6 pt-6 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <path d="M6 3H3v3" />
              <path d="M18 3h3v3" />
              <path d="M6 21H3v-3" />
              <path d="M18 21h3v-3" />
            </svg>
            <span className="font-apfel text-sm tracking-[0.25em] font-black text-white uppercase">
              BRICK
            </span>
          </div>
        </header>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom Content Area: Single, razor-sharp typography and buttons */}
        <div className="relative z-10 px-6 pb-6 space-y-6">
          {/* Headline from Screenshot */}
          <div className="space-y-1 text-left">
            <h1 className="text-[32px] leading-[1.12] font-apfel font-normal tracking-tight text-white">
              Your time is yours.<br />
              Get back to creating.
            </h1>
          </div>

          {/* Email Login Form (If expanded) */}
          {showEmailForm ? (
            <form
              onSubmit={handleLoginSubmit}
              className="space-y-3 p-4 rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] animate-in fade-in duration-150"
            >
              <div className="text-xs font-apfel font-bold uppercase tracking-wider text-white">
                Enter your credentials
              </div>
              <input
                type="email"
                placeholder="email@domain.com"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-[#121212] border border-[#2E2E2E] text-sm text-white focus:outline-none focus:border-white transition-colors"
                autoFocus
                required
              />
              <input
                type="password"
                placeholder="Passcode / PIN"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-[#121212] border border-[#2E2E2E] text-sm text-white focus:outline-none focus:border-white transition-colors tracking-widest"
                required
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="w-1/3 py-3 rounded-full border border-[#333333] text-xs font-absans text-[#888888] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 rounded-full bg-white text-[#111111] font-apfel font-bold text-xs uppercase cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </form>
          ) : (
            /* Action Buttons (Exact Pills from Photo) */
            <div className="space-y-3">
              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full py-4 rounded-full bg-white text-[#111111] font-absans font-semibold text-sm hover:bg-[#EAEAEA] active:scale-[0.98] transition-all cursor-pointer shadow-lg text-center"
              >
                Continue with email
              </button>

              <button
                onClick={handleInstantDemoLogin}
                className="w-full py-4 rounded-full bg-[#1C1C1C] text-white font-absans font-semibold text-sm border border-[#2A2A2A] hover:bg-[#252525] active:scale-[0.98] transition-all cursor-pointer text-center"
              >
                I don&apos;t have a Brick
              </button>
            </div>
          )}

          {/* Legal Notice */}
          <p className="text-[11px] text-center text-[#6A6A6A] leading-relaxed pt-1">
            By continuing, you agree to our{" "}
            <span className="underline cursor-pointer hover:text-white">Terms</span> and{" "}
            <span className="underline cursor-pointer hover:text-white">Privacy Policy</span>
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 4 & 5: AUTHENTICATED PHYSICAL BRICK COCKPIT
  // =========================================================================
  const isAlabaster = theme === "alabaster";

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen font-absans antialiased transition-colors duration-300 ${
        isAlabaster ? "bg-[#EBE8E3] text-[#1E1E1E]" : "bg-[#111111] text-[#E8E8E8]"
      }`}
    >
      <div className="max-w-sm mx-auto min-h-screen flex flex-col justify-between px-6 pt-5 pb-6">
        {/* Top Floating Telemetry Pill ("12h 51m today") */}
        <header className="flex items-center justify-between pt-1">
          {/* Subtle Sound & Drone Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                audioEngine.playHaptic("click");
              }}
              className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
                isAlabaster
                  ? "border-[#D6D2CB] text-[#7A766F] hover:text-[#111111]"
                  : "border-[#282828] text-[#777777] hover:text-white"
              }`}
              title={soundEnabled ? "Mute clicks" : "Enable clicks"}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => {
                const next = !binauralAudio;
                setBinauralAudio(next);
                audioEngine.toggleBinauralDrone(next);
              }}
              className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
                binauralAudio
                  ? "bg-emerald-600/20 border-emerald-600/50 text-emerald-600"
                  : isAlabaster
                  ? "border-[#D6D2CB] text-[#7A766F] hover:text-[#111111]"
                  : "border-[#282828] text-[#777777] hover:text-white"
              }`}
              title="40Hz Focus Drone"
            >
              <Headphones className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Iconic Center Time Pill ("12h 51m today" or "0h 0m today") */}
          <div
            className={`px-3.5 py-1.5 rounded-full text-xs font-absans font-medium shadow-sm border ${
              isAlabaster
                ? "bg-white/80 border-[#DFDBD4] text-[#1C1C1C]"
                : "bg-[#1C1C1C]/90 border-[#2A2A2A] text-white"
            }`}
          >
            {formatReclaimed(reclaimedSeconds)}
          </div>

          {/* Theme Switcher (Alabaster / Dark) */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
              isAlabaster
                ? "border-[#D6D2CB] text-[#7A766F] hover:text-[#111111]"
                : "border-[#282828] text-[#777777] hover:text-white"
            }`}
            title="Toggle Alabaster / Dark Theme"
          >
            {isAlabaster ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>
        </header>

        {/* ================================================================= */}
        {/* TAB 1: BRICK HOME (The Physical Puck Centerpiece)                 */}
        {/* ================================================================= */}
        {activeTab === "brick" && (
          <main className="my-auto py-6 flex flex-col items-center text-center space-y-7 animate-in fade-in duration-200">
            {/* The Authentic 3D Brick Physical Puck */}
            <div className="relative group cursor-pointer select-none" onClick={handleToggleBrick}>
              {/* Outer Shadow Drop */}
              <div
                className={`w-48 h-48 rounded-[36px] transition-all duration-300 flex flex-col items-center justify-center relative ${
                  isAlabaster
                    ? isBricked
                      ? "bg-[#D8D4CC] shadow-[0_12px_24px_rgba(0,0,0,0.12),inset_0_2px_4px_rgba(0,0,0,0.1)] scale-98"
                      : "bg-[#FBF9F5] shadow-[0_28px_50px_-10px_rgba(0,0,0,0.16),0_10px_20px_-6px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:scale-[1.02] active:scale-95"
                    : isBricked
                    ? "bg-[#181818] border border-emerald-500/40 shadow-[0_0_30px_rgba(52,211,153,0.18)] scale-98"
                    : "bg-[#1A1A1A] border border-[#2B2B2B] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-[1.02] active:scale-95"
                }`}
              >
                {/* 4 Iconic Engraved Corner Brackets */}
                <svg
                  viewBox="0 0 100 100"
                  className={`absolute inset-4 w-[calc(100%-32px)] h-[calc(100%-32px)] pointer-events-none transition-colors ${
                    isBricked
                      ? "text-emerald-500/60"
                      : isAlabaster
                      ? "text-[#C8C4BC]"
                      : "text-[#3A3A3A]"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                >
                  {/* Top-Left Bracket */}
                  <path d="M22 10H14a4 4 0 0 0-4 4v8" />
                  {/* Top-Right Bracket */}
                  <path d="M78 10h8a4 4 0 0 1 4 4v8" />
                  {/* Bottom-Left Bracket */}
                  <path d="M22 90H14a4 4 0 0 1-4-4v-8" />
                  {/* Bottom-Right Bracket */}
                  <path d="M78 90h8a4 4 0 0 0 4-4v-8" />
                </svg>

                {/* Central Engraved BRICK Text / Active Countdown */}
                {isBricked ? (
                  <div className="space-y-1 z-10">
                    <div className="font-apfel text-3xl font-black tracking-tight text-emerald-500">
                      {formatTimer(secondsRemaining)}
                    </div>
                    <div className="text-[10px] font-mono tracking-widest text-emerald-600 font-bold uppercase">
                      BRICKED
                    </div>
                  </div>
                ) : (
                  <div className="z-10 flex flex-col items-center">
                    <span
                      className={`font-apfel text-2xl font-black tracking-[0.25em] pl-1 transition-colors ${
                        isAlabaster ? "text-[#3D3A36]" : "text-[#E0E0E0]"
                      }`}
                    >
                      BRICK
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Mode Information & Selector (Exactly like Screen 4 & 5) */}
            <div className="space-y-1">
              <h2
                className={`text-2xl font-apfel font-medium tracking-tight ${
                  isAlabaster ? "text-[#1C1C1C]" : "text-white"
                }`}
              >
                {activeMode.title}
              </h2>

              <p className={`text-xs ${isAlabaster ? "text-[#75726B]" : "text-[#888888]"}`}>
                {activeMode.subtitle}
              </p>

              <div className="pt-1.5">
                <button
                  onClick={() => setShowModeDrawer(true)}
                  className={`text-xs font-absans font-medium flex items-center justify-center gap-1 mx-auto transition-colors cursor-pointer ${
                    isAlabaster
                      ? "text-[#4F4C46] hover:text-[#111111]"
                      : "text-[#AAAAAA] hover:text-white"
                  }`}
                >
                  <span>Manage modes</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Primary Action Pill ("Tap or hold to Brick") */}
            <div className="w-full pt-4">
              <button
                onClick={handleToggleBrick}
                className={`w-full py-4 rounded-full font-absans font-semibold text-sm transition-all duration-200 cursor-pointer shadow-sm active:scale-98 ${
                  isBricked
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : isAlabaster
                    ? "bg-[#DFDBD3] text-[#3A3731] hover:bg-[#D5D0C7]"
                    : "bg-[#252525] text-white hover:bg-[#2F2F2F]"
                }`}
              >
                {isBricked ? "Tap to Unbrick" : "Tap or hold to Brick"}
              </button>
            </div>
          </main>
        )}

        {/* ================================================================= */}
        {/* TAB 2: SCHEDULE (Daily Academic Timetable & Routines)             */}
        {/* ================================================================= */}
        {activeTab === "schedule" && (
          <main className="my-auto py-4 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-xl font-apfel font-bold ${isAlabaster ? "text-[#1A1A1A]" : "text-white"}`}>
                  Focus Schedule
                </h2>
                <p className={`text-xs ${isAlabaster ? "text-[#75726B]" : "text-[#888888]"}`}>
                  Today&apos;s 3 spaced academic revision intervals.
                </p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/40 border border-[#D5D0C7]">
                {studySlots.filter((s) => s.completed).length}/{studySlots.length} DONE
              </span>
            </div>

            <div className="space-y-2.5">
              {studySlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isAlabaster
                      ? "bg-white/80 border-[#DFDBD4] shadow-sm"
                      : "bg-[#181818] border-[#292929]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#E4E0D7] text-[#444444]">
                          {slot.timeSlot}
                        </span>
                        <span className="text-[10px] font-mono text-[#777777]">
                          {slot.durationMinutes}m
                        </span>
                      </div>
                      <h3
                        className={`text-sm font-apfel font-bold ${
                          slot.completed ? "line-through text-[#888888]" : isAlabaster ? "text-[#111111]" : "text-white"
                        }`}
                      >
                        {slot.subject}
                      </h3>
                      <p className={`text-xs ${isAlabaster ? "text-[#6A6761]" : "text-[#999999]"}`}>
                        {slot.topic}
                      </p>
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
                          : isAlabaster
                          ? "bg-[#EAE6DE] text-[#666666] hover:text-[#111111]"
                          : "bg-[#252525] text-[#888888] hover:text-white"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Distraction Shield Checklist */}
            <div
              className={`p-4 rounded-2xl border ${
                isAlabaster ? "bg-white/60 border-[#DFDBD4]" : "bg-[#161616] border-[#262626]"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-apfel font-bold uppercase tracking-wider mb-2">
                <span>Shielded Apps Checklist</span>
                <span className="font-mono text-[10px] text-[#777777]">
                  {apps.filter((a) => a.blocked).length} active
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {apps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleToggleApp(app.id)}
                    className={`p-2 rounded-xl text-[11px] font-absans flex items-center justify-between border cursor-pointer transition-colors ${
                      app.blocked
                        ? isAlabaster
                          ? "bg-[#DFDBD3] border-[#CFC9BF] text-[#222222] font-medium"
                          : "bg-[#252525] border-[#383838] text-white"
                        : isAlabaster
                        ? "bg-transparent border-dashed border-[#D5D0C7] text-[#999999]"
                        : "bg-transparent border-dashed border-[#2A2A2A] text-[#555555]"
                    }`}
                  >
                    <span>{app.name.split(" ")[0]}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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
          <main className="my-auto py-4 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-xl font-apfel font-bold ${isAlabaster ? "text-[#1A1A1A]" : "text-white"}`}>
                  Activity & Focus
                </h2>
                <p className={`text-xs ${isAlabaster ? "text-[#75726B]" : "text-[#888888]"}`}>
                  Reclaimed time and intercepted screen impulses.
                </p>
              </div>
              <div className="flex items-center gap-1 font-apfel font-bold text-amber-500 text-sm">
                <Flame className="w-4 h-4 fill-amber-500" />
                <span>6 DAY STREAK</span>
              </div>
            </div>

            {/* Main Stats Card */}
            <div
              className={`p-5 rounded-2xl border ${
                isAlabaster ? "bg-white/80 border-[#DFDBD4] shadow-sm" : "bg-[#181818] border-[#292929]"
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#777777]">
                NET RECLAIMED TIME TODAY
              </div>
              <div className="text-3xl font-apfel font-bold mt-1">
                {Math.floor(reclaimedSeconds / 3600)}h {Math.floor((reclaimedSeconds % 3600) / 60)}m
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-1">
                Saved from infinite reels & social feeds
              </div>
            </div>

            {/* Impulse Intercept Audit Trail */}
            <div
              className={`rounded-2xl border divide-y overflow-hidden ${
                isAlabaster
                  ? "bg-white/80 border-[#DFDBD4] divide-[#EFECE5]"
                  : "bg-[#181818] border-[#292929] divide-[#242424]"
              }`}
            >
              <div className="p-3.5 text-xs font-apfel font-bold uppercase tracking-wider text-[#777777]">
                Prevented Distraction Attempts
              </div>
              {interceptLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <div>
                      <div className="text-xs font-apfel font-bold">{log.app} Blocked</div>
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
        {/* TAB 4: SETTINGS (Modes, Hardware Simulation & Log Out)            */}
        {/* ================================================================= */}
        {activeTab === "settings" && (
          <main className="my-auto py-4 space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className={`text-xl font-apfel font-bold ${isAlabaster ? "text-[#1A1A1A]" : "text-white"}`}>
                Settings & Device
              </h2>
              <p className={`text-xs ${isAlabaster ? "text-[#75726B]" : "text-[#888888]"}`}>
                Brick hardware profile and account management.
              </p>
            </div>

            <div
              className={`rounded-2xl border divide-y overflow-hidden ${
                isAlabaster
                  ? "bg-white/80 border-[#DFDBD4] divide-[#EFECE5]"
                  : "bg-[#181818] border-[#292929] divide-[#242424]"
              }`}
            >
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-apfel font-bold">Active User</div>
                  <div className="text-xs text-[#777777]">{currentUser.email}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1 rounded-full border border-red-500/30 text-xs font-mono text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  Log out
                </button>
              </div>

              <div
                onClick={toggleTheme}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-black/5 transition-colors"
              >
                <div>
                  <div className="text-sm font-apfel font-bold">Theme Appearance</div>
                  <div className="text-xs text-[#777777]">
                    Current: {isAlabaster ? "Alabaster White" : "Stealth Dark"}
                  </div>
                </div>
                {isAlabaster ? <Moon className="w-4 h-4 text-[#888888]" /> : <Sun className="w-4 h-4 text-[#888888]" />}
              </div>

              <div
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  audioEngine.playHaptic("click");
                }}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-black/5 transition-colors"
              >
                <div>
                  <div className="text-sm font-apfel font-bold">Mechanical Haptic Clicks</div>
                  <div className="text-xs text-[#777777]">Web Audio synthesized haptics</div>
                </div>
                <span className="text-xs font-mono">{soundEnabled ? "ENABLED" : "MUTED"}</span>
              </div>
            </div>

            {/* Quick Test of Block Screen */}
            <div
              className={`p-4 rounded-2xl border space-y-2 ${
                isAlabaster ? "bg-white/60 border-[#DFDBD4]" : "bg-[#161616] border-[#262626]"
              }`}
            >
              <div className="text-xs font-apfel font-bold uppercase tracking-wider text-[#777777]">
                Test Impenetrable Block Screen
              </div>
              <p className="text-xs text-[#888888]">
                Tap below to trigger the exact Brick iOS blocked overlay simulation.
              </p>
              <button
                onClick={() => simulateOpenApp(apps[0])}
                className={`w-full py-2.5 rounded-xl text-xs font-mono font-semibold transition-colors cursor-pointer border ${
                  isAlabaster
                    ? "bg-[#E4E0D7] hover:bg-[#D9D4CA] border-[#CFC9BF] text-[#222222]"
                    : "bg-[#252525] hover:bg-[#303030] border-[#383838] text-white"
                }`}
              >
                Simulate Opening Instagram ({isBricked ? "Bricked" : "Idle"})
              </button>
            </div>
          </main>
        )}

        {/* ================================================================= */}
        {/* BOTTOM NAVIGATION BAR (Exact 4 Tabs from Screen 4 & 5!)           */}
        {/* ================================================================= */}
        <footer
          className={`border-t pt-3 pb-2 flex items-center justify-around select-none ${
            isAlabaster ? "border-[#DFDBD4] bg-[#EBE8E3]" : "border-[#202020] bg-[#111111]"
          }`}
        >
          {[
            { id: "brick", label: "Brick" },
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
                className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                  isActive
                    ? isAlabaster
                      ? "text-[#111111] font-semibold"
                      : "text-white font-semibold"
                    : isAlabaster
                    ? "text-[#88847D] hover:text-[#333333]"
                    : "text-[#666666] hover:text-[#AAAAAA]"
                }`}
              >
                <span className="text-xs font-absans">{tab.label}</span>
                {/* Active Underline Dot (as seen in Mobbin screenshots) */}
                <span
                  className={`w-1 h-1 rounded-full transition-all ${
                    isActive ? (isAlabaster ? "bg-[#111111]" : "bg-white") : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </footer>
      </div>

      {/* ================================================================= */}
      {/* MANAGE MODES DRAWER / MODAL (Triggered from "Manage modes >")      */}
      {/* ================================================================= */}
      {showModeDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in">
          <div
            className={`w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 space-y-5 animate-in slide-in-from-bottom duration-200 border ${
              isAlabaster
                ? "bg-[#EBE8E3] border-[#D6D2CA] text-[#1E1E1E]"
                : "bg-[#161616] border-[#2A2A2A] text-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-apfel text-lg font-bold">Select Focus Mode</h3>
              <button
                onClick={() => setShowModeDrawer(false)}
                className="p-1 rounded-full text-[#888888] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
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
                      ? isAlabaster
                        ? "bg-white border-[#C5BFB4] shadow-md"
                        : "bg-[#222222] border-[#444444] shadow-md"
                      : isAlabaster
                      ? "bg-white/60 border-[#DFDBD4] hover:bg-white"
                      : "bg-[#191919] border-[#252525] hover:bg-[#202020]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-apfel font-bold text-sm">{mode.title}</div>
                      <div className="text-xs text-[#777777]">{mode.subtitle}</div>
                    </div>
                    <span className="font-mono text-xs font-semibold">{mode.durationMinutes}m</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* SIMULATED FULL-SCREEN BRICK BLOCK SCREEN                          */}
      {/* (Triggered when user tries to open Instagram/YouTube while Bricked) */}
      {/* ================================================================= */}
      {simulatedBlockApp && (
        <div className="fixed inset-0 z-50 bg-[#000000] text-white flex flex-col justify-between p-8 animate-in fade-in duration-200 select-none">
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

            {/* Emergency Hold to Unbrick */}
            <div className="pt-2 space-y-2">
              <button
                onMouseDown={startHoldUnbrick}
                onMouseUp={cancelHoldUnbrick}
                onTouchStart={startHoldUnbrick}
                onTouchEnd={cancelHoldUnbrick}
                className="text-xs font-mono text-[#666666] hover:text-[#999999] transition-colors cursor-pointer select-none"
              >
                {unbrickProgress > 0 ? `HOLDING... ${unbrickProgress}%` : "Press & hold 3s to emergency unbrick"}
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
