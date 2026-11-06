"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store/app-store";
import { UserRole } from "@/types/database";
import {
  GraduationCap,
  Sparkles,
  Building2,
  Globe,
  ArrowRight,
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { switchRole, currentCollege } = useApp();
  const [email, setEmail] = useState("simatupang@student.stjude.edu");
  const [password, setPassword] = useState("••••••••••••");
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRoleSelect = (role: UserRole, defaultEmail: string) => {
    setSelectedRole(role);
    setEmail(defaultEmail);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    setTimeout(() => {
      switchRole(selectedRole);
      setIsLoading(false);
      if (selectedRole === "student") {
        router.push("/student");
      } else if (selectedRole === "instructor") {
        router.push("/instructor");
      } else if (selectedRole === "college_admin") {
        router.push("/admin");
      } else {
        router.push("/platform");
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-heading font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
            S
          </div>
          <span className="font-heading font-bold text-xl text-[var(--text-primary)]">
            Studyroom
          </span>
        </Link>
        <h2 className="text-2xl font-heading font-bold tracking-tight text-[var(--text-primary)]">
          Institutional Access
        </h2>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          {currentCollege.name} ({currentCollege.domain})
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[var(--bg-surface)] py-8 px-6 shadow-xl rounded-3xl border border-[var(--border-color)] sm:px-10">
          
          {/* Quick Persona Selector */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Select Demo Identity
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect("student", "simatupang@student.stjude.edu")}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                  selectedRole === "student"
                    ? "bg-[var(--accent-light)] border-[var(--accent)] text-[var(--accent-text)]"
                    : "border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)]"
                }`}
              >
                <GraduationCap className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-left leading-tight">Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect("instructor", "marcus.vance@faculty.stjude.edu")}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                  selectedRole === "instructor"
                    ? "bg-[var(--accent-light)] border-[var(--accent)] text-[var(--accent-text)]"
                    : "border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)]"
                }`}
              >
                <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-left leading-tight">Instructor</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect("college_admin", "dean.price@admin.stjude.edu")}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                  selectedRole === "college_admin"
                    ? "bg-[var(--accent-light)] border-[var(--accent)] text-[var(--accent-text)]"
                    : "border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)]"
                }`}
              >
                <Building2 className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-left leading-tight">College Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect("platform_admin", "platform.lead@studyroom.cloud")}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                  selectedRole === "platform_admin"
                    ? "bg-[var(--accent-light)] border-[var(--accent)] text-[var(--accent-text)]"
                    : "border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)]"
                }`}
              >
                <Globe className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-left leading-tight">Platform Admin</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-primary)]">
                Institutional Email
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[var(--text-secondary)]" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-xs border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none"
                  placeholder="name@university.edu"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[var(--text-primary)]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-medium text-[var(--accent)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[var(--text-secondary)]" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-xs border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl shadow-sm text-xs font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] focus:outline-none transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate & Enter Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-secondary)]">
            <span>Received an institutional invitation? </span>
            <Link href="/register" className="font-semibold text-[var(--accent)] hover:underline">
              Accept Invitation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
