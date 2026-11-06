"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRedirectIfSignedIn } from "@/lib/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { friendlyError } from "@/lib/firebase/errors";
import { AuthCard, Field, ErrorText, buttonClass } from "@/components/auth-card";

export default function RegisterPage() {
  useRedirectIfSignedIn();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
      await setDoc(doc(db, "profiles", user.uid), { name, email, role: "student" });
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Create your account" subtitle="Sign up to see your class files.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Your name" name="name" autoComplete="name" maxLength={80} />
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field label="Password (at least 6 characters)" name="password" type="password" autoComplete="new-password" minLength={6} />
        <ErrorText>{error}</ErrorText>
        <button type="submit" disabled={busy} className={buttonClass}>
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[var(--accent-text)] hover:underline">Log in</Link>
      </p>
    </AuthCard>
  );
}
