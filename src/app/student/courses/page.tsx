"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store/app-store";
import { Search, BookOpen, Clock, ChevronRight, Filter, User, Play } from "lucide-react";

export default function StudentCoursesPage() {
  const { courses, departments } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("all");

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === "all" || c.department_id === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="max-w-xl sm:max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-28 space-y-6">
      
      {/* Title & Subtitle */}
      <div>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-normal tracking-tight font-sans">
          Academic Curriculum
        </p>
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-[#111110] dark:text-white tracking-tight leading-tight mt-0.5">
          My Enrolled Courses
        </h1>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search authorized courses and subjects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-full bg-white dark:bg-[#20201E] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
        />
      </div>

      {/* Filter Navigation Pills matching Home Screen */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedDept("all")}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            selectedDept === "all"
              ? "bg-white dark:bg-[#20201E] text-[#111110] dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm"
              : "text-gray-400 hover:text-black dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-800"
          }`}
        >
          All Departments ({courses.length})
        </button>
        {departments.map((dept) => (
          <button
            key={dept.id}
            onClick={() => setSelectedDept(dept.id)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedDept === dept.id
                ? "bg-white dark:bg-[#20201E] text-[#111110] dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm"
                : "text-gray-400 hover:text-black dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-800"
            }`}
          >
            {dept.name} ({dept.code})
          </button>
        ))}
      </div>

      {/* Courses List */}
      <div className="space-y-5">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="rounded-[32px] overflow-hidden bg-white dark:bg-[#20201E] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col group"
          >
            {/* Course Banner */}
            <div className="h-44 sm:h-52 w-full relative overflow-hidden bg-gray-100 dark:bg-gray-900">
              <img
                src={course.cover_image}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-mono text-[11px] font-bold">
                {course.code}
              </div>

              <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold">
                {course.progress_percentage || 67}% Completed
              </div>
            </div>

            {/* Course Details */}
            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-orange-600" />
                  <span>{course.instructor?.full_name || "Faculty Director"}</span>
                </div>

                <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#111110] dark:text-white group-hover:text-orange-600 transition-colors line-clamp-1 mb-1">
                  {course.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                  {course.description}
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800/80">
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#2563EB] h-full rounded-full transition-all"
                    style={{ width: `${course.progress_percentage || 67}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] font-mono text-gray-400">
                    3 Modules · 12 Lessons
                  </span>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/student/courses/${course.id}/video`}
                      className="px-3.5 py-1.5 rounded-full bg-orange-500/10 hover:bg-orange-500 hover:text-white text-orange-600 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Resume</span>
                    </Link>

                    <Link
                      href={`/student/courses/${course.id}`}
                      className="font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-600 flex items-center gap-0.5 text-xs transition-colors"
                    >
                      <span>Syllabus</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
