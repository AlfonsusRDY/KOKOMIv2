// ISR: cache home page for 5 minutes
export const revalidate = 300;

import * as React from "react";
import { Suspense } from "react";
import { getPopularComics, getPustaka } from "@/lib/api";
import type { KomikItem } from "@/lib/api";
import HeroSection from "./components/heroSection";
import SectionHeading from "./components/sectionHeading";
import { PopularRow } from "./components/comicCards";
import LatestClient from "./latest/LatestClient";

// ── Skeleton components ───────────────────────────────────────────────────────

function LatestCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl overflow-hidden animate-pulse"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <div className="w-full aspect-[3/4]" style={{ backgroundColor: 'var(--bg-raised)' }} />
      <div className="p-3 space-y-3">
        <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'var(--bg-raised)' }} />
        <div className="h-3 rounded w-1/2" style={{ backgroundColor: 'var(--bg-raised)' }} />
        <div className="flex justify-between items-center mt-2">
          <div className="h-5 rounded w-16" style={{ backgroundColor: 'var(--bg-raised)' }} />
          <div className="h-3 rounded w-10" style={{ backgroundColor: 'var(--bg-raised)' }} />
        </div>
      </div>
    </div>
  );
}

function PopularRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 animate-pulse"
      style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="w-7 h-7 rounded-md flex-shrink-0" style={{ backgroundColor: 'var(--bg-raised)' }} />
      <div className="w-8 h-10 rounded flex-shrink-0" style={{ backgroundColor: 'var(--bg-raised)' }} />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 rounded w-4/5" style={{ backgroundColor: 'var(--bg-raised)' }} />
        <div className="h-2 rounded w-1/3" style={{ backgroundColor: 'var(--bg-raised)' }} />
      </div>
    </div>
  );
}

// ── Async data sections ───────────────────────────────────────────────────────

async function LatestSection() {
  const [data1, data2] = await Promise.all([
    getPustaka(1).catch(() => null),
    getPustaka(2).catch(() => null)
  ]);
  const items = [...(data1?.results || []), ...(data2?.results || [])];
  if (!items.length) return (
    <div className="py-10 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
      Failed to load data.
    </div>
  );
  return (
    <div className="flex flex-col gap-4">
      <LatestClient initialData={items} hideHeader />
    </div>
  );
}

async function PopularSection() {
  const data = await getPopularComics().catch(() => null);
  const items: KomikItem[] = data
    ? [
        ...data.manga.items,
        ...data.manhwa.items,
        ...data.manhua.items,
      ]
        .filter((c, i, arr) => arr.findIndex((x) => x.mangaSlug === c.mangaSlug) === i)
        .sort((a, b) => {
          const toNum = (s: string) => parseFloat(s.replace(/[^\d.]/g, "")) || 0;
          return toNum(b.readers) - toNum(a.readers);
        })
        .slice(0, 10)
    : [];

  if (!items.length) return (
    <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>
      Failed to load data.
    </p>
  );
  return (
    <>
      {items.map((comic, i) => (
        <PopularRow key={comic.mangaSlug} comic={comic} rank={i + 1} />
      ))}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <HeroSection />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Latest */}
          <section className="flex-1 min-w-0">
            <SectionHeading titleKey="latestUpdates" subtitleKey="latestFirst" />
            <Suspense fallback={
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
                {Array.from({ length: 20 }).map((_, i) => <LatestCardSkeleton key={i} />)}
              </div>
            }>
              <LatestSection />
            </Suspense>
          </section>

          {/* Popular sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="sticky top-20">
              <SectionHeading titleKey="popularComics" subtitleKey="topTen" />
              <div className="rounded-xl p-4"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <Suspense fallback={
                  <>{Array.from({ length: 5 }).map((_, i) => <PopularRowSkeleton key={i} />)}</>
                }>
                  <PopularSection />
                </Suspense>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
