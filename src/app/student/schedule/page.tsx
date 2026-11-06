"use client";

import React, { useState } from "react";
import { DEMO_SCHEDULE_EVENTS } from "@/lib/demo-data";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  ListFilter,
  CheckCircle2,
  CalendarDays
} from "lucide-react";

export default function StudentSchedulePage() {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [filterType, setFilterType] = useState<string>("all");

  const events = DEMO_SCHEDULE_EVENTS.filter((e) => {
    if (filterType === "all") return true;
    return e.type === filterType;
  });

  return (
    <div className="max-w-xl sm:max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-28 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-normal tracking-tight font-sans">
            Semesters & Timetable
          </p>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-[#111110] dark:text-white tracking-tight leading-tight mt-0.5">
            Academic Schedule
          </h1>
        </div>

        {/* View Switch */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs font-medium self-start sm:self-auto shadow-xs">
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              viewMode === "list"
                ? "bg-[var(--accent)] text-white shadow-xs font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Agenda List
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              viewMode === "calendar"
                ? "bg-[var(--accent)] text-white shadow-xs font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Weekly Grid
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2">
        {["all", "lecture", "deadline", "office_hours"].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
              filterType === t
                ? "bg-[var(--accent)] text-white shadow-xs"
                : "bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {t.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* View Output */}
      {viewMode === "list" ? (
        <div className="space-y-4">
          {events.map((ev) => {
            const isDeadline = ev.type === "deadline";
            const isLecture = ev.type === "lecture";

            return (
              <div
                key={ev.id}
                className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-2xl ${
                      isDeadline
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : isLecture
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-blue-500/10 text-blue-600"
                    }`}
                  >
                    <CalendarDays className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent-text)]">
                        {ev.courseCode}
                      </span>
                      <span className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        {ev.type.replace("_", " ")}
                      </span>
                    </div>

                    <h3 className="text-sm font-heading font-bold text-[var(--text-primary)]">
                      {ev.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)] mt-2">
                      <span className="flex items-center gap-1 font-medium text-[var(--text-primary)]">
                        <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>{ev.date} · {ev.time}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                        <span>{ev.location}</span>
                      </span>
                      {ev.instructor && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                            <span>{ev.instructor}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => alert(`Synchronized "${ev.title}" to device calendar.`)}
                    className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] text-xs font-medium transition-colors shadow-xs"
                  >
                    Add to Calendar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Weekly Grid View */
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 shadow-xs overflow-x-auto">
          <div className="min-w-[650px] grid grid-cols-5 gap-3">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day, i) => (
              <div key={day} className="space-y-3">
                <div className="text-center pb-2 border-b border-[var(--border-subtle)]">
                  <div className="text-xs font-semibold text-[var(--text-primary)]">{day}</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Nov {3 + i}</div>
                </div>

                {i === 2 && (
                  <div className="p-3 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent)]/30 text-xs">
                    <span className="font-mono text-[9px] font-bold text-[var(--accent)]">DES-401</span>
                    <div className="font-semibold text-[var(--text-primary)] text-[11px] mt-0.5">Spatial Models</div>
                    <div className="text-[10px] text-[var(--text-secondary)] mt-1">10:00 - 11:30 AM</div>
                  </div>
                )}

                {i === 3 && (
                  <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs">
                    <span className="font-mono text-[9px] font-bold text-blue-600">CS-482</span>
                    <div className="font-semibold text-[var(--text-primary)] text-[11px] mt-0.5">Cloud Storage R2</div>
                    <div className="text-[10px] text-[var(--text-secondary)] mt-1">02:00 - 03:30 PM</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
