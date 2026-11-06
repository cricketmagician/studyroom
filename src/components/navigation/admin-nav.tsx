"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store/app-store";
import {
  Building2,
  GraduationCap,
  Users2,
  CalendarDays,
  Layers,
  ArrowRightLeft,
  ShieldCheck,
  Globe
} from "lucide-react";

export function CollegeAdminNav() {
  const pathname = usePathname();
  const { currentUser, currentCollege } = useApp();

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: Layers },
    { label: "Departments", href: "/admin/departments", icon: Building2 },
    { label: "Students", href: "/admin/students", icon: GraduationCap },
    { label: "Instructors", href: "/admin/instructors", icon: Users2 },
    { label: "Batches & Sessions", href: "/admin/batches", icon: CalendarDays },
    { label: "Course Allocations", href: "/admin/allocations", icon: ArrowRightLeft },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-heading font-bold text-base shadow-sm">
              S
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm text-[var(--text-primary)]">
                  Studyroom
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  College Administration
                </span>
              </div>
              <span className="text-[10px] text-[var(--text-secondary)] truncate max-w-[170px]">
                {currentCollege.name}
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img
              src={currentUser.avatar_url || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=260"}
              alt={currentUser.full_name}
              className="w-7 h-7 rounded-full object-cover border border-[var(--border-color)]"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-medium text-[var(--text-primary)]">{currentUser.full_name}</span>
              <span className="text-[10px] text-[var(--text-secondary)]">Dean of Academic Affairs</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function PlatformAdminNav() {
  const pathname = usePathname();
  const { currentUser } = useApp();

  const navItems = [
    { label: "Platform Overview", href: "/platform", icon: Globe },
    { label: "Colleges (Tenants)", href: "/platform/colleges", icon: Building2 },
    { label: "Global Users", href: "/platform/users", icon: Users2 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/platform" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#20201E] dark:bg-white text-white dark:text-[#20201E] flex items-center justify-center font-heading font-bold text-base shadow-sm">
              S
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm text-[var(--text-primary)]">
                  Studyroom
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  Platform Root
                </span>
              </div>
              <span className="text-[10px] text-[var(--text-secondary)]">
                Multi-Tenant Cloud Control Plane
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/platform" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <img
            src={currentUser.avatar_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=260"}
            alt={currentUser.full_name}
            className="w-7 h-7 rounded-full object-cover border border-[var(--border-color)]"
          />
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-medium text-[var(--text-primary)]">{currentUser.full_name}</span>
            <span className="text-[10px] text-[var(--text-secondary)]">Platform Architect</span>
          </div>
        </div>
      </div>
    </header>
  );
}
