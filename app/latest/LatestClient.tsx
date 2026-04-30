"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { PustakaItem } from "@/lib/api";

export default function LatestClient({ initialData, hideHeader }: { initialData: PustakaItem[], hideHeader?: boolean }) {
  const [items, setItems] = useState<PustakaItem[]>(initialData);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

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
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = page + 2;
    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          disabled={loading || i === page}
          className="w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all hover:opacity-80 disabled:hover:opacity-100"
          style={{ 
            backgroundColor: i === page ? 'var(--accent)' : 'var(--bg-raised)', 
            color: i === page ? '#fff' : 'var(--text-primary)',
            opacity: (loading && i !== page) ? 0.5 : 1
          }}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className={hideHeader ? "w-full" : "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10"}>
      {!hideHeader && (
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              All Latest Updates
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Discover the newest manga, manhwa, and manhua added to our collection.
            </p>
          </div>
          <div className="hidden sm:block text-sm font-semibold px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-raised)', color: 'var(--accent)' }}>
            Page {page}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 animate-pulse">
          {Array.from({ length: 20 }).map((_, i) => (
             <div key={i} className="flex flex-col rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
               <div className="w-full aspect-[3/4]" style={{ backgroundColor: 'var(--bg-raised)' }} />
               <div className="p-3 space-y-3"><div className="h-4 rounded w-3/4" style={{ backgroundColor: 'var(--bg-raised)' }} /><div className="h-3 rounded w-1/2" style={{ backgroundColor: 'var(--bg-raised)' }} /></div>
             </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
          {items.slice(0, 20).map((comic: PustakaItem) => {
            const slug = comic.detailUrl.replace('/detail-komik/', '');
            const isColored = comic.stats.toLowerCase().includes("berwarna");
            const timeMatch = comic.stats.match(/\|\s*(.*?lalu)/i);
            const updateTime = timeMatch ? timeMatch[1].replace(' lalu', '') : '';

            return (
              <Link
                key={slug + Math.random()}
                href={`/komik/${slug}`}
                className="group flex flex-col rounded-xl overflow-hidden transition-transform duration-200 hover:-translate-y-1"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              >
                <div className="relative w-full aspect-[3/4] overflow-hidden" style={{ backgroundColor: 'var(--bg-raised)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={comic.thumbnail} alt={comic.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async" />
                  {isColored && <span className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm" style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>COLOR</span>}
                  <div className="absolute bottom-0 left-0 right-0 p-2 pt-6 bg-gradient-to-t from-black/80 to-transparent"><span className="text-[10px] font-bold text-white uppercase">{comic.type}</span></div>
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="font-semibold line-clamp-2 text-sm leading-tight mb-2" style={{ color: 'var(--text-primary)' }}>{comic.title}</h3>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs px-2 py-0.5 rounded font-medium truncate max-w-[60%]" style={{ backgroundColor: 'var(--bg-raised)', color: 'var(--accent)' }}>
                      {comic.latestChapter.title.replace(comic.title, '').trim() || comic.latestChapter.title}
                    </span>
                    <span className="text-[10px] whitespace-nowrap ml-2" style={{ color: 'var(--text-secondary)' }}>{updateTime}</span>
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
          className="px-4 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-opacity disabled:opacity-50"
          style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        >
          &larr; Prev
        </button>

        {renderPageNumbers()}

        <button
          onClick={() => goToPage(page + 1)}
          disabled={loading || !hasMore}
          className="px-4 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-opacity disabled:opacity-50"
          style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
}
