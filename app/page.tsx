// ISR: cache home page for 5 minutes
export const revalidate = 300;

import { Suspense } from "react";
import { getPopularComics, getLatestComics } from "@/lib/api";
import type { KomikItem, TerbaruItem } from "@/lib/api";
import HeroSection from "./components/heroSection";
import SectionHeading from "./components/sectionHeading";
import { LatestCard, PopularRow } from "./components/comicCards";

// ── Skeleton components ───────────────────────────────────────────────────────

function LatestCardSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-xl animate-pulse"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <div className="flex-shrink-0 w-16 h-20 sm:w-20 sm:h-28 rounded-lg"
        style={{ backgroundColor: 'var(--bg-raised)' }} />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-2.5 rounded w-1/4" style={{ backgroundColor: 'var(--bg-raised)' }} />
        <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'var(--bg-raised)' }} />
        <div className="h-3 rounded w-1/2" style={{ backgroundColor: 'var(--bg-raised)' }} />
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
  const data = await getLatestComics().catch(() => [] as TerbaruItem[]);
  if (!data.length) return (
    <div className="py-10 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
      Failed to load data.
    </div>
  );
  return (
    <div className="flex flex-col gap-3">
      {data.map((comic) => (
        <LatestCard key={comic.mangaSlug} comic={comic} />
      ))}
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
              <div className="flex flex-col gap-3">
                {Array.from({ length: 6 }).map((_, i) => <LatestCardSkeleton key={i} />)}
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
