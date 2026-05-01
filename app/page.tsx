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
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      <div className="w-full aspect-[3/4] skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-3 skeleton rounded-md w-4/5" />
        <div className="h-3 skeleton rounded-md w-3/5" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-4 skeleton rounded-md w-16" />
          <div className="h-3 skeleton rounded-md w-10" />
        </div>
      </div>
    </div>
  );
}

function PopularRowSkeleton() {
  return (
    <div
      className="flex items-center gap-3 py-3"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="w-7 h-7 skeleton rounded-lg flex-shrink-0" />
      <div className="w-9 h-12 skeleton rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 skeleton rounded-md w-4/5" />
        <div className="h-2.5 skeleton rounded-md w-1/3" />
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
    <div className="min-h-screen">
      <HeroSection />
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Latest Updates */}
          <section className="flex-1 min-w-0">
            <SectionHeading titleKey="latestUpdates" subtitleKey="latestFirst" />
            <Suspense fallback={
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 20 }).map((_, i) => <LatestCardSkeleton key={i} />)}
              </div>
            }>
              <LatestSection />
            </Suspense>
          </section>

          {/* Popular sidebar */}
          <aside className="lg:w-68 xl:w-72 flex-shrink-0">
            <div className="sticky top-20">
              <SectionHeading titleKey="popularComics" subtitleKey="topTen" />
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="px-4 pt-2 pb-1">
                  <Suspense fallback={
                    <>{Array.from({ length: 6 }).map((_, i) => <PopularRowSkeleton key={i} />)}</>
                  }>
                    <PopularSection />
                  </Suspense>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
