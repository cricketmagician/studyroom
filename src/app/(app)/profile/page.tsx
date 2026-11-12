"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail, signOut, updateProfile } from "firebase/auth";
import Link from "next/link";
import { Bell, BookmarkSimple as Bookmark, CalendarCheck, CheckCircle as CheckCircle2, CaretRight as ChevronRight, Clock, Fire as Flame, GraduationCap, Key as KeyRound, SignOut as LogOut, EnvelopeSimple as Mail, Moon, NotePencil as NotebookPen, PencilSimple as PenLine, Target, UsersThree as Users, X } from "@phosphor-icons/react";
import { haptic } from "@/lib/haptics";
import { auth } from "@/lib/firebase/config";
import { friendlyError } from "@/lib/firebase/errors";
import { RequireRole, useAuth } from "@/lib/auth";
import { useMyLibrary } from "@/lib/hooks";
import { useTheme } from "@/components/providers/theme-provider";
import { postAi } from "@/lib/ai-client";
import { DEFAULT_GOAL_MINUTES, examTerms, LEVELS, Level, SUBJECTS, StudyState, duration } from "@/lib/cma";
import {
  getNotificationPermission,
  requestNotificationPermission,
  showPushNotification,
} from "@/lib/notifications";

export default function ProfilePage() {
  return (
    <RequireRole>
      <ProfileView />
    </RequireRole>
  );
}

