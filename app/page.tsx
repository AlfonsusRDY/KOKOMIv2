export const revalidate = 300;

import * as React from "react";
import Link from "next/link";
import { Suspense } from "react";
import { getComicDetail, getPopularComics, getPustaka } from "@/lib/api";
import type { KomikItem, PustakaItem } from "@/lib/api";
import HomeFollowedChapters from "./components/homeFollowedChapters";
import HomeHistoryStrip from "./components/homeHistoryStrip";
import HomePosterCarousel from "./components/homePosterCarousel";
import OnboardingNoticeModal from "./components/onboardingNoticeModal";
import type { HomePosterItem } from "./components/homePosterCarousel";
import LatestClient from "./latest/LatestClient";

function getSlug(detailUrl?: string) {
  return (detailUrl || "").replace("/detail-komik/", "").replace(/^\/+|\/+$/g, "");
}

function cleanChapter(title?: string, comicTitle?: string) {
  const chapter = (title || "").replace(comicTitle || "", "").trim();
  return chapter || title || "Ch. ?";
}

function chapterNumberValue(chapter?: string) {
  const match = (chapter || "").match(/(?:chapter|ch\.?)?\s*(\d+(?:\.\d+)?)/i);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

function updateTime(stats?: string) {
  const match = (stats || "").match(/\|\s*(.*?lalu)/i);
  return match ? match[1].replace(" lalu", "") : "";
}

function relativeTimeMinutes(value?: string) {
  const text = (value || "").toLowerCase().trim();
  const amount = Number(text.match(/\d+/)?.[0] ?? 0);
  if (!amount) return Number.POSITIVE_INFINITY;

  if (text.includes("menit") || text.includes("minute") || text.includes("min")) return amount;
  if (text.includes("jam") || text.includes("hour")) return amount * 60;
  if (text.includes("hari") || text.includes("day")) return amount * 24 * 60;
  if (text.includes("minggu") || text.includes("week")) return amount * 7 * 24 * 60;
  if (text.includes("bulan") || text.includes("month")) return amount * 30 * 24 * 60;
  if (text.includes("tahun") || text.includes("year")) return amount * 365 * 24 * 60;
  return Number.POSITIVE_INFINITY;
}

function fromPustaka(item: PustakaItem): HomePosterItem | null {
  const slug = getSlug(item.detailUrl);
  if (!slug || !item.title) return null;

  return {
    title: item.title,
    slug,
    thumbnail: item.thumbnail || "",
    chapter: cleanChapter(item.latestChapter?.title, item.title),
    time: updateTime(item.stats),
    type: item.type,
  };
}

function fromPopular(item: KomikItem): HomePosterItem | null {
  if (!item.mangaSlug || !item.title) return null;

  return {
    title: item.title,
    slug: item.mangaSlug,
    thumbnail: item.thumbnail || "",
    chapter: item.latestChapter || `Ch. ${item.chapterNumber || "?"}`,
    time: item.readers,
    type: item.genre,
  };
}

function normalizeIdentity(value?: string) {
  return (value || "")
    .toLowerCase()
    .replace(/https?:\/\/[^/]+/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function identityKeys(item: HomePosterItem) {
  const title = normalizeIdentity(item.title);
  const titleWords: string[] = (item.title || "").toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const fuzzyTitle =
    titleWords.includes("became") && titleWords.includes("first") && titleWords.includes("prince")
      ? "fuzzy:becamefirstprince"
      : "";

  return [
    `slug:${normalizeIdentity(item.slug)}`,
    `title:${title}`,
    fuzzyTitle,
    item.thumbnail ? `thumb:${normalizeIdentity(item.thumbnail)}` : "",
  ].filter(Boolean);
}

function uniqueItems(items: HomePosterItem[]) {
  const seen = new Set<string>();
  const result: HomePosterItem[] = [];

  for (const item of items) {
    const keys = identityKeys(item);
    if (keys.some((key) => seen.has(key))) continue;

    keys.forEach((key) => seen.add(key));
    result.push(item);
  }

  return result;
}

function popularItems(data: Awaited<ReturnType<typeof getPopularComics>> | null) {
  if (!data) return [];

  const items = [
    ...data.manga.items,
    ...data.manhwa.items,
    ...data.manhua.items,
  ]
    .map(fromPopular)
    .filter(Boolean) as HomePosterItem[];

  return uniqueItems(items);
}

function fillToThirty(primary: HomePosterItem[], fallback: HomePosterItem[] = []) {
  return uniqueItems([...primary, ...fallback]).slice(0, 30);
}

function excludeItems(items: HomePosterItem[], excluded: HomePosterItem[]) {
  const blocked = new Set(excluded.flatMap(identityKeys));
  return items.filter((item) => identityKeys(item).every((key) => !blocked.has(key)));
}

function recentlyAddedItems(items: HomePosterItem[]) {
  const oneWeekMinutes = 7 * 24 * 60;

  return uniqueItems(
    items
      .filter((item) => chapterNumberValue(item.chapter) <= 4)
      .filter((item) => relativeTimeMinutes(item.time) <= oneWeekMinutes)
      .sort((a, b) => relativeTimeMinutes(a.time) - relativeTimeMinutes(b.time))
  ).slice(0, 30);
}

async function withDetailCovers(items: HomePosterItem[]) {
  const resolved = await Promise.all(
    items.map(async (item) => {
      try {
        const detail = await getComicDetail(item.slug);
        return detail.thumbnail ? { ...item, thumbnail: detail.thumbnail } : item;
      } catch {
        return item;
      }
    })
  );

  return uniqueItems(resolved);
}

function RecentlyAdded({ items }: { items: HomePosterItem[] }) {
  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <section
        className="lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto lg:pr-3"
        style={{ scrollbarColor: 'var(--bg-elevated) transparent' }}
      >
        <h2 className="mb-5 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Recently Added <span style={{ color: 'var(--text-secondary)' }}>/ Complete Series</span>
        </h2>
        <div className="space-y-5">
          {items.map((item) => (
            <Link key={`recent-${item.slug}`} href={`/komik/${item.slug}`} className="grid grid-cols-[76px_1fr] gap-3">
              <div className="h-28 overflow-hidden rounded-md" style={{ background: 'var(--bg-raised)' }}>
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
              </div>
              <div className="min-w-0 py-1">
                <p className="mb-1 font-mono text-xs uppercase" style={{ color: 'var(--text-secondary)' }}>
                  {item.type || "Comic"}
                </p>
                <h3 className="line-clamp-2 text-sm font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
                  {item.title}
                </h3>
                <div className="mt-6 flex items-center gap-5 font-mono text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  <span>{item.chapter}</span>
                  <span>{item.time}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </aside>
  );
}

async function HomeData() {
  const [pustakaPages, popular] = await Promise.all([
    Promise.all(
      Array.from({ length: 8 }, (_, index) => getPustaka(index + 1).catch(() => null))
    ),
    getPopularComics().catch(() => null),
  ]);

  const latestRaw = [...(pustakaPages[0]?.results || []), ...(pustakaPages[1]?.results || [])];
  const latest = latestRaw.map(fromPustaka).filter(Boolean) as HomePosterItem[];
  const latestFallbackRaw = pustakaPages
    .flatMap((page) => page?.results || [])
    .map(fromPustaka)
    .filter(Boolean) as HomePosterItem[];
  const [latestWithCovers, latestFallback, popularBase] = await Promise.all([
    withDetailCovers(latest),
    withDetailCovers(latestFallbackRaw),
    withDetailCovers(popularItems(popular)),
  ]);
  const latestCoverBySlug = new Map(latestWithCovers.map((item) => [item.slug, item.thumbnail]));
  const latestRawWithCovers = latestRaw.map((item) => {
    const slug = getSlug(item.detailUrl);
    const thumbnail = latestCoverBySlug.get(slug);
    return thumbnail ? { ...item, thumbnail } : item;
  });
  const popularList = fillToThirty(popularBase, excludeItems(latestFallback, latestWithCovers));
  const followsList = fillToThirty(excludeItems(latestFallback, [...popularList, ...latestWithCovers]));
  const recentlyAddedList = recentlyAddedItems(latestFallback);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_438px]">
      <main className="min-w-0 space-y-16">
        <HomeFollowedChapters latestItems={latestWithCovers} />
        <HomeHistoryStrip />
        <HomePosterCarousel title="Most Recent Popular" items={popularList} ranked />
        <HomePosterCarousel title="Most Follows New Comics" items={followsList} ranked />

        <LatestClient initialData={latestRawWithCovers} hideHeader showModeTabs sectionTitle="Latest Updates" initialMode="hot" />
      </main>

      <RecentlyAdded items={recentlyAddedList} />
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_438px]">
      <main className="space-y-16">
        {Array.from({ length: 4 }).map((_, section) => (
          <section key={section}>
            <div className="mb-6 h-8 w-72 rounded-md skeleton" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((__, item) => (
                <div key={item}>
                  <div className="aspect-[3/4] rounded-md skeleton" />
                  <div className="mx-auto mt-3 h-4 w-4/5 rounded-md skeleton" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
      <div className="hidden space-y-5 lg:block">
        {Array.from({ length: 8 }).map((_, item) => (
          <div key={item} className="grid grid-cols-[76px_1fr] gap-3">
            <div className="h-28 rounded-md skeleton" />
            <div className="space-y-3 py-2">
              <div className="h-3 w-16 rounded-md skeleton" />
              <div className="h-4 w-full rounded-md skeleton" />
              <div className="h-4 w-3/4 rounded-md skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <OnboardingNoticeModal />
      <div className="mx-auto max-w-[1728px] px-4 py-9 sm:px-8 lg:px-12">
        <Suspense fallback={<HomeSkeleton />}>
          <HomeData />
        </Suspense>
      </div>
    </div>
  );
}
