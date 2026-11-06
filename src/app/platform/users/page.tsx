"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DEMO_PROFILES } from "@/lib/demo-data";
import { Users2, ArrowLeft, Search, ShieldCheck } from "lucide-react";

export default function PlatformUsersPage() {
  const [search, setSearch] = useState("");

  const filtered = DEMO_PROFILES.filter(
    (u) => u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Platform Overview</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
            Global User Management
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Cross-tenant identities, RBAC roles, and authentication records
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search all platform users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] w-64"
          />
        </div>
      </div>

      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[var(--bg-surface-subtle)] border-b border-[var(--border-color)] text-[var(--text-secondary)] uppercase text-[10px] font-semibold">
            <tr>
              <th className="py-3 px-5">User</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">College Tenant</th>
              <th className="py-3 px-4">Identifier / Student ID</th>
              <th className="py-3 px-5 text-right">Access Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-[var(--bg-primary)]/40 transition-colors">
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=260"}
                      alt={u.full_name}
                      className="w-7 h-7 rounded-full object-cover border border-[var(--border-color)]"
                    />
                    <div>
                      <div className="font-semibold text-[var(--text-primary)]">{u.full_name}</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent-text)]">
                    {u.role.replace("_", " ")}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--text-secondary)]">{u.college_id}</td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--text-secondary)]">{u.student_id || "N/A"}</td>
                <td className="py-3.5 px-5 text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
