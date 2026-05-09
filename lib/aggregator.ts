/**
 * Multi-Source Aggregator — Orchestrator
 *
 * Calls all sources in parallel (Promise.allSettled + timeouts),
 * merges and deduplicates results using lib/titleMap.ts,
 * and provides a race-based chapter image resolver.
 *
 * Pre-computed matching = 0ms cost at user request time.
 */

import {
  UnifiedComic,
  UnifiedChapter,
  UnifiedChapterImages,
  MultiSourceChapter,
  RaceResult,
  SourceId,
} from '../types/source.types';
import { getComicDetail, getChapterImages, getPustaka, searchComics } from './api';
import type { PustakaItem, SearchItem, SearchResult } from './api';
import {
  kiryuuGetDetail,
  kiryuuGetLatest,
  kiryuuGetPopular,
  kiryuuGetChapterImages,
} from '../services/kiryuu.service';
import {
  mintGetDetail,
  mintGetLatest,
  mintSearch,
  mintGetChapterImages,
} from '../services/mangamint.service';
import { normalizeTitle, slugsMatch, getOverrideSlug, normalizeChapterNum, chaptersAreSimilar } from './titleMap';
import type { DetailKomikResponse } from './api';

export type AggregatedSearchItem = SearchItem & {
  sources?: SourceId[];
  sourceIds?: Partial<Record<SourceId, string>>;
};

export type AggregatedSearchResult = Omit<SearchResult, 'data'> & {
  data: AggregatedSearchItem[];
};

export type AggregatedPustakaItem = PustakaItem & {
  sources?: SourceId[];
  sourceIds?: Partial<Record<SourceId, string>>;
};

// ─── Timeout Helper ───────────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms)
    ),
  ]);
}

// ─── Komiku → Unified Converters ──────────────────────────────────────────────

function komikuDetailToComic(detail: DetailKomikResponse, slug: string): UnifiedComic {
  return {
    title: detail.title,
    slug,
    thumbnail: detail.thumbnail,
    description: detail.sinopsis || detail.description,
    genres: detail.genres ?? [],
    status: detail.info?.Status ?? detail.info?.status ?? 'Unknown',
    author: detail.info?.Author ?? detail.info?.Pengarang ?? undefined,
    type: detail.info?.Tipe ?? detail.info?.Type ?? undefined,
    sources: ['komiku'],
    sourceIds: { komiku: slug },
  };
}

function komikuChaptersToUnified(detail: DetailKomikResponse, slug: string): UnifiedChapter[] {
  return detail.chapters.map((ch) => {
    const dateMs = ch.date ? new Date(ch.date).getTime() || 0 : 0;
    return {
      chapterNumber: ch.chapterNumber,
      title: ch.title,
      date: ch.date,
      dateMs,
      sourceId: 'komiku' as SourceId,
      sourceName: 'Komiku',
      sourceChapterId: ch.chapterNumber,
      sourceSlug: slug,
      views: ch.views,
    };
  });
}

// ─── Asura Fetch (via internal API route) ────────────────────────────────────

const APP_BASE =
  process.env.NODE_ENV === 'development' && process.env.PORT
    ? `http://localhost:${process.env.PORT}`
    : process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

async function asuraDetail(mangaId: string) {
  const res = await fetch(
    `${APP_BASE}/api/asura?action=detail&id=${encodeURIComponent(mangaId)}`,
    { next: { revalidate: 600 } }
  );
  if (!res.ok) throw new Error(`Asura detail ${res.status}`);
  return res.json();
}

