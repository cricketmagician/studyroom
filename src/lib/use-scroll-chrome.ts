"use client";
import { useEffect, useState } from "react";

/**
 * Shared scroll behaviour for the app chrome, like iOS:
 * marks <html data-scrolled> once the page leaves the top (the header turns into frosted glass),
 * and returns `tucked` while scrolling down so the bottom tab bar can slide away.
 */
export function useScrollChrome() {
  const [tucked, setTucked] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      document.documentElement.toggleAttribute("data-scrolled", y > 4);
      if (Math.abs(y - last) < 8) return;
      const atBottom = y + innerHeight >= document.documentElement.scrollHeight - 8;
      setTucked(y > last && y > 80 && !atBottom);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); document.documentElement.removeAttribute("data-scrolled"); };
  }, []);
  return tucked;
}
