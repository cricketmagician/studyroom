"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRedirectIfSignedIn } from "@/lib/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { friendlyError } from "@/lib/firebase/errors";
import { AuthCard, Field, ErrorText, buttonClass } from "@/components/auth-card";
import { GoogleSignIn } from '@/components/google-sign-in';
import { haptic } from "@/lib/haptics";

export default function LoginPage() {
  useRedirectIfSignedIn();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, String(form.get("email")).trim(), String(form.get("password")));
      haptic("success");
    } catch (err) {
      haptic("warning");
      setError(friendlyError(err));
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Log in to keep your streak going.">
      <form method="post" onSubmit={handleSubmit}>
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field label="Password" name="password" type="password" autoComplete="current-password" />
        <Link href="/forgot-password" className="-mt-2 justify-self-end text-sm font-semibold text-[var(--accent-text)] hover:underline">Forgot password?</Link>
        <ErrorText>{error}</ErrorText>
        <button type="submit" disabled={busy} className={buttonClass}>
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
      <GoogleSignIn busy={busy} onBusy={setBusy} onError={setError}/>
      <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
        New here? <Link href="/register" className="font-semibold text-[var(--accent-text)] hover:underline">Create account</Link>
      </p>
    </AuthCard>
  );
}
