// ISR: cache home page for 5 minutes, revalidate in background
export const revalidate = 300;

import { Suspense } from "react";
import Link from "next/link";
import { getPopularComics, getLatestComics, KomikItem, TerbaruItem } from "@/lib/api";
import SearchBar from "./components/SearchBar";

// ── Skeleton components ───────────────────────────────────────────────────────

function LatestCardSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 animate-pulse">
      <div className="flex-shrink-0 w-16 h-20 sm:w-20 sm:h-28 rounded-xl bg-gray-200 dark:bg-gray-700" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    </div>
  );
}

function PopularRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800 animate-pulse">
      <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      <div className="w-8 h-10 rounded-md bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      </div>
    </div>
  );
}

// ── Real data components ──────────────────────────────────────────────────────

function LatestCard({ comic }: { comic: TerbaruItem }) {
  return (
    <Link
      href={`/komik/${comic.mangaSlug}`}
      className="group flex gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="relative flex-shrink-0 w-16 h-20 sm:w-20 sm:h-28 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={comic.thumbnail}
          alt={comic.title}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        {comic.isColored && (
          <span className="absolute top-1 left-1 text-[9px] font-bold bg-yellow-400 text-yellow-900 px-1 rounded">
            Color
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase">{comic.type}</span>
          <span className="text-[10px] text-gray-400">·</span>
          <span className="text-[10px] text-gray-400">{comic.genre}</span>
        </div>
        <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
          {comic.title}
        </h3>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
            {comic.latestChapterTitle}
          </span>
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">{comic.updateCountText}</span>
          <span className="text-xs text-gray-400">{comic.updateTime}</span>
        </div>
      </div>
      <div className="hidden sm:flex items-center text-gray-300 dark:text-gray-600 text-lg group-hover:text-blue-400 transition-colors">
        →
      </div>
    </Link>
  );
}

function PopularRow({ comic, rank }: { comic: KomikItem; rank: number }) {
  return (
    <Link
      href={`/komik/${comic.mangaSlug}`}
      className="group flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-2 px-2 rounded-lg transition"
    >
      <span
        className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg text-xs font-black ${rank <= 3
            ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-sm"
            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
          }`}
      >
        {rank}
      </span>
      <div className="flex-shrink-0 w-8 h-10 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={comic.thumbnail}
          alt={comic.title}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {comic.title}
        </p>
        <p className="text-[10px] text-gray-400">{comic.genre}</p>
      </div>
    </Link>
  );
}

// ── Async data sections (streamed individually) ───────────────────────────────

async function LatestSection() {
  const data = await getLatestComics().catch(() => [] as TerbaruItem[]);
  if (!data.length) return (
    <div className="py-10 text-center text-gray-400 text-sm">Gagal memuat data.</div>
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
    <p className="text-sm text-gray-400 text-center py-4">Gagal memuat data.</p>
  );
  return (
    <>
      {items.map((comic, i) => (
        <PopularRow key={comic.mangaSlug} comic={comic} rank={i + 1} />
      ))}
    </>
  );
}

// ── Page shell (renders instantly, streams data in) ───────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero — static, no data fetch */}
      <section className="bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-3 py-1 text-xs text-blue-300 font-medium mb-4">
            📚 Platform Baca Komik
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
            Baca Komik Favoritmu{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Kapan Saja
            </span>
          </h1>
          <p className="text-gray-400 mb-8 text-sm sm:text-base">
            Manga, manhwa, dan manhua terlengkap — gratis selamanya.
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left: Latest — streams independently */}
          <section className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                🕐 Update Terbaru
              </h2>
              <span className="text-xs text-gray-400">Terbaru di atas</span>
            </div>
            <Suspense
              fallback={
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <LatestCardSkeleton key={i} />
                  ))}
                </div>
              }
            >
              <LatestSection />
            </Suspense>
          </section>

          {/* Right: Popular — streams independently */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  🔥 Komik Populer
                </h2>
                <span className="text-xs text-gray-400">Top 10</span>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
                <Suspense
                  fallback={
                    <>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <PopularRowSkeleton key={i} />
                      ))}
                    </>
                  }
                >
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
