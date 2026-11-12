"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, UserCheck, UserMinus, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { postAi } from "@/lib/ai-client";
import { ErrorText } from "@/components/auth-card";

type Admin = { id: string; name: string; email: string };

export function AdminAccess({ onChanged }: { onChanged: () => void }) {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<Admin[] | null>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    try {
      const data = await postAi<{ admins: Admin[] }>("/api/admins", { action: "list" });
      setAdmins(data.admins);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    const initial = setTimeout(() => refresh(), 0);
    return () => clearTimeout(initial);
  }, [refresh]);

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    const address = email.trim().toLowerCase();
    if (!address) return;
    if (
      !confirm(
        `Grant admin access to ${address}? They will be able to view student activity and publish study resources.`
      )
    )
      return;

    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await postAi<{ changed: boolean; email: string }>("/api/admins", {
        action: "grant",
        email: address,
      });
      setMessage(
        result.changed
          ? `✓ ${result.email} has been granted Admin privileges.`
          : `${result.email} is already an Admin.`
      );
      setEmail("");
      await refresh();
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleRevoke = async (admin: Admin) => {
    if (
      !confirm(
        `Revoke admin access for ${admin.name} (${admin.email})? They will be reverted to a student account.`
      )
    )
      return;

    setRevokingId(admin.id);
    setError("");
    setMessage("");
    try {
      await postAi("/api/admins", {
        action: "revoke",
        uid: admin.id,
      });
      setMessage(`✓ Admin access revoked for ${admin.email}. Reverted to student.`);
      await refresh();
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-5">
        <div>
          <span className="text-xs tabular-nums font-bold tracking-widest uppercase text-[var(--text-secondary)]">
            FIREBASE SECURITY & ROLES
          </span>
          <h2 className="text-2xl font-apfel font-bold text-[var(--text-primary)] mt-1">
            Admin Access Control
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            kumarnihal829@gmail.com is your primary administrator. You can grant admin rights to other verified Google accounts or revoke them below.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6 text-[var(--text-primary)]" />
        </div>
      </div>

      {/* Grant Form */}
      <form onSubmit={handleGrant} className="space-y-4">
        <div>
          <label className="block text-xs tabular-nums uppercase font-bold text-[var(--text-secondary)] mb-1.5">
            Grant Admin Role by Email
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="apple-glass-input-wrapper flex-1 px-4 py-3">
              <input
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                disabled={busy}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="registered.student@gmail.com"
                className="text-sm font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={busy || !email.trim()}
              className="apple-glass-btn px-6 py-3 text-sm font-apfel font-bold shrink-0 cursor-pointer disabled:opacity-50"
            >
              {busy ? "Updating..." : "Make Admin"}
            </button>
          </div>
          <span className="block text-[13px] tabular-nums text-[var(--text-secondary)] mt-2">
            The user must first sign in once with Google so their Firebase account profile exists.
          </span>
        </div>

        <ErrorText>{error}</ErrorText>
        {message && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}
      </form>

      {/* Current Admins List */}
      <div className="space-y-3 pt-4 border-t border-black/5 dark:border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm tabular-nums uppercase tracking-wider font-bold text-[var(--text-primary)]">
            Active Administrators ({admins?.length ?? 0})
          </h3>
          <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">
            Stored in Firestore (`profiles`)
          </span>
        </div>

        {!admins ? (
          <div className="py-8 text-center text-xs tabular-nums text-[var(--text-secondary)]">
            Loading active admins…
          </div>
        ) : (
          <div className="space-y-2.5">
            {admins.map((adm) => {
              const isSelf = adm.id === user?.uid || adm.email === user?.email;
              const isPrimary = adm.email.toLowerCase() === "kumarnihal829@gmail.com";

              return (
                <div
                  key={adm.id}
                  className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--brand)] text-[var(--on-brand)] flex items-center justify-center font-bold text-sm shrink-0">
                      {adm.name ? adm.name.charAt(0).toUpperCase() : "A"}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-apfel font-bold text-sm text-[var(--text-primary)]">
                          {adm.name || "Administrator"}
                        </span>
                        {isSelf && (
                          <span className="px-2 py-0.5 rounded-full text-[13px] tabular-nums font-bold bg-black/10 dark:bg-white/15 text-[var(--text-primary)]">
                            You
                          </span>
                        )}
                        {isPrimary && (
                          <span className="px-2 py-0.5 rounded-full text-[13px] tabular-nums font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                            Super Admin
                          </span>
                        )}
                      </div>
                      <div className="text-xs tabular-nums text-[var(--text-secondary)] truncate">
                        {adm.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-[13px] tabular-nums font-bold bg-black/5 dark:bg-white/10 text-[var(--text-primary)]">
                      Admin
                    </span>

                    {!isSelf && !isPrimary && (
                      <button
                        type="button"
                        disabled={revokingId === adm.id}
                        onClick={() => handleRevoke(adm)}
                        className="px-2.5 py-1 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Revoke admin access (demote to student)"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>{revokingId === adm.id ? "Revoking..." : "Revoke"}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
