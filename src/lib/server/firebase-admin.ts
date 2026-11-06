// Server-only: Firebase Admin bypasses security rules, so never import this from a client component.
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const useEmulator = process.env.NEXT_PUBLIC_USE_EMULATOR === "true";

if (useEmulator) {
  // `npm run local` sets these already; defaults keep `next dev` against the emulator working too.
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
  process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
  process.env.FIREBASE_STORAGE_EMULATOR_HOST ??= "127.0.0.1:9199";
}

const projectId = useEmulator ? "demo-studyroom" : process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = useEmulator ? "demo-studyroom.appspot.com" : process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

const app =
  getApps()[0] ??
  // Real projects read service-account credentials from GOOGLE_APPLICATION_CREDENTIALS (automatic on Firebase App Hosting).
  initializeApp(useEmulator ? { projectId, storageBucket } : { credential: applicationDefault(), projectId, storageBucket });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export const bucket = getStorage(app).bucket();