async function asuraChapter(chapterId: string) {
  const res = await fetch(
    `${APP_BASE}/api/asura?action=chapter&id=${encodeURIComponent(chapterId)}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error(`Asura chapter ${res.status}`);
  return res.json() as Promise<Array<{ page: number; src: string; alt: string }>>;
}

async function asuraSearch(query: string, page = 1) {
  const res = await fetch(
    `${APP_BASE}/api/asura?action=search&q=${encodeURIComponent(query)}&page=${page}`,
    { next: { revalidate: 120 } }
  );
  if (!res.ok) throw new Error(`Asura search ${res.status}`);
  return res.json() as Promise<{
    results?: Array<{
      id: string;
      title: string;
      image?: string;
      status?: string;
      latestChapter?: string;
    }>;
  }>;
}

async function asuraLatest(page = 1) {
  const res = await fetch(
    `${APP_BASE}/api/asura?action=latest&page=${page}`,
    { next: { revalidate: 120 } }
  );
  if (!res.ok) throw new Error(`Asura latest ${res.status}`);
  return res.json() as Promise<{
    results?: Array<{
      id: string;
      title: string;
      image?: string;
      latestChapter?: string;
    }>;
  }>;
}

function asuraDetailToChapters(data: any, mangaId: string): UnifiedChapter[] {
  if (!Array.isArray(data?.chapters)) return [];
  return data.chapters.map((ch: any): UnifiedChapter => ({
    chapterNumber: String(ch.id ?? ''),
    title: ch.title ?? `Chapter ${ch.id}`,
    date: ch.releaseDate ?? '',
    dateMs: 0,
    sourceId: 'asura',
    sourceName: 'Asura Scans',
    sourceChapterId: `${mangaId}/chapter/${ch.id}`,
    sourceSlug: mangaId,
  }));
}

// ─── Chapter Grouping ─────────────────────────────────────────────────────────

/**
 * Merge chapters from multiple sources into grouped MultiSourceChapter[].
 *
 * Groups by NORMALIZED chapter number — so "121", "121.0", "Ch.121",
 * "Chapter 121" all become the same group. Uses similarity matching
 * (within 0.1 delta) to catch minor version differences.
 *
 * Canonical key = normalizeChapterNum of the first entry seen.
 */
function mergeChapters(
  allChapters: UnifiedChapter[]
): MultiSourceChapter[] {
  // Map: normalized key → canonical display number + entries
  const groups = new Map<string, { canonical: string; entries: UnifiedChapter[] }>();

  for (const ch of allChapters) {
    const normKey = normalizeChapterNum(ch.chapterNumber);

    // Check if an existing group is similar enough (80% / within-0.1 match)
    let matchedKey: string | null = null;
    for (const existingKey of groups.keys()) {
      if (chaptersAreSimilar(normKey, existingKey)) {
        matchedKey = existingKey;
        break;
      }
    }

    if (matchedKey) {
      groups.get(matchedKey)!.entries.push(ch);
    } else {
      groups.set(normKey, { canonical: normKey, entries: [ch] });
    }
  }

  const result: MultiSourceChapter[] = [];
  for (const { canonical, entries } of groups.values()) {
    // Sort entries: most recently uploaded first; prefer sources with more data
    const sorted = [...entries].sort((a, b) => {
      if (b.dateMs !== a.dateMs) return b.dateMs - a.dateMs;
      // Tie-break: komiku first (most complete data)
      const order: Record<string, number> = { komiku: 0, asura: 1, kiryuu: 2, mangamint: 3 };
      return (order[a.sourceId] ?? 9) - (order[b.sourceId] ?? 9);
    });
    result.push({
      chapterNumber: canonical,
      entries: sorted,
      recommended: sorted[0],
    });
  }

  // Sort chapters: highest number first (newest)
  return result.sort((a, b) => parseFloat(b.chapterNumber) - parseFloat(a.chapterNumber));
}

function mergeSources(
  existingSources: SourceId[] | undefined,
  nextSources: SourceId[] | undefined
): SourceId[] {
  return Array.from(new Set([...(existingSources ?? []), ...(nextSources ?? [])]));
}

function mergeSourceIds(
  existingIds: Partial<Record<SourceId, string>> | undefined,
  nextIds: Partial<Record<SourceId, string>> | undefined
) {
  return { ...(existingIds ?? {}), ...(nextIds ?? {}) };
}

function mergeUnifiedComics(comics: UnifiedComic[]): UnifiedComic[] {
  const byTitle = new Map<string, UnifiedComic>();

  for (const comic of comics) {
    const key = normalizeTitle(comic.title);
    const existing = byTitle.get(key);

    if (!existing) {
      byTitle.set(key, { ...comic, sources: [...comic.sources], sourceIds: { ...comic.sourceIds } });
      continue;
    }

    existing.sources = mergeSources(existing.sources, comic.sources);
    existing.sourceIds = mergeSourceIds(existing.sourceIds, comic.sourceIds);
    existing.thumbnail ||= comic.thumbnail;
    existing.description ||= comic.description;
    existing.type ||= comic.type;
    existing.status = existing.status === 'Unknown' ? comic.status : existing.status;
    existing.genres = Array.from(new Set([...existing.genres, ...comic.genres]));
  }

  return Array.from(byTitle.values());
}

function komikuSearchToUnified(item: SearchItem): UnifiedComic {
  return {
    title: item.title,
    slug: item.slug,
    thumbnail: item.thumbnail,
    description: item.description,
    genres: item.genre ? [item.genre] : [],
    status: 'Unknown',
    type: item.type,
    sources: ['komiku'],
    sourceIds: { komiku: item.slug },
  };
}

function unifiedComicToSearchItem(comic: UnifiedComic): AggregatedSearchItem {
  return {
    title: comic.title,
    altTitle: null,
    slug: comic.slug,
    href: `/komik/${comic.slug}`,
    thumbnail: comic.thumbnail,
    type: comic.type ?? comic.status ?? 'Comic',
    genre: comic.genres.join(', '),
    description: comic.description,
    sources: comic.sources,
    sourceIds: comic.sourceIds,
  };
}

function komikuPustakaToLatest(item: PustakaItem): AggregatedPustakaItem {
  const slug = item.detailUrl.replace('/detail-komik/', '').replace(/^\/|\/$/g, '');
  return {
    ...item,
    sources: ['komiku'],
    sourceIds: slug ? { komiku: slug } : {},
  };
}

function unifiedComicToLatestItem(comic: UnifiedComic): AggregatedPustakaItem {
  const latest = comic.sourceIds.asura ? 'Latest chapter' : '';
  return {
    title: comic.title,
    thumbnail: comic.thumbnail,
    type: comic.type ?? '',
    genre: comic.genres.join(', '),
    url: `/komik/${comic.slug}`,
    detailUrl: `/detail-komik/${comic.slug}`,
    description: comic.description,
    stats: `${comic.sources.length} source${comic.sources.length === 1 ? '' : 's'}`,
    firstChapter: { title: latest, url: '' },
    latestChapter: { title: latest, url: '' },
    sources: comic.sources,
    sourceIds: comic.sourceIds,
  };
}

// ─── Source Matching ──────────────────────────────────────────────────────────

/**
 * Try to find the Asura manga ID for a given Komiku slug/title.
 * Returns null if no match.
 */
async function resolveAsuraId(slug: string, title: string): Promise<string | null> {
  // Tier 3: static override
  const override = getOverrideSlug(slug, 'asura');
  if (override) return override;

  // Tier 2: slug match directly
  try {
    const res = await fetch(
      `${APP_BASE}/api/asura?action=search&q=${encodeURIComponent(slug.replace(/-/g, ' '))}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const results: Array<{ id: string; title: string }> = data.results ?? [];

    // Tier 1: normalized title match
    const normTitle = normalizeTitle(title);
    const normSlug = normalizeTitle(slug);

    for (const r of results) {
      if (normalizeTitle(r.title) === normTitle) return r.id;
      if (slugsMatch(slug, r.id)) return r.id;
      if (normalizeTitle(r.id).includes(normSlug)) return r.id;
    }
  } catch {
    // ignore
  }

  return null;
}

