"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";

export type Role = "student" | "teacher";
export type Profile = { name: string; email: string; role: Role };

type AuthState = { user: User | null; profile: Profile | null; loading: boolean };

const AuthContext = createContext<AuthState>({ user: null, profile: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, profile: null, loading: true });

  useEffect(() => {
    let stopProfile = () => {};
    const stopAuth = onAuthStateChanged(auth, (user) => {
      stopProfile();
      if (!user) {
        setState({ user: null, profile: null, loading: false });
        return;
      }
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

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function homeFor(role: Role) {
  return role === "teacher" ? "/teacher" : "/learn";
}

export function Spinner() {
  return (
    <div role="status" aria-label="Loading" className="flex justify-center py-24">
      <div className="h-8 w-8 rounded-full border-2 border-[var(--border-color)] border-t-[var(--accent)] animate-spin" />
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
      <p className="text-center py-24 text-[var(--text-secondary)]">
        Your account is not set up yet. Please ask the admin for help.
      </p>
    );
  }
  return <>{children}</>;
}
