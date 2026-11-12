"use client";

import { postAi } from "./ai-client";

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    return reg;
  } catch (err) {
    console.error("Service worker registration failed:", err);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!isNotificationSupported()) return "unsupported";
  try {
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      const reg = await registerServiceWorker();
      // Try to register web push subscription token with server
      if (reg && "pushManager" in reg) {
        try {
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            await postAi("/api/study", {
              action: "save_push_token",
              subscription: JSON.stringify(sub),
            }).catch(() => {});
          }
        } catch {
          // Push manager fallback
        }
      }
    }
    return perm;
  } catch (err) {
    console.error("Notification permission request error:", err);
    return "denied";
  }
}

export async function showPushNotification(
  title: string,
  options?: { body?: string; url?: string; icon?: string }
): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== "granted") return false;

  try {
    const reg = await navigator.serviceWorker.ready;
    if (reg && "showNotification" in reg) {
      const notificationOptions: NotificationOptions & { vibrate?: number[] } = {
        body: options?.body || "You have a new update in Abhyas.",
        icon: options?.icon || "/illustrations/focus.svg",
        badge: "/illustrations/focus.svg",
        data: { url: options?.url || "/?view=Friends" },
        vibrate: [200, 100, 200],
      };
      await reg.showNotification(title, notificationOptions);
      return true;
    } else {
      // Fallback to desktop Notification constructor
      new Notification(title, {
        body: options?.body,
        icon: options?.icon || "/illustrations/focus.svg",
      });
      return true;
    }
  } catch (err) {
    console.error("Failed to show push notification:", err);
    return false;
  }
}