async function resolveKiryuuId(slug: string, title: string): Promise<string | null> {
  const override = getOverrideSlug(slug, 'kiryuu');
  if (override) return override;
  // Kiryuu uses the same slugs as Komiku in most cases
  return slug;
}

async function resolveMangamintId(slug: string, title: string): Promise<string | null> {
  const override = getOverrideSlug(slug, 'mangamint');
  if (override) return override;
  return slug;
}

// ─── Main Public API ──────────────────────────────────────────────────────────

/**
 * Fetch comic detail from ALL sources in parallel.
 * Returns merged comic info + grouped multi-source chapter list.
 */
export async function getAggregatedComic(slug: string): Promise<{
  comic: UnifiedComic;
  chapters: MultiSourceChapter[];
}> {
  // Always fetch Komiku first (primary, most reliable)
  let komikuDetail: DetailKomikResponse | null = null;
  try {
    komikuDetail = await withTimeout(getComicDetail(slug), 5000);
  } catch {
    // Komiku failed — will try others
  }

  const title = komikuDetail?.title ?? slug;

  // Resolve source IDs in parallel
  const [asuraId, kiryuuId, mangamintId] = await Promise.all([
    withTimeout(resolveAsuraId(slug, title), 4000).catch(() => null),
    withTimeout(resolveKiryuuId(slug, title), 2000).catch(() => null),
    withTimeout(resolveMangamintId(slug, title), 2000).catch(() => null),
  ]);

  // Fetch all details in parallel
  const [asuraResult, kiryuuResult, mintResult] = await Promise.allSettled([
    asuraId ? withTimeout(asuraDetail(asuraId), 5000) : Promise.reject('no asura id'),
    kiryuuId ? withTimeout(kiryuuGetDetail(kiryuuId), 5000) : Promise.reject('no kiryuu id'),
    mangamintId ? withTimeout(mintGetDetail(mangamintId), 8000) : Promise.reject('no mint id'),
  ]);

  // Gather all chapters
  const allChapters: UnifiedChapter[] = [];

  if (komikuDetail) {
    allChapters.push(...komikuChaptersToUnified(komikuDetail, slug));
  }

  if (asuraResult.status === 'fulfilled' && asuraId) {
    allChapters.push(...asuraDetailToChapters(asuraResult.value, asuraId));
  }

  if (kiryuuResult.status === 'fulfilled' && kiryuuResult.value) {
    allChapters.push(...kiryuuResult.value.chapters);
  }

  if (mintResult.status === 'fulfilled' && mintResult.value) {
    allChapters.push(...mintResult.value.chapters);
  }

  // Build unified comic (prefer Komiku data, fill from others)
  const comic: UnifiedComic = komikuDetail
    ? komikuDetailToComic(komikuDetail, slug)
    : (kiryuuResult.status === 'fulfilled' && kiryuuResult.value?.comic)
    ? { ...kiryuuResult.value.comic, slug }
    : {
        title: slug,
        slug,
        thumbnail: '',
        description: '',
        genres: [],
        status: 'Unknown',
        sources: [],
        sourceIds: {},
      };

  // Tag which sources are present
  const activeSources: SourceId[] = [];
  if (komikuDetail) activeSources.push('komiku');
  if (asuraResult.status === 'fulfilled') activeSources.push('asura');
  if (kiryuuResult.status === 'fulfilled' && kiryuuResult.value) activeSources.push('kiryuu');
  if (mintResult.status === 'fulfilled' && mintResult.value) activeSources.push('mangamint');
  comic.sources = activeSources;
  if (asuraId) comic.sourceIds.asura = asuraId;
  if (kiryuuId) comic.sourceIds.kiryuu = kiryuuId;
  if (mangamintId) comic.sourceIds.mangamint = mangamintId;

  return { comic, chapters: mergeChapters(allChapters) };
}

