"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { PustakaItem } from "@/lib/api";

function normalizeItems(input: unknown): PustakaItem[] {
  if (!Array.isArray(input)) return [];

  return input.filter((item): item is PustakaItem => {
    if (!item || typeof item !== "object") return false;
    const record = item as Partial<PustakaItem>;
    return typeof record.title === "string" && typeof record.detailUrl === "string";
  });
}

function getSlug(detailUrl?: string) {
  return (detailUrl || "").replace("/detail-komik/", "").replace(/^\/+|\/+$/g, "");
}

function cleanChapter(comic: PustakaItem) {
  const raw = comic.latestChapter?.title || comic.firstChapter?.title || "";
  return raw.replace(comic.title || "", "").trim() || raw || "Ch. ?";
}

function getUpdateTime(stats?: string) {
  const timeMatch = (stats || "").match(/\|\s*(.*?lalu)/i);
  return timeMatch ? timeMatch[1].replace(" lalu", "") : "";
}

async function fetchPustakaItems(apiPage: number): Promise<PustakaItem[]> {
  try {
    const res = await fetch(`/api/pustaka?page=${apiPage}`);
    if (!res.ok) return [];
    const data = await res.json();
    return normalizeItems(data?.results);
  } catch {
    return [];
  }
}

async function discoverLastPage(): Promise<number> {
  const hasResults = async (appPage: number) => {
    const items = await fetchPustakaItems(appPage * 2 - 1);
    return items.length > 0;
  };

  let lo = 1;
  let hi = 256;
  if (!(await hasResults(hi))) {
    while (lo < hi) {
      const mid = Math.floor((lo + hi + 1) / 2);
      if (await hasResults(mid)) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  }
  return hi;
}

function hotScore(item: PustakaItem) {
  const stats = item.stats || "";
  const isColored = stats.toLowerCase().includes("berwarna") ? 100 : 0;
  const typeBoost = item.type?.toLowerCase().includes("manhwa") ? 20 : 0;
  return isColored + typeBoost + item.title.length;
}

export default function LatestClient({
  initialData,
  hideHeader,
  showModeTabs = false,
  sectionTitle,
}: {
  initialData: PustakaItem[];
  hideHeader?: boolean;
  showModeTabs?: boolean;
  sectionTitle?: string;
}) {
  const [items, setItems] = useState<PustakaItem[]>(() => normalizeItems(initialData));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastPage, setLastPage] = useState<number | null>(null);
  const [mode, setMode] = useState<"hot" | "new">("new");
  const displayItems = mode === "hot" ? [...items].sort((a, b) => hotScore(b) - hotScore(a)) : items;

  useEffect(() => {
    discoverLastPage().then((n) => setLastPage(n));
  }, []);

  const goToPage = async (newPage: number) => {
    if (loading || newPage < 1) return;
    setLoading(true);

    try {
      const apiPage1 = newPage * 2 - 1;
      const apiPage2 = newPage * 2;
      const [items1, items2] = await Promise.all([
        fetchPustakaItems(apiPage1),
        fetchPustakaItems(apiPage2),
      ]);

      if (!items1.length) {
        setLastPage(newPage - 1);
        setHasMore(false);
        return;
      }

      const seen = new Set<string>();
      const nextItems = [...items1, ...items2].filter((item) => {
        const key = getSlug(item.detailUrl) || item.title;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setItems(nextItems);
      setPage(newPage);
      setHasMore(items2.length > 0);
      setLastPage(items2.length > 0 ? lastPage : newPage);
    } catch (error) {
      console.error(error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const renderPageNumbers = () => {
    const delta = 1;
    const pageSet = new Set<number>();

    pageSet.add(1);
    if (lastPage) pageSet.add(lastPage);

    const winStart = Math.max(2, page - delta);
    const winEnd = lastPage ? Math.min(lastPage - 1, page + delta) : page + delta;
    for (let i = winStart; i <= winEnd; i++) pageSet.add(i);

    const sorted = Array.from(pageSet).sort((a, b) => a - b);
    const result: React.ReactNode[] = [];
    let prev = 0;

    const pageBtn = (p: number) => (
      <button
        key={p}
        onClick={() => goToPage(p)}
        disabled={loading || p === page}
        className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold transition-all duration-150 disabled:cursor-default"
        style={{
          background: p === page ? 'var(--accent)' : 'var(--bg-surface)',
          color: p === page ? '#111113' : 'var(--text-secondary)',
          border: `1px solid ${p === page ? 'var(--accent)' : 'var(--border-strong)'}`,
          opacity: loading && p !== page ? 0.4 : 1,
        }}
      >
        {p}
      </button>
    );

    for (const p of sorted) {
      if (p - prev > 1) {
        result.push(
          <span key={`dots-${p}`} className="flex h-9 w-9 select-none items-center justify-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
            ...
          </span>
        );
      }
      result.push(pageBtn(p));
      prev = p;
    }

    if (!lastPage && hasMore) {
      result.push(
        <span key="dots-end" className="flex h-9 w-9 select-none items-center justify-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
          ...
        </span>
      );
    }

    return result;
  };

  const modeTabs = showModeTabs ? (
    <div className="flex items-center gap-2">
      {(["hot", "new"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setMode(value)}
          className="rounded-md px-4 py-3 text-xs font-bold uppercase transition-opacity"
          style={{
            background: mode === value ? 'var(--accent)' : 'var(--bg-raised)',
            color: mode === value ? '#111113' : 'var(--text-primary)',
          }}
        >
          {value}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <div className={hideHeader ? "w-full" : "mx-auto max-w-[1728px] px-4 py-10 sm:px-8 lg:px-12"}>
      {!hideHeader && (
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              All Latest Updates
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Newest manga, manhwa, and manhua.
            </p>
          </div>
          <div
            className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold sm:flex"
            style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
            Page {page}
          </div>
        </div>
      )}

      {sectionTitle || modeTabs ? (
        <div className="mb-6 flex items-center justify-between gap-4">
          {sectionTitle ? (
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {sectionTitle}
            </h2>
          ) : (
            <span />
          )}
          {modeTabs}
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[3/4] w-full rounded-md skeleton" />
              <div className="space-y-2 pt-3">
                <div className="h-3 w-4/5 rounded-md skeleton" />
                <div className="h-3 w-3/5 rounded-md skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {displayItems.slice(0, 20).map((comic, index) => {
            const slug = getSlug(comic.detailUrl);
            if (!slug) return null;

            const isColored = (comic.stats || "").toLowerCase().includes("berwarna");
            const updateTime = getUpdateTime(comic.stats);
            const chapter = cleanChapter(comic);

            return (
              <Link
                key={`${slug}-${comic.latestChapter?.url || index}`}
                href={`/komik/${slug}`}
                className="group block min-w-0"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md" style={{ background: 'var(--bg-raised)' }}>
                  {comic.thumbnail ? (
                    <img
                      src={comic.thumbnail}
                      alt={comic.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                      No cover
                    </div>
                  )}
                  {isColored && (
                    <span className="absolute left-2 top-2 rounded-md px-2 py-0.5 text-[9px] font-bold text-white" style={{ background: 'var(--accent)' }}>
                      COLOR
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 font-mono text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  <span className="truncate">{chapter}</span>
                  <span className="shrink-0">{updateTime}</span>
                </div>
                <h3 className="mt-2 line-clamp-2 text-center text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                  {comic.title}
                </h3>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => goToPage(page - 1)}
          disabled={loading || page === 1}
          className="flex h-9 items-center gap-1.5 rounded-md px-4 text-sm font-semibold transition-all duration-150 disabled:opacity-40"
          style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)' }}
        >
          Prev
        </button>

        {renderPageNumbers()}

        <button
          onClick={() => goToPage(page + 1)}
          disabled={loading || !hasMore || page === lastPage}
          className="flex h-9 items-center gap-1.5 rounded-md px-4 text-sm font-semibold transition-all duration-150 disabled:opacity-40"
          style={{ background: 'var(--accent)', color: '#111113' }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