function ProfileView() {
  const { user, profile } = useAuth();
  const entries = Object.values(useMyLibrary());
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  // Form states
  const [name, setName] = useState(profile?.name || "");
  const [level, setLevel] = useState<Level>(profile?.level || "Intermediate");
  const [targetExam, setTargetExam] = useState(() => examTerms()[0]);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(DEFAULT_GOAL_MINUTES);
  const [primarySubject, setPrimarySubject] = useState("");
  const [hideStudyStatus, setHideStudyStatus] = useState(false);
  const [phone, setPhone] = useState(profile?.phone || "");
  const [city, setCity] = useState(profile?.city || "");
  const [registrationNumber, setRegistrationNumber] = useState(profile?.registrationNumber || "");
  const [group, setGroup] = useState(profile?.group || "Group 1");
  const [coachingType, setCoachingType] = useState(profile?.coachingType || "Self Study");
  const [attemptCount, setAttemptCount] = useState(profile?.attemptCount || "First Attempt");
  const [studyTimePreference, setStudyTimePreference] = useState(profile?.studyTimePreference || "Early Morning");
  const [instituteChapter, setInstituteChapter] = useState(profile?.instituteChapter || "");

  // Async & UI states
  const [studyState, setStudyState] = useState<StudyState | null>(null);
  const [loadingStudy, setLoadingStudy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [pushStatus, setPushStatus] = useState<string>("default");
  const [testingPush, setTestingPush] = useState(false);
  const editSheet = useRef<HTMLDialogElement>(null);

  // Sync initial profile values
  useEffect(() => {
    if (profile?.name && !name) {
      setName(profile.name);
    }
    if (profile?.level) {
      setLevel(profile.level);
    }
  }, [profile]);

  // Load backend study state
  useEffect(() => {
    let active = true;
    const loadState = async () => {
      try {
        const res = await postAi<{ state: StudyState }>("/api/study", { action: "detail" });
        if (!active) return;
        const s = (res.state || {}) as any;
        setStudyState(s);
        if (s.level) setLevel(s.level);
        if (s.dailyGoalMinutes) setDailyGoalMinutes(s.dailyGoalMinutes);
        if (s.targetExam) setTargetExam(s.targetExam);
        if (s.primarySubject) setPrimarySubject(s.primarySubject);
        if (typeof s.hideStudyStatus === "boolean") setHideStudyStatus(s.hideStudyStatus);
        if (s.phone) setPhone(s.phone);
        if (s.city) setCity(s.city);
        if (s.registrationNumber) setRegistrationNumber(s.registrationNumber);
        if (s.group) setGroup(s.group);
        if (s.coachingType) setCoachingType(s.coachingType);
        if (s.attemptCount) setAttemptCount(s.attemptCount);
        if (s.studyTimePreference) setStudyTimePreference(s.studyTimePreference);
        if (s.instituteChapter) setInstituteChapter(s.instituteChapter);
      } catch (err) {
        console.error("Failed to load study details:", err);
      } finally {
        if (active) setLoadingStudy(false);
      }
    };

    loadState();
    setPushStatus(getNotificationPermission());

    return () => {
      active = false;
    };
  }, []);

  if (!profile || !user) return null;

  const filteredSubjects = SUBJECTS.filter((s) => s.level === level);

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setSaving(true);
    setError("");
    setSaveSuccess(false);

    try {
      // 1. Update Firebase Auth displayName
      if (auth.currentUser && name.trim()) {
        await updateProfile(auth.currentUser, { displayName: name.trim() }).catch(() => {});
      }

      // 2. Persist to Firestore via setup_profile action
      await postAi("/api/study", {
        action: "setup_profile",
        name: name.trim(),
        level,
        dailyGoalMinutes,
        targetExam,
        primarySubject: primarySubject || (filteredSubjects[0]?.name ?? "Cost Accounting"),
        hideStudyStatus,
        phone: phone.trim(),
        city: city.trim(),
        registrationNumber: registrationNumber.trim(),
        group,
        coachingType,
        attemptCount,
        studyTimePreference,
        instituteChapter,
      });

      setSaveSuccess(true);
      haptic("success");
      editSheet.current?.close();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setError((err as Error).message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Toggle Incognito Study Status
  const handleTogglePrivacy = async () => {
    const nextStatus = !hideStudyStatus;
    setHideStudyStatus(nextStatus);
    try {
      await postAi("/api/study", { action: "privacy", hideStudyStatus: nextStatus });
    } catch (err) {
      setHideStudyStatus(!nextStatus);
      setError("Could not update privacy setting.");
    }
  };

  // Push Notifications
  const handleEnablePush = async () => {
    const perm = await requestNotificationPermission();
    setPushStatus(perm);
    if (perm === "granted") {
      await showPushNotification("Notifications Enabled! 🔔", {
        body: "You will receive study check-in reminders and buddy challenge alerts.",
      });
    }
  };

  const handleTestPush = async () => {
    setTestingPush(true);
    await showPushNotification("Abhyas: time to study", {
      body: "Keep up the momentum! Your CMA preparation goal is within reach today.",
    });
    setTimeout(() => setTestingPush(false), 800);
  };

  // Password reset
  const handleResetPassword = async () => {
    setError("");
    setPasswordMsg("");
    try {
      await sendPasswordResetEmail(auth, profile.email);
      setPasswordMsg(`A password reset link was sent to ${profile.email}. Check your inbox.`);
    } catch (err) {
      setError(friendlyError(err));
    }
  };

  // Sign out
  const handleSignOut = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  const streak = studyState?.streak ?? 0;
  const totalSeconds = studyState?.totalSeconds ?? 0;
  const checkinCount = studyState?.checkinCount ?? 0;

  const initials = profile.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const row = (icon: React.ReactNode, tint: string, label: string, value?: React.ReactNode) => (
    <><span className="tint" data-tint={tint}>{icon}</span><span className="profile-row-label">{label}</span>{value !== undefined && <span className="profile-row-value">{value}</span>}</>
  );
  const goalOptions = [{ minutes: 90, label: "1.5 hours" }, { minutes: 150, label: "2.5 hours (best)" }, { minutes: 240, label: "4 hours" }];

  return (
    <div className="profile">
      <header className="profile-hero">
        <span className="profile-avatar" aria-hidden="true">{initials}</span>
        <h1>{profile.name}</h1>
        <p>CMA {level} · {targetExam}</p>
        <button type="button" className="cma-secondary" onClick={() => editSheet.current?.showModal()}><PenLine size={16} aria-hidden="true" />Edit profile</button>
      </header>

      {saveSuccess && <p role="status" className="profile-toast"><CheckCircle2 size={18} aria-hidden="true" />Saved</p>}
      {(error || passwordMsg) && <p role={error ? "alert" : "status"} className={error ? "profile-note profile-error" : "profile-note"}>{error || passwordMsg}</p>}

      <section className="profile-stats" aria-label="Your study so far">
        {[
          { icon: <Flame size={20} />, tint: "orange", value: `${streak}`, label: streak === 1 ? "day streak" : "days streak" },
          { icon: <Clock size={20} />, tint: "blue", value: loadingStudy ? "—" : duration(totalSeconds), label: "studied" },
          { icon: <CheckCircle2 size={20} />, tint: "green", value: `${entries.filter((e) => e.done).length}`, label: "finished" },
        ].map((t) => <div key={t.label}><span className="tint" data-tint={t.tint} aria-hidden="true">{t.icon}</span><strong>{t.value}</strong><span>{t.label}</span></div>)}
      </section>

      <h2 className="profile-group-title">Study</h2>
      <ul className="profile-list">
        <li><button type="button" onClick={() => editSheet.current?.showModal()}>{row(<Target size={18} />, "green", "Daily goal", duration(dailyGoalMinutes * 60))}<ChevronRight size={18} aria-hidden="true" /></button></li>
        <li><button type="button" onClick={() => editSheet.current?.showModal()}>{row(<GraduationCap size={18} />, "violet", "Course and exam", `${level}`)}<ChevronRight size={18} aria-hidden="true" /></button></li>
        <li><Link href="/?view=Progress">{row(<CalendarCheck size={18} />, "blue", "Days present", checkinCount)}<ChevronRight size={18} aria-hidden="true" /></Link></li>
        <li><Link href="/saved">{row(<Bookmark size={18} />, "amber", "Saved", entries.filter((e) => e.saved).length)}<ChevronRight size={18} aria-hidden="true" /></Link></li>
        <li><Link href="/notes">{row(<NotebookPen size={18} />, "pink", "Notes on videos and PDFs", entries.filter((e) => e.note?.trim()).length)}<ChevronRight size={18} aria-hidden="true" /></Link></li>
      </ul>

      <h2 className="profile-group-title">Privacy and alerts</h2>
      <ul className="profile-list">
        <li><label>{row(<Users size={18} />, "green", "Friends can see when I study")}<input type="checkbox" role="switch" className="profile-switch" checked={!hideStudyStatus} onChange={() => { haptic(); void handleTogglePrivacy(); }} /></label></li>
        <li><div>{row(<Bell size={18} />, "orange", "Study alerts")}{pushStatus === "granted"
          ? <button type="button" className="profile-pill" disabled={testingPush} onClick={handleTestPush}>{testingPush ? "Sent" : "Send test"}</button>
          : <button type="button" className="profile-pill" disabled={pushStatus === "denied" || pushStatus === "unsupported"} onClick={handleEnablePush}>{pushStatus === "denied" ? "Blocked in browser" : "Turn on"}</button>}</div></li>
        <li><label>{row(<Moon size={18} />, "violet", "Dark mode")}<input type="checkbox" role="switch" className="profile-switch" checked={theme === "dark"} onChange={() => { haptic(); toggleTheme(); }} /></label></li>
      </ul>

      <h2 className="profile-group-title">Account</h2>
      <ul className="profile-list">
        <li><div>{row(<Mail size={18} />, "blue", "Email", <span className="profile-email">{profile.email}</span>)}</div></li>
        <li><button type="button" onClick={handleResetPassword}>{row(<KeyRound size={18} />, "amber", "Change password")}<ChevronRight size={18} aria-hidden="true" /></button></li>
        <li><button type="button" className="profile-danger" onClick={handleSignOut}><span className="tint" data-tint="pink"><LogOut size={18} /></span><span className="profile-row-label">Log out</span></button></li>
      </ul>

      <dialog ref={editSheet} className="profile-sheet" aria-labelledby="edit-title">
        <form onSubmit={handleSaveProfile}>
          <header><h2 id="edit-title">Edit profile</h2><button type="button" aria-label="Close" onClick={() => editSheet.current?.close()}><X size={20} /></button></header>
          <label>Your name<input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required autoComplete="name" /></label>
          <div className="profile-two">
            <label>CMA level<select value={level} onChange={(e) => setLevel(e.target.value as Level)}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></label>
            <label>Exam you are writing<select value={targetExam} onChange={(e) => setTargetExam(e.target.value)}>{[...new Set([targetExam, ...examTerms()])].map((t) => <option key={t}>{t}</option>)}</select></label>
          </div>
          <fieldset><legend>Daily study goal</legend><div className="profile-chips">{goalOptions.map((g) => <label key={g.minutes}><input type="radio" name="goal" checked={dailyGoalMinutes === g.minutes} onChange={() => setDailyGoalMinutes(g.minutes)} />{g.label}</label>)}</div></fieldset>
          <label>Main subject<select value={primarySubject} onChange={(e) => setPrimarySubject(e.target.value)}><option value="">Choose a subject</option>{filteredSubjects.map((s) => <option key={s.id} value={s.name}>Paper {s.id} · {s.name}</option>)}</select></label>
          <div className="profile-two">
            <label>Group<select value={group} onChange={(e) => setGroup(e.target.value)}>{["Group 1", "Group 2", "Both Groups", "Group 3", "Group 4"].map((g) => <option key={g}>{g}</option>)}</select></label>
            <label>How you study<select value={coachingType} onChange={(e) => setCoachingType(e.target.value)}>{["Self Study", "Online Classes", "Offline Coaching", "Hybrid"].map((c) => <option key={c}>{c}</option>)}</select></label>
          </div>
          <label>Best time to study<select value={studyTimePreference} onChange={(e) => setStudyTimePreference(e.target.value)}>{[...new Set([studyTimePreference, "Early Morning (5 AM - 9 AM)", "Afternoon", "Evening (6 PM - 10 PM)", "Night Owl (10 PM - 2 AM)"])].map((t) => <option key={t}>{t}</option>)}</select></label>
          <div className="profile-two">
            <label>Phone<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" autoComplete="tel" /></label>
            <label>City<input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Like Kolkata" autoComplete="address-level2" /></label>
          </div>
          <div className="profile-two">
            <label>ICMAI registration number<input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="Optional" /></label>
            <label>Institute chapter<input value={instituteChapter} onChange={(e) => setInstituteChapter(e.target.value)} placeholder="Like EIRC - Kolkata" /></label>
          </div>
          {error && <p role="alert" className="profile-note profile-error">{error}</p>}
          <button type="submit" className="cma-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        </form>
      </dialog>
    </div>
  );
}
