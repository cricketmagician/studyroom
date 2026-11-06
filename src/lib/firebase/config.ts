import { initializeApp, getApps, getApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";

// `npm run local` sets this: everything runs on this computer, no real Firebase project needed.
const useEmulator = process.env.NEXT_PUBLIC_USE_EMULATOR === "true";

const firebaseConfig = useEmulator
  ? { apiKey: "demo-key", projectId: "demo-studyroom", storageBucket: "demo-studyroom.appspot.com", authDomain: "demo-studyroom.firebaseapp.com" }
  : {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

// Fail loudly: a silent fallback here once made uploads look successful when they were not.
// Real Firebase web API keys always start with "AIza"; anything else is a placeholder.
if (!useEmulator && (!firebaseConfig.apiKey?.startsWith("AIza") || !firebaseConfig.projectId || !firebaseConfig.storageBucket)) {
  throw new Error("Firebase env vars are missing. Copy .env.example to .env.local and fill in your Firebase project values, or run `npm run local`.");
}

const isFirstInit = getApps().length === 0;
const app = isFirstInit ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect only once: hot reload re-runs this module, and reconnecting throws.
if (useEmulator && isFirstInit) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
}
