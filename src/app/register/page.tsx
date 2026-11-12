"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LEVELS, Level } from "@/lib/cma";
import { GoogleSignIn } from '@/components/google-sign-in';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { friendlyError } from "@/lib/firebase/errors";
import { AuthCard, Field, ErrorText, buttonClass } from "@/components/auth-card";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [level, setLevel] = useState<Level>('Intermediate');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name")).trim();
    const email = String(form.get("email")).trim();
    setBusy(true);
    setError("");
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, String(form.get("password")));
      // Everyone signs up as a student; the admin makes teachers in the Firebase console.
      await setDoc(doc(db, "profiles", user.uid), { name, email: user.email, role: "student", level: String(form.get('level')), createdAt: serverTimestamp() });
      router.replace('/');
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Create your account" subtitle="Free for CMA students. Takes one minute.">
      <form method="post" onSubmit={handleSubmit}>
        <Field label="Your name" name="name" autoComplete="name" maxLength={80} />
        <label className="auth-field">CMA level<select name="level" value={level} onChange={e=>setLevel(e.target.value as Level)}>{LEVELS.map(level => <option key={level}>{level}</option>)}</select></label>
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field label="Password (at least 6 characters)" name="password" type="password" autoComplete="new-password" minLength={6} />
        <ErrorText>{error}</ErrorText>
        <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">Your teacher can see your name, email, CMA level, days present, study time and the files you open. Friends you accept can see your name, streak and study time.</p>
        <button type="submit" disabled={busy} className={buttonClass}>
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
      <GoogleSignIn busy={busy} onBusy={setBusy} onError={setError} level={level}/>
      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[var(--accent-text)] hover:underline">Log in</Link>
      </p>
    </AuthCard>
  );
}
