"use client";
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { friendlyError } from '@/lib/firebase/errors';
import { googleStudentProfile } from '@/lib/google-profile';
import type { Level } from '@/lib/cma';

export function GoogleSignIn({ busy, onBusy, onError, level = 'Intermediate' }: {
  busy: boolean; onBusy: (busy: boolean) => void; onError: (error: string) => void; level?: Level;
}) {
  const router = useRouter();
  return <div className="mt-5">
    <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] mb-5"><span className="h-px flex-1 bg-[var(--border-color)]"/>or continue with<span className="h-px flex-1 bg-[var(--border-color)]"/></div>
    <button type="button" disabled={busy} className="flex items-center justify-center gap-3 w-full h-[55px] rounded-full border-[1.5px] border-[var(--border-color)] bg-white font-semibold text-[var(--text-primary)] font-semibold disabled:opacity-50 focus-visible:ring-4 focus-visible:ring-[var(--ring-color)]" onClick={async () => {
      onBusy(true); onError('');
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({prompt:'select_account'});
        const { user } = await signInWithPopup(auth, provider);
        const ref = doc(db, 'profiles', user.uid);
        await runTransaction(db, async tx => {
          // Existing profiles keep their role, course and progress when using Google.
          if (!(await tx.get(ref)).exists()) tx.set(ref, {...googleStudentProfile(user,level),createdAt:serverTimestamp()});
        });
        router.replace('/');
      } catch (error) { onError(friendlyError(error)); }
      finally { onBusy(false); }
    }}><svg width="19" height="19" viewBox="0 0 48 48" aria-hidden="true"><path fill="#4285F4" d="M43.6 24.5c0-1.5-.1-3-.4-4.5H24v8.5h11c-.5 2.7-1.9 5-4.1 6.5v5.4h6.6c3.9-3.6 6.1-9 6.1-15.9Z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3C9.2 39.4 16.1 44 24 44Z"/><path fill="#FBBC05" d="M12.6 27.5a12 12 0 0 1 0-7V15H5.8a20 20 0 0 0 0 18l6.8-5.5Z"/><path fill="#EA4335" d="M24 12.1c3 0 5.6 1 7.7 3l5.8-5.8C34.1 6 29.5 4 24 4 16.1 4 9.2 8.6 5.8 15l6.8 5.5C14.2 15.7 18.7 12.1 24 12.1Z"/></svg>Continue with Google</button>
  </div>;
}
