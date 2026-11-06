"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store/app-store";
import { ArrowRight, Mail, KeyRound, Building, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { currentCollege } = useApp();
  const [inviteCode, setInviteCode] = useState("STJUDE-FALL26-HCI");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      router.push("/student");
    }, 1200);
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
          Accept Institutional Invite
        </h2>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Join your cohort at {currentCollege.name}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[var(--bg-surface)] py-8 px-6 shadow-xl rounded-3xl border border-[var(--border-color)] sm:px-10">
          {isSuccess ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 animate-bounce" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">Invitation Verified!</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Setting up your student workspace and enrolled courses...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-primary)]">
                  Cohort Invitation Code
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-4 w-4 text-[var(--text-secondary)]" />
                  </div>
                  <input
                    type="text"
                    required
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 text-xs border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-primary)]">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Vance"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 text-xs border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-primary)]">
                  University Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="elena@student.stjude.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 text-xs border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-primary)]">
                  Create Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 text-xs border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl shadow-sm text-xs font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-all"
              >
                <span>Activate Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-secondary)]">
            Already have an active account?{" "}
            <Link href="/login" className="font-semibold text-[var(--accent)] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
