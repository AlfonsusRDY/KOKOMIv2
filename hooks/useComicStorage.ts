"use client";

import { useState, useEffect } from "react";

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
  timestamp: number;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("komiku-favorites");
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const addFavorite = (item: FavItem) => {
    setFavorites((prev) => {
      if (prev.find((f) => f.slug === item.slug)) return prev;
      const next = [...prev, item];
      localStorage.setItem("komiku-favorites", JSON.stringify(next));
      return next;
    });
  };

  const removeFavorite = (slug: string) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.slug !== slug);
      localStorage.setItem("komiku-favorites", JSON.stringify(next));
      return next;
    });
  };

  const isFavorite = (slug: string) => favorites.some((f) => f.slug === slug);

  return { favorites, addFavorite, removeFavorite, isFavorite };
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("komiku-history");
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const addToHistory = (item: Omit<HistoryItem, "timestamp">) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.slug !== item.slug);
      next.unshift({ ...item, timestamp: Date.now() });
      const limited = next.slice(0, 100); // keep last 100
      localStorage.setItem("komiku-history", JSON.stringify(limited));
      return limited;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("komiku-history");
  };

  return { history, addToHistory, clearHistory };
}
