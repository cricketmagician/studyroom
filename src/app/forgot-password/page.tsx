"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-heading font-bold text-lg shadow-sm">
            S
          </div>
          <span className="font-heading font-bold text-xl text-[var(--text-primary)]">
            Studyroom
          </span>
        </Link>
        <h2 className="text-2xl font-heading font-bold tracking-tight text-[var(--text-primary)]">
          Reset Password
        </h2>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Enter your registered institutional email to receive recovery instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[var(--bg-surface)] py-8 px-6 shadow-xl rounded-3xl border border-[var(--border-color)] sm:px-10">
          {isSent ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Recovery Link Sent</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 mb-6">
                If an account exists for {email}, a secure password reset link has been dispatched.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-primary)]">
                  University Email Address
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-[var(--text-secondary)]" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="student@stjude.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 text-xs border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl shadow-sm text-xs font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-all"
              >
                Send Recovery Instructions
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
