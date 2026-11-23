"use client";
import { useEffect } from 'react';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import { registerServiceWorker } from '@/lib/notifications';
import { isNative } from '@/lib/native';
import { notificationPath } from '@/lib/mobile-validation';

export function PwaRegister() {
  useEffect(() => {
    if (!isNative()) { void registerServiceWorker(); return; }
    const open = (url: string) => {
      try { const parsed = new URL(url); if(parsed.origin === window.location.origin && parsed.pathname+parsed.search !== window.location.pathname+window.location.search) window.location.assign(notificationPath(parsed.pathname+parsed.search)); } catch { }
    };
    const external = (event: MouseEvent) => {
      const a = (event.target as Element)?.closest?.('a');
      if (!a || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.protocol === 'https:' && url.origin !== window.location.origin) {
        event.preventDefault(); void Browser.open({url:url.href});
      }
    };
    document.addEventListener('click',external);
    const listeners = [
      App.addListener('backButton', ({canGoBack}) => {
        const modal = document.querySelector<HTMLDialogElement>('dialog[open]');
        if(modal) modal.close();
        else if((window.location.pathname !== '/' || window.location.search) && canGoBack) window.history.back();
        else void App.minimizeApp();
      }),
      App.addListener('appStateChange', ({isActive}) => { if(isActive) {window.dispatchEvent(new Event('focus'));window.dispatchEvent(new Event('studyroom:session'));} }),
      App.addListener('appUrlOpen', ({url}) => open(url)),
      LocalNotifications.addListener('localNotificationActionPerformed', ({notification}) => window.location.assign(notificationPath(notification.extra?.url))),
    ];
    void App.getLaunchUrl().then(result=>{if(result?.url)open(result.url);});
    return () => { document.removeEventListener('click',external); for(const listener of listeners) void listener.then(l=>l.remove()); };
  }, []);
  return null;
}
