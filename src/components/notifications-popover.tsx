"use client";

import React, { useState } from "react";
import { Bell, Check, X, Calendar, Trophy, BookOpen, AlertCircle } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type: "exam" | "challenge" | "library";
}

export function NotificationsPopover({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n-1",
      title: "Exam Countdown Alert",
      desc: "48 days remaining for CMA Intermediate June 2026. Keep your streak alive!",
      time: "2h ago",
      read: false,
      type: "exam",
    },
    {
      id: "n-2",
      title: "Friend Challenge Update",
      desc: "Aarav Sharma just logged 4h in Cost Accounting. You're #4 in Group!",
      time: "4h ago",
      read: false,
      type: "challenge",
    },
    {
      id: "n-3",
      title: "New Revision Material Added",
      desc: "Capital Gains Comprehensive Digest is now available in Study Library.",
      time: "1d ago",
      read: true,
      type: "library",
    },
  ]);

  if (!isOpen) return null;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-3xl bg-white border border-[#EBE8E1] p-4 space-y-3 shadow-2xl animate-in fade-in slide-in-from-top-2 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-[#F5F3ED]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#111110]" />
          <h4 className="font-apfel font-bold text-sm text-[#111110]">Notifications</h4>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="text-[11px] tabular-nums text-[#059669] hover:underline cursor-pointer"
          >
            Mark all read
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#AAA79E] hover:text-[#111110] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
        {notifications.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-2xl transition-colors flex items-start gap-3 ${
              item.read ? "bg-[#FAF9F5]" : "bg-[#F3F8F5] border border-[#D1F2DD]"
            }`}
          >
            <div className="mt-0.5 w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 shadow-2xs">
              {item.type === "exam" ? (
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
              ) : item.type === "challenge" ? (
                <Trophy className="w-3.5 h-3.5 text-pink-500" />
              ) : (
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              )}
            </div>

            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-apfel font-bold text-xs text-[#111110] truncate">
                  {item.title}
                </span>
                <span className="text-[10px] tabular-nums text-[#AAA79E] shrink-0 ml-1">
                  {item.time}
                </span>
              </div>
              <p className="text-[11px] text-[#666560] leading-snug line-clamp-2">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
