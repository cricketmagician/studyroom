"use client";

import React, { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { friendlyError } from "@/lib/firebase/errors";
import { AuthCard, Field, ErrorText, buttonClass } from "@/components/auth-card";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email")).trim();
    setBusy(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      setError(friendlyError(err));
    }
    setBusy(false);
  };

  return (
    <AuthCard title="Reset password" subtitle="We'll email you a link to set a new password.">
      {sent ? (
        <p role="status" className="text-center">If an account exists for this email, a reset link is on its way. Check your inbox.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email" name="email" type="email" autoComplete="email" />
          <ErrorText>{error}</ErrorText>
          <button type="submit" disabled={busy} className={buttonClass}>
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="text-[var(--accent-text)] hover:underline">Back to log in</Link>
      </p>
    </AuthCard>
  );
}
