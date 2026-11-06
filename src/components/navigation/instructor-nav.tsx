"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store/app-store";
import {
  LayoutDashboard,
  FolderKanban,
  FileVideo,
  Users,
  BarChart3,
  Settings,
  PlusCircle,
  Sparkles,
  BookOpen
} from "lucide-react";

export function InstructorNav() {
  const pathname = usePathname();
  const { currentUser, currentCollege } = useApp();

  const navItems = [
    { label: "Overview", href: "/instructor", icon: LayoutDashboard },
    { label: "My Courses", href: "/instructor/courses", icon: BookOpen },
    { label: "Content Studio", href: "/instructor/content-studio", icon: FileVideo },
    { label: "Students", href: "/instructor/students", icon: Users },
    { label: "Analytics", href: "/instructor/analytics", icon: BarChart3 },
    { label: "Settings", href: "/instructor/settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Mode */}
        <div className="flex items-center gap-6">
          <Link href="/instructor" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-heading font-bold text-base shadow-sm">
              S
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm text-[var(--text-primary)]">
                  Studyroom
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--accent-light)] text-[var(--accent-text)] border border-[var(--accent)]/20">
                  Faculty
                </span>
              </div>
              <span className="text-[10px] text-[var(--text-secondary)] truncate max-w-[170px]">
                {currentCollege.name}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/instructor" && pathname.startsWith(item.href));
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

        {/* Quick Action: New Course & Profile */}
        <div className="flex items-center gap-3">
          <Link
            href="/instructor/courses/new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-xs font-medium shadow-sm transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create Course</span>
          </Link>

          <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-color)]">
            <img
              src={currentUser.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=260"}
              alt={currentUser.full_name}
              className="w-7 h-7 rounded-full object-cover border border-[var(--border-color)]"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-medium text-[var(--text-primary)]">
                {currentUser.full_name}
              </span>
              <span className="text-[10px] text-[var(--text-secondary)]">Faculty Director</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
