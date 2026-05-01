"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { PustakaItem } from "@/lib/api";

/** Binary-search to find the last valid app-page (each app-page = 2 API pages). */
async function discoverLastPage(): Promise<number> {
  const hasResults = async (appPage: number) => {
    try {
      const res = await fetch(`/api/pustaka?page=${appPage * 2 - 1}`);
      if (!res.ok) return false;
      const d = await res.json();
      return Array.isArray(d.results) && d.results.length > 0;
    } catch {
      return false;
    }
  };

  let lo = 1, hi = 256;
  // Clamp hi to actual existence
  if (!(await hasResults(hi))) {
    while (lo < hi) {
      const mid = Math.floor((lo + hi + 1) / 2);
      if (await hasResults(mid)) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  }
  return hi; // More than 256 pages — return 256 as lower bound
}

export default function LatestClient({ initialData, hideHeader }: { initialData: PustakaItem[], hideHeader?: boolean }) {
  const [items, setItems] = useState<PustakaItem[]>(initialData);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastPage, setLastPage] = useState<number | null>(null);

  // Discover total pages in the background on mount
  useEffect(() => {
    discoverLastPage().then(n => setLastPage(n));
  }, []);

  const goToPage = async (newPage: number) => {
    if (loading || newPage < 1) return;
    setLoading(true);
    try {
      const apiPage1 = newPage * 2 - 1;
      const apiPage2 = newPage * 2;
      
      // Start both requests concurrently
      const req1 = fetch(`/api/pustaka?page=${apiPage1}`);
      const req2 = fetch(`/api/pustaka?page=${apiPage2}`);
      
      // Wait for the first half to finish
      const res1 = await req1;
      if (!res1.ok) throw new Error("Failed to fetch");
      const data1 = await res1.json();
      
      if (data1.results && data1.results.length > 0) {
        // Update UI immediately with first 10 items
        setItems(data1.results);
        setPage(newPage);
        setHasMore(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // data1 empty means newPage doesn't exist — last page was newPage-1
        setLastPage(newPage - 1);
        setHasMore(false);
      }
      
      // Turn off loading so user can start reading immediately
      setLoading(false);
      
      // Wait for the second half in the background
      const res2 = await req2;
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2.results && data2.results.length > 0) {
          // Append the remaining 10 items seamlessly
          setItems((prev: PustakaItem[]) => {
            // Prevent duplicates if user clicked multiple times
            const newSlugs = new Set(data2.results.map((r: any) => r.detailUrl));
            const filteredPrev = prev.filter((p: PustakaItem) => !newSlugs.has(p.detailUrl));
            return [...filteredPrev, ...data2.results];
          });
          setHasMore(true);
        } else {
          // data2 empty means newPage is the last page
          setLastPage(newPage);
          setHasMore(false);
        }
      }
    } catch (e) {
      console.error(e);
      setHasMore(false);
      setLoading(false);
    }
  };

  const renderPageNumbers = () => {
    const delta = 1;
    const pageSet = new Set<number>();

    // Always include page 1
    pageSet.add(1);
    // Always include last page if known
    if (lastPage) pageSet.add(lastPage);
    // Include window around current page
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
        className="w-9 h-9 flex items-center justify-center rounded-xl font-semibold text-sm transition-all duration-150 disabled:cursor-default"
        style={{
          background: p === page ? 'var(--accent)' : 'var(--bg-surface)',
          color: p === page ? '#fff' : 'var(--text-secondary)',
          border: `1px solid ${p === page ? 'var(--accent)' : 'var(--border-strong)'}`,
          opacity: (loading && p !== page) ? 0.4 : 1,
        }}
      >
        {p}
      </button>
    );

    for (const p of sorted) {
      if (p - prev > 1) {
        result.push(
          <span key={`dots-${p}`} className="w-9 h-9 flex items-center justify-center text-sm select-none" style={{ color: 'var(--text-tertiary)' }}>
            ...
          </span>
        );
      }
      result.push(pageBtn(p));
      prev = p;
    }

    // Trailing ellipsis when we don't know the last page yet
    if (!lastPage && hasMore) {
      result.push(
        <span key="dots-end" className="w-9 h-9 flex items-center justify-center text-sm select-none" style={{ color: 'var(--text-tertiary)' }}>
          ...
        </span>
      );
    }

    return result;
  };

  return (
    <div className={hideHeader ? "w-full" : "max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-10"}>
      {!hideHeader && (
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              All Latest Updates
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Newest manga, manhwa, and manhua.
            </p>
          </div>
          <div
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
            Page {page}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex flex-col rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="w-full aspect-[3/4] skeleton" />
              <div className="p-3 space-y-2">
                <div className="h-3 skeleton rounded-md w-4/5" />
                <div className="h-3 skeleton rounded-md w-3/5" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.slice(0, 20).map((comic: PustakaItem) => {
            const slug = comic.detailUrl.replace('/detail-komik/', '');
            const isColored = comic.stats.toLowerCase().includes("berwarna");
            const timeMatch = comic.stats.match(/\|\s*(.*?lalu)/i);
            const updateTime = timeMatch ? timeMatch[1].replace(' lalu', '') : '';

            return (
              <Link
                key={slug + Math.random()}
                href={`/komik/${slug}`}
                className="group flex flex-col rounded-2xl overflow-hidden card-hover"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              >
                <div className="relative w-full aspect-[3/4] overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={comic.thumbnail} alt={comic.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]" loading="lazy" decoding="async" />
                  {isColored && (
                    <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-md text-white" style={{ background: 'var(--accent)' }}>COLOR</span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)' }}>
                    <span className="absolute bottom-2 left-2.5 text-[10px] font-bold tracking-widest uppercase text-white/80">{comic.type}</span>
                  </div>
                </div>
                <div className="p-3 flex flex-col gap-1.5">
                  <h3 className="font-semibold line-clamp-2 text-xs leading-snug" style={{ color: 'var(--text-primary)' }}>{comic.title}</h3>
                  <div className="flex items-center justify-between mt-auto pt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-medium truncate max-w-[62%]" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                      {comic.latestChapter.title.replace(comic.title, '').trim() || comic.latestChapter.title}
                    </span>
                    <span className="text-[10px] whitespace-nowrap ml-1.5" style={{ color: 'var(--text-tertiary)' }}>{updateTime}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-10 flex flex-wrap justify-center items-center gap-2">
        <button
          onClick={() => goToPage(page - 1)}
          disabled={loading || page === 1}
          className="px-4 h-9 flex items-center gap-1.5 rounded-xl font-semibold text-sm transition-all duration-150 disabled:opacity-40"
          style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)' }}
        >
          Prev
        </button>

        {renderPageNumbers()}

        <button
          onClick={() => goToPage(page + 1)}
          disabled={loading || !hasMore || page === lastPage}
          className="px-4 h-9 flex items-center gap-1.5 rounded-xl font-semibold text-sm transition-all duration-150 disabled:opacity-40"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
