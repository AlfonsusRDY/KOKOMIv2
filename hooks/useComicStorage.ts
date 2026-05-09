"use client";

import { useCallback, useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { useAuth } from "@/app/components/authProvider";
import { firestoreDb } from "@/lib/firebase";
import type { SourceId } from "@/types/source.types";

export interface FavItem {
  slug: string;
  title: string;
  thumbnail: string;
  type: string;
}

export interface HistoryItem {
  slug: string;
  title: string;
  thumbnail: string;
  lastChapter: string;
  lastImageIndex: number;
  totalImages: number;
  progress: number;
  timestamp: number;
  sourceId?: SourceId;
  sourceName?: string;
}

type HistoryInput = Omit<HistoryItem, "timestamp">;

const FAVORITES_KEY = "komiku-favorites";
const HISTORY_KEY = "komiku-history";

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  const stored = localStorage.getItem(key);
  if (!stored) return fallback;

  try {
    return JSON.parse(stored) as T;
  } catch (error) {
    console.error(error);
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function warnFirestoreFallback(error: unknown) {
  console.warn("Firestore sync unavailable. Using local storage fallback.", error);
}

function normalizeHistory(item: Partial<HistoryItem> & Pick<HistoryItem, "slug" | "title" | "thumbnail" | "lastChapter">): HistoryItem {
  const totalImages = Math.max(0, Number(item.totalImages || 0));
  const lastImageIndex = Math.max(0, Number(item.lastImageIndex || 0));
  const progress =
    typeof item.progress === "number"
      ? item.progress
      : totalImages > 0
        ? Math.round(((lastImageIndex + 1) / totalImages) * 100)
        : 0;

  return {
    slug: item.slug,
    title: item.title,
    thumbnail: item.thumbnail,
    lastChapter: item.lastChapter,
    lastImageIndex,
    totalImages,
    progress: Math.min(100, Math.max(0, progress)),
    timestamp: Number(item.timestamp || Date.now()),
    sourceId: item.sourceId,
    sourceName: item.sourceName,
  };
}

function mergeHistoryWithLocal(remoteHistory: HistoryItem[]) {
  const merged = new Map<string, HistoryItem>();

  readLocal<HistoryItem[]>(HISTORY_KEY, [])
    .map(normalizeHistory)
    .forEach((item) => merged.set(item.slug, item));

  remoteHistory.forEach((item) => {
    const existing = merged.get(item.slug);
    if (existing && existing.timestamp > item.timestamp) return;
    merged.set(item.slug, item);
  });

  return [...merged.values()].sort((a, b) => b.timestamp - a.timestamp).slice(0, 100);
}

async function migrateLocalData(uid: string) {
  if (!firestoreDb || typeof window === "undefined") return;

  const db = firestoreDb;
  const migrateKey = `tmkokomi-firestore-migrated-${uid}`;
  if (localStorage.getItem(migrateKey)) return;

  const favorites = readLocal<FavItem[]>(FAVORITES_KEY, []);
  const history = readLocal<HistoryItem[]>(HISTORY_KEY, []);
  const batch = writeBatch(db);

  favorites.forEach((item) => {
    batch.set(doc(db, "users", uid, "favorites", item.slug), item, { merge: true });
  });

  history.forEach((item) => {
    const normalized = normalizeHistory(item);
    batch.set(doc(db, "users", uid, "history", normalized.slug), normalized, { merge: true });
  });

  if (favorites.length || history.length) {
    await batch.commit();
  }

  localStorage.setItem(migrateKey, "1");
}

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavItem[]>([]);

  useEffect(() => {
    if (!user || !firestoreDb) {
      setFavorites(readLocal<FavItem[]>(FAVORITES_KEY, []));
      return;
    }

    migrateLocalData(user.uid).catch(warnFirestoreFallback);

    return onSnapshot(
      collection(firestoreDb, "users", user.uid, "favorites"),
      (snapshot) => {
        const next = snapshot.docs.map((entry) => entry.data() as FavItem);
        setFavorites(next);
        writeLocal(FAVORITES_KEY, next);
      },
      (error) => {
        warnFirestoreFallback(error);
        setFavorites(readLocal<FavItem[]>(FAVORITES_KEY, []));
      }
    );
  }, [user]);

  const addFavorite = useCallback(
    (item: FavItem) => {
      setFavorites((prev) => {
        if (prev.find((f) => f.slug === item.slug)) return prev;
        const next = [...prev, item];
        writeLocal(FAVORITES_KEY, next);
        return next;
      });

      if (user && firestoreDb) {
        setDoc(doc(firestoreDb, "users", user.uid, "favorites", item.slug), item, { merge: true }).catch(warnFirestoreFallback);
      }
    },
    [user]
  );

  const removeFavorite = useCallback(
    (slug: string) => {
      setFavorites((prev) => {
        const next = prev.filter((f) => f.slug !== slug);
        writeLocal(FAVORITES_KEY, next);
        return next;
      });

      if (user && firestoreDb) {
        deleteDoc(doc(firestoreDb, "users", user.uid, "favorites", slug)).catch(warnFirestoreFallback);
      }
    },
    [user]
  );

  const isFavorite = useCallback((slug: string) => favorites.some((f) => f.slug === slug), [favorites]);

  return { favorites, addFavorite, removeFavorite, isFavorite };
}

export function useHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!user || !firestoreDb) {
      setHistory(readLocal<HistoryItem[]>(HISTORY_KEY, []).map(normalizeHistory));
      return;
    }

    migrateLocalData(user.uid).catch(warnFirestoreFallback);

    const historyQuery = query(collection(firestoreDb, "users", user.uid, "history"), orderBy("timestamp", "desc"));
    return onSnapshot(
      historyQuery,
      (snapshot) => {
        const remoteHistory = snapshot.docs.map((entry) => normalizeHistory(entry.data() as HistoryItem));
        const next = mergeHistoryWithLocal(remoteHistory);
        setHistory(next);
        writeLocal(HISTORY_KEY, next);
      },
      (error) => {
        warnFirestoreFallback(error);
        setHistory(readLocal<HistoryItem[]>(HISTORY_KEY, []).map(normalizeHistory));
      }
    );
  }, [user]);

  const addToHistory = useCallback(
    (item: HistoryInput) => {
      const nextItem = normalizeHistory({ ...item, timestamp: Date.now() });

      setHistory((prev) => {
        const next = prev.filter((h) => h.slug !== nextItem.slug);
        next.unshift(nextItem);
        const limited = next.slice(0, 100);
        writeLocal(HISTORY_KEY, limited);
        return limited;
      });

      if (user && firestoreDb) {
        setDoc(doc(firestoreDb, "users", user.uid, "history", nextItem.slug), nextItem, { merge: true }).catch(warnFirestoreFallback);
      }
    },
    [user]
  );

  const clearHistory = useCallback(async () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);

    if (!user || !firestoreDb) {
      return;
    }

    try {
      const snapshot = await getDocs(collection(firestoreDb, "users", user.uid, "history"));
      const batch = writeBatch(firestoreDb);
      snapshot.docs.forEach((entry) => batch.delete(entry.ref));
      await batch.commit();
    } catch (error) {
      warnFirestoreFallback(error);
    }
  }, [user]);

  return { history, addToHistory, clearHistory };
}
