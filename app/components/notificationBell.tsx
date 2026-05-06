"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFavorites } from "@/hooks/useComicStorage";
import type { PustakaItem } from "@/lib/api";

type NotificationItem = {
  id: string;
  slug: string;
  title: string;
  thumbnail: string;
  chapter: string;
  time: string;
};

function getSlug(detailUrl?: string) {
  return (detailUrl || "").replace("/detail-komik/", "").replace(/^\/+|\/+$/g, "");
}

function cleanChapter(item: PustakaItem) {
  const raw = item.latestChapter?.title || item.firstChapter?.title || "";
  return raw.replace(item.title || "", "").trim() || raw || "Ch. ?";
}

function updateTime(stats?: string) {
  const match = (stats || "").match(/\|\s*(.*?lalu)/i);
  return match ? match[1].replace(" lalu", "") : "";
}

function normalizeItems(input: unknown): PustakaItem[] {
  if (!Array.isArray(input)) return [];

  return input.filter((item): item is PustakaItem => {
    if (!item || typeof item !== "object") return false;
    const record = item as Partial<PustakaItem>;
    return typeof record.title === "string" && typeof record.detailUrl === "string";
  });
}

export default function NotificationBell() {
  const { favorites } = useFavorites();
  const [latest, setLatest] = useState<PustakaItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("tmkokomi-read-notifications") || "[]");
      if (Array.isArray(stored)) setReadIds(stored.filter((item) => typeof item === "string"));
    } catch {
      setReadIds([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const pages = await Promise.all([
          fetch("/api/pustaka?page=1").then((res) => (res.ok ? res.json() : null)),
          fetch("/api/pustaka?page=2").then((res) => (res.ok ? res.json() : null)),
        ]);

        if (!cancelled) {
          setLatest(pages.flatMap((page) => normalizeItems(page?.results)));
        }
      } catch {
        if (!cancelled) setLatest([]);
      }
    };

    load();
    const timer = window.setInterval(load, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const notifications = useMemo<NotificationItem[]>(() => {
    const favoriteSlugs = new Set(favorites.map((item) => item.slug));

    return latest
      .map((item) => {
        const slug = getSlug(item.detailUrl);
        if (!favoriteSlugs.has(slug)) return null;

        const chapter = cleanChapter(item);
        const id = `${slug}:${item.latestChapter?.url || chapter}`;

        return {
          id,
          slug,
          title: item.title,
          thumbnail: item.thumbnail,
          chapter,
          time: updateTime(item.stats),
        };
      })
      .filter(Boolean)
      .slice(0, 8) as NotificationItem[];
  }, [favorites, latest]);

  const unreadCount = notifications.filter((item) => !readIds.includes(item.id)).length;

  const markAsRead = () => {
    const next = Array.from(new Set([...readIds, ...notifications.map((item) => item.id)]));
    setReadIds(next);
    localStorage.setItem("tmkokomi-read-notifications", JSON.stringify(next));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-10 w-10 items-center justify-center rounded-md transition-colors"
        style={{ color: 'var(--text-primary)' }}
        aria-label="Notifications"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6v-5a7 7 0 0 0-5.25-6.78V3a1.75 1.75 0 0 0-3.5 0v1.22A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2Z" />
        </svg>
        {unreadCount > 0 ? (
          <span
            className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-black"
            style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute right-0 top-12 z-50 w-[min(440px,calc(100vw-2rem))] rounded-lg p-5 shadow-float"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Notifications
            </h2>
            <button
              type="button"
              onClick={markAsRead}
              className="text-xs font-bold uppercase tracking-wide"
              style={{ color: 'var(--text-secondary)' }}
            >
              Mark as read
            </button>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2 rounded-md p-2" style={{ background: 'var(--bg-primary)' }}>
            <button className="h-12 rounded-md text-sm font-black uppercase" style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}>
              Comic
            </button>
            <button className="h-12 rounded-md text-sm font-black uppercase" style={{ color: 'var(--text-secondary)' }}>
              Community
            </button>
          </div>

          {notifications.length ? (
            <div className="max-h-[60dvh] space-y-4 overflow-y-auto pr-1">
              {notifications.map((item) => (
                <Link key={item.id} href={`/komik/${item.slug}`} className="grid grid-cols-[76px_1fr] gap-3">
                  <div className="h-28 overflow-hidden rounded-md" style={{ background: 'var(--bg-raised)' }}>
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                    ) : null}
                  </div>
                  <div className="min-w-0 py-1">
                    <p className="mb-1 font-mono text-sm uppercase" style={{ color: 'var(--text-secondary)' }}>
                      {item.chapter}
                    </p>
                    <h3 className="line-clamp-2 text-sm font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
                      {item.title}
                    </h3>
                    <p className="mt-6 font-mono text-sm" style={{ color: 'var(--text-tertiary)' }}>
                      {item.time || "Updated"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed px-4 py-10 text-center text-sm" style={{ borderColor: 'var(--border-strong)', color: 'var(--text-tertiary)' }}>
              Favorite comic updates will show up here.
            </div>
          )}

          <Link
            href="/favorites"
            className="mt-5 flex h-12 items-center justify-center rounded-md text-sm font-black uppercase tracking-wide"
            style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}
          >
            View favorites
          </Link>
        </div>
      ) : null}
    </div>
  );
}
