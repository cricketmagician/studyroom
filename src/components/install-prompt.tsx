"use client";
/* eslint-disable @next/next/no-img-element -- Local app icon. */
import { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react";
import { isNative } from "@/lib/native";
import "./install-prompt.css";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const KEY = "abhyas-install-dismissed";

/** Offers "Install app" as soon as the browser says the site can be installed (Chrome / Edge / Samsung on Android and desktop). */
export function InstallPrompt() {
  const [event, setEvent] = useState<InstallEvent | null>(null);

  useEffect(() => {
    if (isNative() || localStorage.getItem(KEY)) return;
    const ready = (e: Event) => { e.preventDefault(); setEvent(e as InstallEvent); };
    const installed = () => setEvent(null);
    window.addEventListener("beforeinstallprompt", ready);
    window.addEventListener("appinstalled", installed);
    return () => { window.removeEventListener("beforeinstallprompt", ready); window.removeEventListener("appinstalled", installed); };
  }, []);

  if (!event) return null;
  const close = () => { localStorage.setItem(KEY, "1"); setEvent(null); };
  const install = async () => { await event.prompt(); await event.userChoice; setEvent(null); };

  return (
    <div className="install-prompt" role="dialog" aria-label="Install Abhyas">
      <img src="/icons/app-192.png" alt="" width={44} height={44} />
      <span><b>Install Abhyas</b><small>Opens like an app, right from your home screen</small></span>
      <button type="button" className="install-go" onClick={install}>Install</button>
      <button type="button" className="install-x" onClick={close} aria-label="Not now"><X size={16} weight="bold" /></button>
    </div>
  );
}