/**
 * Race all sources for chapter images.
 *
 * TRUE RACE: uses Promise.any() so the response is returned the moment
 * the fastest source resolves — no waiting for slower sources.
 *
 * How it works:
 *   1. Fire all source fetchers simultaneously (concurrent calls)
 *   2. Promise.any() resolves as soon as ONE succeeds → winner returned
 *   3. Remaining promises continue in background (for source switcher)
 *   4. allStatus shows winner as 'resolved'; others as 'pending' until
 *      the client calls switchSource() to fetch them on demand
 */
export async function raceChapterImages(
  slug: string,
  chapterNumber: string,
  entries: UnifiedChapter[]
): Promise<RaceResult> {
  if (!entries.length) throw new Error('No source entries to race');

  const start = Date.now();

  // Build one promise per source — all fire immediately (concurrent)
  const fetches = entries.map(async (entry): Promise<UnifiedChapterImages> => {
    let result: UnifiedChapterImages | null = null;

    switch (entry.sourceId) {
      case 'komiku': {
        const data = await withTimeout(getChapterImages(slug, chapterNumber), 6000);
        result = {
          sourceId: 'komiku',
          sourceName: 'Komiku',
          images: data.images.map((img, i) => ({
            src: img.src,
            alt: img.alt,
            page: i + 1,
            fallbackSrc: img.fallbackSrc,
          })),
          resolvedInMs: Date.now() - start,
        };
        break;
      }
      case 'asura': {
        const pages = await withTimeout(asuraChapter(entry.sourceChapterId), 6000);
        result = {
          sourceId: 'asura',
          sourceName: 'Asura Scans',
          images: pages.map((p) => ({ ...p, fallbackSrc: p.src })),
          resolvedInMs: Date.now() - start,
        };
        break;
      }
      case 'kiryuu': {
        const r = await withTimeout(kiryuuGetChapterImages(entry.sourceChapterId), 6000);
        if (!r) throw new Error('Kiryuu returned null');
        result = r;
        break;
      }
      case 'mangamint': {
        const r = await withTimeout(mintGetChapterImages(entry.sourceChapterId), 8000);
        if (!r) throw new Error('MangaMint returned null');
        result = r;
        break;
      }
    }

    if (!result || !result.images.length) throw new Error(`${entry.sourceId}: empty images`);
    return result;
  });

  // ─── TRUE RACE: resolve on first success ─────────────────────────────────
  // Promise.any() = reject only when ALL reject, resolve on first fulfill.
  // This means the user gets images from whichever source answers first.
  const winner = await Promise.any(fetches).catch(() => {
    throw new Error('All sources failed to load chapter images');
  });

  // Build status: winner is marked resolved, others marked pending
  // (they continue loading in background; client uses switchSource() to access them)
  const allStatus: RaceResult['all'] = entries.map((entry) => {
    if (entry.sourceId === winner.sourceId) {
      return { sourceId: entry.sourceId, status: 'resolved', resolvedInMs: winner.resolvedInMs };
    }
    return { sourceId: entry.sourceId, status: 'pending' };
  });

  return { winner, all: allStatus };
}

