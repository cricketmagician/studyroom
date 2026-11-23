"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Check, Copy, Smartphone, ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";

const CDN_APK_URL = "https://yzi6mkqeaqghfd4b.public.blob.vercel-storage.com/downloads/abhyas-cma-v1.0.apk?download=1";
const DIRECT_APK_PATH = "/abhyas.apk";

export default function DownloadPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CDN_APK_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F6F8F7] text-[#0B1512] flex flex-col items-center justify-between px-4 py-8 sm:py-16 selection:bg-[#0E7C6B] selection:text-white">
      {/* Navigation / Brand header */}
      <header className="w-full max-w-xl flex items-center justify-between pb-6 border-b border-[#E8E6DF]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4A6443] to-[#32472E] flex items-center justify-center shadow-sm border border-[#607D5A]/40">
            <span className="w-2 h-2 rounded-full bg-[#FFB61D]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0B1512]">
            abhyas<span className="text-[#FFB61D]">.</span>
          </span>
        </Link>
        <Link
          href="/login"
          className="text-xs font-semibold text-[#5A6C58] hover:text-[#0B1512] transition-colors flex items-center gap-1"
        >
          Open Web App <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Download Card */}
      <main className="w-full max-w-xl my-auto py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-[#20301E]/5 border border-[#E2E8E5] flex flex-col items-center text-center">
          {/* App Icon */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-[26px] bg-gradient-to-br from-[#4A6443] to-[#32472E] flex items-center justify-center shadow-lg shadow-[#344D30]/25 border border-[#607D5A]/50">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-[#FFB61D] mb-2 shadow-sm" />
                <div className="w-10 h-3 border-t-2 border-b border-white rounded-full opacity-90" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#FFB61D] text-[#1D2B19] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Android
            </div>
          </div>

          {/* Title & Tagline */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1512] mb-2">
            Download Abhyas for Android
          </h1>
          <p className="text-sm text-[#667564] max-w-md leading-relaxed mb-6">
            Daily CMA exam practice, chapter-wise MCQs, instant AI formula flashcards, and student routines in your pocket.
          </p>

          {/* Badges / Specs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs font-medium text-[#4D5D4B]">
            <span className="bg-[#F2F6F4] px-3 py-1 rounded-full border border-[#DCE4E0]">Version 1.0.0</span>
            <span className="bg-[#F2F6F4] px-3 py-1 rounded-full border border-[#DCE4E0]">13.3 MB</span>
            <span className="bg-[#F2F6F4] px-3 py-1 rounded-full border border-[#DCE4E0]">Android 8.0+</span>
            <span className="bg-[#E9F0E7] text-[#2C5226] px-3 py-1 rounded-full border border-[#CDE0C8] flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Build
            </span>
          </div>

          {/* Primary CTA Button */}
          <a
            href={CDN_APK_URL}
            download="abhyas-cma-v1.0.apk"
            className="w-full max-w-sm py-4 px-6 rounded-2xl bg-[#0E7C6B] hover:bg-[#384C33] active:scale-[0.98] text-white font-bold text-base shadow-lg shadow-[#0E7C6B]/25 transition-all flex items-center justify-center gap-2.5 mb-3 group"
          >
            <Download className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
            Download APK File
          </a>

          {/* Share / Copy Link Button */}
          <button
            onClick={handleCopy}
            className="text-xs font-semibold text-[#5A6C58] hover:text-[#0B1512] py-2 px-4 rounded-xl hover:bg-[#F4F3EC] transition-all flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Download link copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy link to share with friends</span>
              </>
            )}
          </button>

          {/* Alternate Mirror */}
          <div className="mt-4 text-[11px] text-[#869584]">
            Mirror link:{" "}
            <a href={DIRECT_APK_PATH} className="underline hover:text-[#0B1512]">
              Direct Server Download
            </a>
          </div>
        </div>

        {/* 3-Step Installation Guide */}
        <div className="mt-8 bg-white/70 backdrop-blur rounded-2xl p-6 border border-[#E2E8E5]">
          <h2 className="text-xs font-bold text-[#566754] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> How to Install on Android
          </h2>
          <ol className="space-y-3.5 text-xs sm:text-sm text-[#435241]">
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#E2E8E5] text-[#0F1E19] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <span>Tap the <strong>Download APK</strong> button above. Chrome may say <em>&quot;File might be harmful&quot;</em> — tap <strong>Download anyway</strong>.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#E2E8E5] text-[#0F1E19] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <span>Open the notification or find <code>abhyas-cma-v1.0.apk</code> in your phone&apos;s <strong>Downloads</strong> folder.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#E2E8E5] text-[#0F1E19] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <span>Tap <strong>Install</strong>. If prompted to allow unknown apps, toggle <em>&quot;Allow from this source&quot;</em> and complete setup.</span>
            </li>
          </ol>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-xl text-center pt-6 border-t border-[#E8E6DF] text-xs text-[#879685]">
        Abhyas · Crafted for CMA Intermediate students
      </footer>
    </div>
  );
}
