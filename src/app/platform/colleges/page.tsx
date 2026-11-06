"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store/app-store";
import { Building2, ArrowLeft, Plus, CheckCircle2 } from "lucide-react";

export default function PlatformCollegesPage() {
  const { allColleges } = useApp();

  return (
    <div className="space-y-6">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Platform Overview</span>
      </Link>

      <div>
        <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
          College Tenant Directory
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Multi-college tenant boundaries, custom domains, and visual identities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allColleges.map((col) => (
          <div key={col.id} className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs space-y-4">
            <div className="flex items-start gap-4">
              <img
                src={col.logo_url}
                alt={col.name}
                className="w-14 h-14 rounded-2xl object-cover border border-[var(--border-color)] shrink-0"
              />
              <div className="space-y-1">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent-text)]">
                  {col.slug}
                </span>
                <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">{col.name}</h3>
                <div className="text-xs text-[var(--text-secondary)]">{col.address}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] space-y-1 font-mono text-[11px]">
              <div>Tenant ID: <strong className="text-[var(--text-primary)]">{col.id}</strong></div>
              <div>Domain Boundary: <strong className="text-[var(--text-primary)]">{col.domain}</strong></div>
              <div>Accent Token: <span className="inline-block w-3 h-3 rounded-full align-middle ml-1" style={{ backgroundColor: col.primary_color }} /> {col.primary_color}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