/**
 * Search across Komiku, Asura, Kiryuu, and MangaMint.
 */
export async function getAggregatedSearch(
  query: string,
  page = 1
): Promise<AggregatedSearchResult> {
  const normalizedQuery = normalizeTitle(query);

  const [komikuRes, asuraRes, kiryuuLatestRes, kiryuuPopularRes, mintRes] =
    await Promise.allSettled([
      withTimeout(searchComics(query), 5000),
      withTimeout(asuraSearch(query, page), 6000),
      withTimeout(kiryuuGetLatest(), 5000),
      withTimeout(kiryuuGetPopular(), 5000),
      withTimeout(mintSearch(query), 8000),
    ]);

  const comics: UnifiedComic[] = [];

  if (komikuRes.status === 'fulfilled') {
    comics.push(...(komikuRes.value.data ?? []).map(komikuSearchToUnified));
  }

  if (asuraRes.status === 'fulfilled') {
    for (const item of asuraRes.value.results ?? []) {
      comics.push({
        title: item.title,
        slug: item.id,
        thumbnail: item.image ?? '',
        description: item.latestChapter ? `Latest chapter ${item.latestChapter}` : '',
        genres: [],
        status: item.status ?? 'Unknown',
        sources: ['asura'],
        sourceIds: { asura: item.id },
      });
    }
  }

  const addMatchingKiryuu = (items: UnifiedComic[]) => {
    comics.push(
      ...items.filter((comic) => normalizeTitle(comic.title).includes(normalizedQuery))
    );
  };

  if (kiryuuLatestRes.status === 'fulfilled') addMatchingKiryuu(kiryuuLatestRes.value);
  if (kiryuuPopularRes.status === 'fulfilled') addMatchingKiryuu(kiryuuPopularRes.value);
  if (mintRes.status === 'fulfilled') comics.push(...mintRes.value);

  const data = mergeUnifiedComics(comics).map(unifiedComicToSearchItem);

  return {
    status: true,
    message: data.length ? 'Success' : 'No results',
    keyword: query,
    url: `/search?q=${encodeURIComponent(query)}`,
    total: data.length,
    data,
  };
}

