"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { firebaseAuth, firestoreDb, getFirebaseAnalytics, isFirebaseConfigured } from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function saveProfile(user: User, displayName?: string, includeCreatedAt = false) {
  if (!firestoreDb) return;

  await setDoc(
    doc(firestoreDb, "users", user.uid),
    {
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.displayName || user.email?.split("@")[0] || "Reader",
      photoURL: user.photoURL || null,
      updatedAt: serverTimestamp(),
      ...(includeCreatedAt ? { createdAt: serverTimestamp() } : {}),
    },
    { merge: true }
  );
}

async function saveProfileSafely(user: User, displayName?: string, includeCreatedAt = false) {
  try {
    await saveProfile(user, displayName, includeCreatedAt);
  } catch (error) {
    console.warn("Firebase profile sync skipped. Check Firestore rules.", error);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFirebaseAnalytics().catch(console.error);

    if (!firebaseAuth) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(firebaseAuth, async (nextUser) => {
      setUser(nextUser);
      setLoading(false);
      if (nextUser) {
        await saveProfileSafely(nextUser);
      }
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!firebaseAuth) throw new Error("Firebase belum dikonfigurasi.");
    const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
    await saveProfileSafely(result.user);
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    if (!firebaseAuth) throw new Error("Firebase belum dikonfigurasi.");
    const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const name = displayName.trim() || email.split("@")[0];
    await updateProfile(result.user, { displayName: name });
    await saveProfileSafely(result.user, name, true);
  }, []);

  const logout = useCallback(async () => {
    if (!firebaseAuth) return;
    await signOut(firebaseAuth);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured: isFirebaseConfigured,
      signIn,
      signUp,
      logout,
    }),
    [user, loading, signIn, signUp, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
