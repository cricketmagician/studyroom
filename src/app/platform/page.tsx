"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/lib/store/app-store";
import { Globe, Building2, Users2, ShieldCheck, Server, ArrowRight } from "lucide-react";

export default function PlatformOverviewPage() {
  const { allColleges } = useApp();

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Studyroom Global Infrastructure
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--text-primary)]">
          Multi-Tenant Cloud Platform Overview
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Cross-institutional tenant isolation, Postgres Row Level Security enforcement, and edge storage health
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
            <span>Active Colleges</span>
            <Building2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-heading font-bold text-[var(--text-primary)]">
            {allColleges.length}
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1">St. Jude & Metropolitan</p>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
            <span>Global Users</span>
            <Users2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-heading font-bold text-[var(--text-primary)]">
            2,480
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1">Students & Faculty</p>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
            <span>Storage Engine</span>
            <Server className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-heading font-bold text-[var(--text-primary)] truncate">
            Cloudflare R2
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Direct signed upload ready</p>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
            <span>Tenant Isolation</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-heading font-bold text-[var(--text-primary)] truncate">
            Postgres RLS
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Strict college_id boundary</p>
        </div>
      </div>

      {/* College Tenants Card */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="font-heading font-bold text-base text-[var(--text-primary)]">
              Managed Institutional Tenants
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">Isolated college databases and branding</p>
          </div>
          <Link
            href="/platform/colleges"
            className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
          >
            <span>Configure</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allColleges.map((col) => (
            <div key={col.id} className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-start gap-4 text-xs">
              <img
                src={col.logo_url}
                alt={col.name}
                className="w-12 h-12 rounded-xl object-cover border border-[var(--border-color)] shrink-0"
              />
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-[var(--accent)] font-bold">{col.id}</span>
                <div className="font-semibold text-sm text-[var(--text-primary)]">{col.name}</div>
                <div className="text-[11px] text-[var(--text-secondary)]">{col.address}</div>
                <div className="text-[10px] font-mono text-[var(--text-secondary)]">Domain: {col.domain}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
