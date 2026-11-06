import { useEffect, useSyncExternalStore } from "react";
import { dayKey, weekKeys } from "@/lib/streak";

// shortcut: study time is stored per device (localStorage), so time on a phone and a laptop isn't combined; move to Firestore if students use several devices.
const EVENT = "studyroom:studytime";
const key = (uid: string, day: string) => `studyroom_time_${uid}_${day}`;

function read(uid: string, day: string) {
  try {
    return Number(localStorage.getItem(key(uid, day))) || 0;
  } catch {
    return 0;
  }
}

/**
 * Counts study time while the app is open and on screen. Pauses when the tab is hidden or the app is closed.
 * Mount once (in the app layout).
 */
export function useStudyTracker(uid: string | undefined) {
  useEffect(() => {
    if (!uid) return;
    let last = Date.now();
    const tick = () => {
      const now = Date.now();
      // Cap each step so a sleeping laptop doesn't count as study time.
      const seconds = Math.min(Math.round((now - last) / 1000), 5);
      last = now;
      if (document.visibilityState !== "visible" || seconds <= 0) return;
      const day = dayKey(new Date(now));
      try {
        localStorage.setItem(key(uid, day), String(read(uid, day) + seconds));
      } catch {}
      window.dispatchEvent(new Event(EVENT));
    };
    const id = setInterval(tick, 1000);
    // Restart the clock when coming back, so time away isn't counted.
    const onVisible = () => { if (document.visibilityState === "visible") last = Date.now(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [uid]);
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Seconds studied on each day of this week (Mon..Sun), live. */
export function useWeekStudyTime(uid: string) {
  // A string snapshot keeps useSyncExternalStore's equality check simple.
  const snapshot = useSyncExternalStore(
    subscribe,
    () => weekKeys(new Date()).map((d) => read(uid, d)).join(","),
    () => "0,0,0,0,0,0,0"
  );
  return snapshot.split(",").map(Number);
}

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}