/**
 * Get aggregated latest updates across all sources.
 */
export async function getAggregatedLatest(page = 1): Promise<UnifiedComic[]> {
  const items = await getAggregatedLatestItems(page);

  return mergeUnifiedComics(
    items.map((item) => {
      const slug = item.detailUrl.replace('/detail-komik/', '').replace(/^\/|\/$/g, '');
      return {
        title: item.title,
        slug,
        thumbnail: item.thumbnail,
        description: item.description,
        genres: item.genre ? [item.genre] : [],
        status: 'Unknown',
        type: item.type,
        sources: item.sources ?? ['komiku'],
        sourceIds: item.sourceIds ?? (slug ? { komiku: slug } : {}),
      };
    })
  );
}

/**
 * Latest updates in the Pustaka shape used by the existing latest UI.
 */
export async function getAggregatedLatestItems(page = 1): Promise<AggregatedPustakaItem[]> {
  const [komikuRes, asuraRes, kiryuuRes, mintRes] = await Promise.allSettled([
    withTimeout(getPustaka(page), 5000),
    withTimeout(asuraLatest(page), 6000),
    page === 1 ? withTimeout(kiryuuGetLatest(), 5000) : Promise.resolve([]),
    withTimeout(mintGetLatest(page), 8000),
  ]);

  const byTitle = new Map<string, AggregatedPustakaItem>();

  const addItem = (item: AggregatedPustakaItem) => {
    const key = normalizeTitle(item.title);
    const existing = byTitle.get(key);

    if (!existing) {
      byTitle.set(key, {
        ...item,
        sources: [...(item.sources ?? [])],
        sourceIds: { ...(item.sourceIds ?? {}) },
      });
      return;
    }

    existing.sources = mergeSources(existing.sources, item.sources);
    existing.sourceIds = mergeSourceIds(existing.sourceIds, item.sourceIds);
    existing.thumbnail ||= item.thumbnail;
    existing.description ||= item.description;
    existing.genre ||= item.genre;
    existing.type ||= item.type;
    existing.stats = existing.stats || item.stats;
    if (!existing.latestChapter?.title && item.latestChapter?.title) {
      existing.latestChapter = item.latestChapter;
    }
    if (!existing.firstChapter?.title && item.firstChapter?.title) {
      existing.firstChapter = item.firstChapter;
    }
  };

  if (komikuRes.status === 'fulfilled') {
    for (const item of komikuRes.value.results ?? []) addItem(komikuPustakaToLatest(item));
  }

  if (asuraRes.status === 'fulfilled') {
    for (const item of asuraRes.value.results ?? []) {
      addItem(
        unifiedComicToLatestItem({
          title: item.title,
          slug: item.id,
          thumbnail: item.image ?? '',
          description: item.latestChapter ? `Latest chapter ${item.latestChapter}` : '',
          genres: [],
          status: 'Unknown',
          sources: ['asura'],
          sourceIds: { asura: item.id },
        })
      );
    }
  }

  if (kiryuuRes.status === 'fulfilled') {
    for (const comic of kiryuuRes.value) addItem(unifiedComicToLatestItem(comic));
  }

  if (mintRes.status === 'fulfilled') {
    for (const comic of mintRes.value) addItem(unifiedComicToLatestItem(comic));
  }

  return Array.from(byTitle.values());
}
