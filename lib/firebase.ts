import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import type { Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

export const firebaseApp: FirebaseApp | null = isFirebaseConfigured
  ? getApps()[0] ?? initializeApp(firebaseConfig)
  : null;

export const firebaseAuth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
export const firestoreDb: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;

let analyticsPromise: Promise<Analytics | null> | null = null;

export function getFirebaseAnalytics() {
  if (!firebaseApp || typeof window === "undefined") {
    return Promise.resolve(null);
  }

  analyticsPromise ??= import("firebase/analytics")
    .then(async ({ getAnalytics, isSupported }) => {
      if (!(await isSupported())) return null;
      return getAnalytics(firebaseApp);
    })
    .catch(() => null);

  return analyticsPromise;
}
