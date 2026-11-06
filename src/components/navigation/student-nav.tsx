"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/store/app-store";
import { useTheme } from "@/components/providers/theme-provider";
import {
  BookOpen,
  Calendar,
  FileText,
  LayoutGrid,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  GraduationCap,
  LogOut,
  Play,
  UploadCloud
} from "lucide-react";

export function StudentNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, currentCollege } = useApp();
  const { theme, toggleTheme } = useTheme();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const isHomeActive = pathname === "/" || pathname === "/student";
  const isCoursesActive = pathname.startsWith("/student/courses");
  const isNotesActive = pathname.startsWith("/student/notes");
  const isLibraryActive = pathname.startsWith("/student/library");
  const isScheduleActive = pathname.startsWith("/student/schedule");

  return (
    <>
      {/* 1. UNIFIED TOP NAVBAR */}
      <header className="w-full border-b border-gray-200/80 dark:border-gray-800 bg-[#F6F4EF]/90 dark:bg-[#171715]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <Link href="/student" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-[#111110] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M12 3L2 9l10 6 10-6-10-6zm0 8.5L5.5 8 12 4.1 18.5 8 12 11.5zM4 12.5v4.2c0 2.5 3.6 4.3 8 4.3s8-1.8 8-4.3v-4.2l-8 4.8-8-4.8z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-black text-lg tracking-tight text-[#111110] dark:text-white leading-none">
                Skillverse
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                {currentCollege.name.split(" ")[0]} Academic
              </span>
            </div>
          </Link>

          {/* Right Controls: Shortcut, Notifications, Theme & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Resume Lecture Shortcut */}
            <Link
              href="/student/courses/cs301/video"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E57835] hover:bg-[#D56825] text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Resume Lecture</span>
            </Link>

            {/* Notification Bell */}
            <button
              onClick={() => alert("Notification: CS-301 assignment deadline tomorrow.")}
              className="relative w-9 h-9 rounded-full bg-white dark:bg-[#20201E] border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-2xs"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#20201E]" />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-white dark:bg-[#20201E] border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-2xs"
              title="Toggle Light / Dark Theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-700" />}
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-white dark:bg-[#20201E] border border-gray-200 dark:border-gray-800 shadow-2xs hover:border-gray-400 transition-all"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80"
                    alt="Simatupang"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="hidden md:inline text-xs font-semibold text-[#111110] dark:text-white truncate max-w-[90px]">
                  Simatupang
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {/* Real User Profile Dropdown Menu */}
              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#20201E] border border-gray-200 dark:border-gray-800 p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                    <div className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                      {currentUser.full_name}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono truncate">
                      {currentUser.email || "simatupang@student.stjude.edu"}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <Link
                      href="/student/profile"
                      onClick={() => setRoleMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <GraduationCap className="w-4 h-4 text-orange-600" />
                      <span>Academic Profile</span>
                    </Link>

                    <Link
                      href="/student/notes"
                      onClick={() => setRoleMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span>My Notes & Annotations</span>
                    </Link>

                    <Link
                      href="/student/library"
                      onClick={() => setRoleMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-emerald-500" />
                      <span>Personal Library</span>
                    </Link>

                    <Link
                      href="/instructor/content-studio"
                      onClick={() => setRoleMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs hover:bg-orange-50 dark:hover:bg-orange-950/20 text-orange-600 dark:text-orange-400 font-semibold transition-colors"
                    >
                      <UploadCloud className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      <span>Faculty Studio (Upload PDF)</span>
                    </Link>

                    <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

                    <Link
                      href="/login"
                      onClick={() => setRoleMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 transition-colors font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* 2. UNIFIED FLOATING DARK CAPSULE DOCK */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#505157]/95 dark:bg-[#1E1E1C]/95 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2 shadow-2xl flex items-center gap-5 sm:gap-6">
        
        {/* Home Button */}
        <Link
          href="/student"
          className={`flex items-center justify-center transition-transform ${
            isHomeActive
              ? "w-10 h-10 rounded-full bg-white text-[#2563EB] shadow-md hover:scale-105"
              : "w-9 h-9 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          }`}
          title="Course Learning Home"
        >
          <svg className={`w-5 h-5 ${isHomeActive ? "fill-[#2563EB]" : "fill-current"}`} viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </Link>

        {/* Courses Button */}
        <Link
          href="/student/courses"
          className={`flex items-center justify-center transition-transform ${
            isCoursesActive
              ? "w-10 h-10 rounded-full bg-white text-[#2563EB] shadow-md hover:scale-105"
              : "w-9 h-9 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          }`}
          title="My Enrolled Courses"
        >
          <BookOpen className={`w-4 h-4 ${isCoursesActive ? "text-[#2563EB]" : "text-white"}`} />
        </Link>

        {/* Notes Button */}
        <Link
          href="/student/notes"
          className={`flex items-center justify-center transition-transform ${
            isNotesActive
              ? "w-10 h-10 rounded-full bg-white text-[#2563EB] shadow-md hover:scale-105"
              : "w-9 h-9 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          }`}
          title="Notes & Bookmarks"
        >
          <FileText className={`w-4 h-4 ${isNotesActive ? "text-[#2563EB]" : "text-white"}`} />
        </Link>

        {/* Library Button */}
        <Link
          href="/student/library"
          className={`flex items-center justify-center transition-transform ${
            isLibraryActive
              ? "w-10 h-10 rounded-full bg-white text-[#2563EB] shadow-md hover:scale-105"
              : "w-9 h-9 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          }`}
          title="Monograph Library"
        >
          <LayoutGrid className={`w-4 h-4 ${isLibraryActive ? "text-[#2563EB]" : "text-white"}`} />
        </Link>

        {/* Schedule Button */}
        <Link
          href="/student/schedule"
          className={`flex items-center justify-center transition-transform ${
            isScheduleActive
              ? "w-10 h-10 rounded-full bg-white text-[#2563EB] shadow-md hover:scale-105"
              : "w-9 h-9 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          }`}
          title="Class Schedule"
        >
          <Calendar className={`w-4 h-4 ${isScheduleActive ? "text-[#2563EB]" : "text-white"}`} />
        </Link>

      </nav>
    </>
  );
}
