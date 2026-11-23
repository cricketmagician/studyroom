"use client";
import { useEffect, useRef } from 'react';
import { isNative, AbhyasNative } from '@/lib/native';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, signInWithCredential, type User } from 'firebase/auth';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { friendlyError } from '@/lib/firebase/errors';
import { googleStudentProfile } from '@/lib/google-profile';
import type { Level } from '@/lib/cma';

// The Firebase project's "Web client" OAuth ID (Google Cloud console → APIs & Services → Credentials). Without it we fall back to the popup.
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

type Gis = { accounts: { id: {
  initialize(config: Record<string, unknown>): void;
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
  prompt(): void;
  cancel(): void;
} } };
let gis: Promise<Gis> | null = null;
function loadGis() {
  gis ??= new Promise<Gis>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
    s.onload = () => resolve((window as unknown as { google: Gis }).google);
    s.onerror = () => { gis = null; reject(new Error('Google sign-in could not load. Check your internet.')); };
    document.head.appendChild(s);
  });
  return gis;
}

const GoogleG = () => <svg width="19" height="19" viewBox="0 0 48 48" aria-hidden="true"><path fill="#4285F4" d="M43.6 24.5c0-1.5-.1-3-.4-4.5H24v8.5h11c-.5 2.7-1.9 5-4.1 6.5v5.4h6.6c3.9-3.6 6.1-9 6.1-15.9Z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3C9.2 39.4 16.1 44 24 44Z"/><path fill="#FBBC05" d="M12.6 27.5a12 12 0 0 1 0-7V15H5.8a20 20 0 0 0 0 18l6.8-5.5Z"/><path fill="#EA4335" d="M24 12.1c3 0 5.6 1 7.7 3l5.8-5.8C34.1 6 29.5 4 24 4 16.1 4 9.2 8.6 5.8 15l6.8 5.5C14.2 15.7 18.7 12.1 24 12.1Z"/></svg>;

/**
 * Google sign-in that stays inside the app:
 * Android uses the native account sheet; the web uses Google Identity Services (One Tap sheet + FedCM button, an in-page account chooser on Chrome).
 * The popup is only a fallback when no web client ID is configured.
 */
export function GoogleSignIn({ busy, onBusy, onError, level = 'Intermediate' }: {
  busy: boolean; onBusy: (busy: boolean) => void; onError: (error: string) => void; level?: Level;
}) {
  const router = useRouter();
  const slot = useRef<HTMLDivElement>(null);
  const inPage = !!CLIENT_ID && !isNative();

  const finish = async (user: User) => {
    const ref = doc(db, 'profiles', user.uid);
    await runTransaction(db, async tx => {
      // Existing profiles keep their role, course and progress when using Google.
      if (!(await tx.get(ref)).exists()) tx.set(ref, {...googleStudentProfile(user,level),createdAt:serverTimestamp()});
    });
    router.replace('/');
  };
  const run = async (signIn: () => Promise<User>) => {
    onBusy(true); onError('');
    try { await finish(await signIn()); }
    catch (error) { onError(friendlyError(error)); }
    finally { onBusy(false); }
  };
  const withToken = (idToken: string) => run(async () => (await signInWithCredential(auth, GoogleAuthProvider.credential(idToken))).user);
  const latest = useRef(withToken);
  useEffect(() => { latest.current = withToken; });

  useEffect(() => {
    if (!inPage || !slot.current) return;
    let alive = true;
    loadGis().then((g) => {
      if (!alive || !slot.current) return;
      g.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: ({ credential }: { credential: string }) => void latest.current(credential),
        use_fedcm_for_button: true, use_fedcm_for_prompt: true,
        context: 'signin', cancel_on_tap_outside: true, itp_support: true,
      });
      g.accounts.id.renderButton(slot.current, { type: 'standard', theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', logo_alignment: 'center', width: Math.min(400, slot.current.clientWidth || 320) });
      g.accounts.id.prompt(); // One Tap: Google's account sheet appears on the page by itself.
    }).catch((e: Error) => alive && onError(e.message));
    return () => { alive = false; void gis?.then((g) => g.accounts.id.cancel()); };
  }, [inPage, onError]);

  return <div className="auth-google">
    {inPage
      ? <div ref={slot} className="auth-gis" aria-busy={busy} />
      : <button type="button" disabled={busy} className="auth-google-btn" onClick={() => run(async () => {
          if (isNative()) return (await signInWithCredential(auth, GoogleAuthProvider.credential((await AbhyasNative.googleSignIn()).idToken))).user;
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({prompt:'select_account'});
          return (await signInWithPopup(auth, provider)).user;
        })}><GoogleG/>Continue with Google</button>}
    <div className="auth-or"><span/>or use your email<span/></div>
  </div>;
}
