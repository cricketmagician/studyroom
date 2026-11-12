"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { postAi } from '@/lib/ai-client';
import { indiaDay, StudyState } from '@/lib/cma';
import { haptic } from '@/lib/haptics';

export type Role = "student" | "teacher";
export type Profile = {
  name: string;
  email: string;
  role: Role;
  level?: 'Foundation' | 'Intermediate' | 'Final';
  phone?: string;
  city?: string;
  registrationNumber?: string;
  group?: string;
  coachingType?: string;
  attemptCount?: string;
  studyTimePreference?: string;
  instituteChapter?: string;
  targetExam?: string;
  primarySubject?: string;
  dailyGoalMinutes?: number;
  createdAt?: any;
};

type AuthState = { user: User | null; profile: Profile | null; loading: boolean };

const AuthContext = createContext<AuthState & { focus: StudyState['active'] }>({ user: null, profile: null, loading: true, focus: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, profile: null, loading: true });
  const [session, setSession] = useState<{ uid: string; active: StudyState['active'] } | null>(null);
  useEffect(() => {
    if (!state.user || !state.profile?.role) return;
    let stopped = false;
    let pending = false;
    const syncTimer = async () => {
      if (pending || stopped) return;
      pending = true;
      try {
        const data = await postAi<{ state: StudyState }>('/api/study', { action: 'detail' });
        if (!stopped) setSession({ uid: state.user!.uid, active: data.state.active && Date.now() - data.state.active.last <= 90000 ? data.state.active : null });
        if (!stopped && data.state.active) await postAi('/api/study', { action: 'tick', sessionId: data.state.active.id });
      } catch (error) { console.error('Study timer could not sync; retrying.', error); }
      finally { pending = false; }
    };
    const interval = setInterval(syncTimer, 30000);
    const initial = setTimeout(syncTimer, 0);
    window.addEventListener('studyroom:session', syncTimer);
    return () => { stopped = true; clearTimeout(initial); clearInterval(interval); window.removeEventListener('studyroom:session', syncTimer); };
  }, [state.user, state.profile?.role]);
  useEffect(() => {
    if (!state.user || state.profile?.role !== 'student') return;
    let recorded = '';
    const checkin = async () => {
      if (document.visibilityState !== 'visible' || recorded === indiaDay()) return;
      // Once a day, a small buzz says "you are marked present" (browsers skip it until the page has been tapped).
      try { await postAi('/api/study', { action: 'checkin' }); recorded = indiaDay(); if (localStorage.getItem('cma-present-buzz') !== recorded) { localStorage.setItem('cma-present-buzz', recorded); haptic('success'); } }
      catch (error) { console.error('Automatic check-in could not sync; retrying.', error); }
    };
    void checkin();
    const interval = setInterval(checkin, 60000);
    document.addEventListener('visibilitychange', checkin);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', checkin); };
  }, [state.user, state.profile?.role]);

  useEffect(() => {
    let stopProfile = () => {};
    const stopAuth = onAuthStateChanged(auth, (user) => {
      stopProfile();
      if (!user) {
        setState({ user: null, profile: null, loading: false });
        return;
      }
      setState((s) => ({ ...s, loading: true }));
      // Live listener so a role set in the Firebase console applies without re-login.
      stopProfile = onSnapshot(
        doc(db, "profiles", user.uid),
        (snap) => setState({ user, profile: snap.exists() ? (snap.data() as Profile) : null, loading: false }),
        () => setState({ user, profile: null, loading: false })
      );
    });
    return () => {
      stopProfile();
      stopAuth();
    };
  }, []);

  return <AuthContext.Provider value={{...state, focus: session?.uid === state.user?.uid ? session?.active : null}}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

/** For login/register pages: once signed in, go home. Waits for auth state, so there's no race after sign-in. */
export function useRedirectIfSignedIn() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && user && profile) router.replace("/");
  }, [loading, user, profile, router]);
}

export function homeFor(role: Role) {
  return role === "teacher" ? "/admin" : "/";
}

export function Spinner() {
  return (
    <div role="status" aria-label="Loading" className="flex justify-center py-24">
      <div className="h-8 w-8 rounded-full border-[3px] border-[color:var(--brand-soft)] border-t-[color:var(--brand)] animate-spin" />
    </div>
  );
}

/** Shows children only to a signed-in user (with the given role, if set). */
export function RequireRole({ role, children }: { role?: Role; children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const wrongRole = Boolean(profile && role && profile.role !== role);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (wrongRole && profile) router.replace(homeFor(profile.role));
  }, [loading, user, wrongRole, profile, router]);

  if (loading || !user || wrongRole) return <Spinner />;
  if (!profile) {
    return (
      <div className="text-center py-24 px-5 space-y-5">
        <p className="text-[var(--text-secondary)]">We could not open your account. Log out and log in again. If it still does not work, ask the admin.</p>
        {/* Without this the screen is a dead end: a stale or deleted login has no other way out. */}
        <button type="button" onClick={() => signOut(auth)} className="h-11 px-6 rounded-full bg-[var(--brand)] text-[var(--on-brand)] font-semibold">Log out</button>
      </div>
    );
  }
  return <React.Suspense fallback={<Spinner />}>{children}</React.Suspense>;
}
