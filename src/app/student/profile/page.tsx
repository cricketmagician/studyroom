"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store/app-store";
import { useTheme } from "@/components/providers/theme-provider";
import {
  User,
  GraduationCap,
  Building2,
  Mail,
  Phone,
  Sun,
  Moon,
  Bell,
  ShieldCheck,
  CheckCircle2,
  BookOpen
} from "lucide-react";

export default function StudentProfilePage() {
  const { currentUser, currentCollege, courses } = useApp();
  const { theme, setTheme } = useTheme();

  const [fullName, setFullName] = useState(currentUser.full_name);
  const [phone, setPhone] = useState(currentUser.phone || "+1 (617) 555-0194");
  const [bio, setBio] = useState(currentUser.bio || "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [emailDigest, setEmailDigest] = useState(true);
  const [assignmentAlerts, setAssignmentAlerts] = useState(true);
  const [lectureReminders, setLectureReminders] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-xl sm:max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-28 space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
          Academic Profile & Workspace Preferences
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Institutional identity and personal learning environment settings
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile preferences successfully saved!</span>
        </div>
      )}

      {/* Identity Card */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <img
          src={currentUser.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=260"}
          alt={currentUser.full_name}
          className="w-20 h-20 rounded-2xl object-cover border-2 border-[var(--border-color)]"
        />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-heading font-bold text-[var(--text-primary)]">
              {currentUser.full_name}
            </h2>
            <span className="px-2 py-0.5 rounded-md bg-[var(--accent-light)] text-[var(--accent-text)] text-[10px] font-bold uppercase font-mono">
              Student Cohort
            </span>
          </div>
          <div className="text-xs text-[var(--text-secondary)] flex flex-wrap items-center gap-2">
            <span>Student ID: <strong className="font-mono text-[var(--text-primary)]">{currentUser.student_id}</strong></span>
            <span>·</span>
            <span>{currentCollege.name}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] pt-1 max-w-xl">
            {bio}
          </p>
        </div>
      </div>

      {/* Personal Info Form */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 sm:p-8 shadow-sm space-y-5">
        <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">
          Personal Details
        </h3>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Institutional Email
              </label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full text-xs p-2.5 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-color)] text-[var(--text-secondary)] cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Contact Phone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Academic Bio / Research Interests
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-xs font-semibold shadow-xs transition-all"
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* Theme & Display Mode */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">
          Reading & Visual Theme
        </h3>
        <p className="text-xs text-[var(--text-secondary)]">
          Select between Studyroom Warm Editorial light canvas (#F6F4EF) or deep dark focus (#171715)
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-md pt-2">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
              theme === "light"
                ? "bg-[var(--accent-light)] border-[var(--accent)] shadow-sm"
                : "bg-[var(--bg-primary)] border-[var(--border-color)]"
            }`}
          >
            <Sun className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <div className="font-semibold text-xs text-[var(--text-primary)]">Warm Neutral</div>
              <div className="text-[11px] text-[var(--text-secondary)]">#F6F4EF Editorial Light</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
              theme === "dark"
                ? "bg-[var(--accent-light)] border-[var(--accent)] shadow-sm"
                : "bg-[var(--bg-primary)] border-[var(--border-color)]"
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-400 mt-0.5" />
            <div>
              <div className="font-semibold text-xs text-[var(--text-primary)]">Dark Charcoal</div>
              <div className="text-[11px] text-[var(--text-secondary)]">#171715 Night Focus</div>
            </div>
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">
          Notification Settings
        </h3>
        
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-[var(--text-primary)]">Assignment & Grading Alerts</div>
              <div className="text-[11px] text-[var(--text-secondary)]">Receive immediate alerts when faculty post grades or feedback</div>
            </div>
            <input
              type="checkbox"
              checked={assignmentAlerts}
              onChange={(e) => setAssignmentAlerts(e.target.checked)}
              className="w-4 h-4 accent-[var(--accent)] rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-[var(--text-primary)]">Lecture & Studio Reminders</div>
              <div className="text-[11px] text-[var(--text-secondary)]">Notify 30 minutes prior to live lecture sessions</div>
            </div>
            <input
              type="checkbox"
              checked={lectureReminders}
              onChange={(e) => setLectureReminders(e.target.checked)}
              className="w-4 h-4 accent-[var(--accent)] rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-[var(--text-primary)]">Daily Academic Synthesis Digest</div>
              <div className="text-[11px] text-[var(--text-secondary)]">Summary of upcoming deadlines and new faculty uploads</div>
            </div>
            <input
              type="checkbox"
              checked={emailDigest}
              onChange={(e) => setEmailDigest(e.target.checked)}
              className="w-4 h-4 accent-[var(--accent)] rounded cursor-pointer"
            />
          </label>
        </div>
      </div>

    </div>
  );
}
