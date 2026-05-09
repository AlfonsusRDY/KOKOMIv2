/**
 * Kiryuu API Service Adapter
 *
 * Wraps the Kiryuu REST API at KIRYUU_API_URL and normalizes
 * responses into the unified UnifiedChapter / UnifiedComic types.
 *
 * Extracted from lib/api.ts so api.ts stays Komiku-only.
 */

import type {
  SourceId,
  UnifiedComic,
  UnifiedChapter,
  UnifiedChapterImages,
} from '../types/source.types';

const SOURCE_ID: SourceId = 'kiryuu';
const BASE = process.env.KIRYUU_API_URL ?? 'http://45.76.148.33:8080/api/kiryuu/v6';

const HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'Dart/2.8 (dart:io)',
};

// ─── Raw Kiryuu Shapes ────────────────────────────────────────────────────────

interface KiryuuSummaryItem {
  title?: string;
  slug?: string;
  cover?: string;
  genres?: string[];
  rating?: string;
  last_chapter?: string;
}

interface KiryuuSummaryResponse {
  trending?: KiryuuSummaryItem[];
  popular?: KiryuuSummaryItem[];
  new_chapter?: KiryuuSummaryItem[];
  new_manga?: KiryuuSummaryItem[];
}

interface KiryuuDetailChapter {
  chapter?: string;
  slug?: string;
  date?: string;
}

interface KiryuuDetailResponse {
  title?: string;
  slug?: string;
  cover?: string;
  synopsis?: string;
  genres?: string[];
  status?: string;
  author?: string;
  type?: string;
  chapters?: KiryuuDetailChapter[];
}

interface KiryuuChapterResponse {
  title?: string;
  images?: string[];
}

// ─── Fetch Helper ─────────────────────────────────────────────────────────────

async function kiryuuFetch<T>(path: string, revalidate = 300): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate },
    headers: HEADERS,
  });
  if (!res.ok) throw new Error(`Kiryuu ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// ─── Normalizers ──────────────────────────────────────────────────────────────

function normalizeChapterNum(raw?: string): string {
  return (raw ?? '').replace(/^chapter\s*/i, '').trim() || '';
}

function summaryItemToComic(item: KiryuuSummaryItem): UnifiedComic | null {
  if (!item.title || !item.slug) return null;
  return {
    title: item.title,
    slug: item.slug,
    thumbnail: item.cover ?? '',
    description: item.rating ? `Rating ${item.rating}` : '',
    genres: item.genres ?? [],
    status: 'Unknown',
    sources: [SOURCE_ID],
    sourceIds: { kiryuu: item.slug },
  };
}

function uniqueBySlug<T extends { slug: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function kiryuuGetSummary(revalidate = 300): Promise<KiryuuSummaryResponse> {
  return kiryuuFetch<KiryuuSummaryResponse>('/summary', revalidate);
}

export async function kiryuuGetLatest(): Promise<UnifiedComic[]> {
  const summary = await kiryuuGetSummary(60);
  const raw = [
    ...(summary.new_chapter ?? []),
    ...(summary.trending ?? []),
    ...(summary.popular ?? []),
    ...(summary.new_manga ?? []),
  ];
  const comics = raw.map(summaryItemToComic).filter(Boolean) as UnifiedComic[];
  return uniqueBySlug(comics);
}

export async function kiryuuGetPopular(): Promise<UnifiedComic[]> {
  const summary = await kiryuuGetSummary(300);
  const raw = [
    ...(summary.trending ?? []),
    ...(summary.popular ?? []),
  ];
  const comics = raw.map(summaryItemToComic).filter(Boolean) as UnifiedComic[];
  return uniqueBySlug(comics);
}

export async function kiryuuGetDetail(slug: string): Promise<{
  comic: UnifiedComic;
  chapters: UnifiedChapter[];
} | null> {
  try {
    const data = await kiryuuFetch<KiryuuDetailResponse>(`/detail/${slug}`, 600);
    if (!data.title) return null;

    const comic: UnifiedComic = {
      title: data.title,
      slug: data.slug ?? slug,
      thumbnail: data.cover ?? '',
      description: data.synopsis ?? '',
      genres: data.genres ?? [],
      status: data.status ?? 'Unknown',
      author: data.author,
      type: data.type,
      sources: [SOURCE_ID],
      sourceIds: { kiryuu: slug },
    };

    const chapters: UnifiedChapter[] = (data.chapters ?? [])
      .map((ch): UnifiedChapter | null => {
        const num = normalizeChapterNum(ch.chapter);
        if (!num) return null;
        return {
          chapterNumber: num,
          title: `Chapter ${num}`,
          date: ch.date ?? '',
          dateMs: 0,
          sourceId: SOURCE_ID,
          sourceName: 'Kiryuu',
          sourceChapterId: ch.slug ?? `${slug}-chapter-${num}`,
          sourceSlug: slug,
          views: undefined,
        };
      })
      .filter(Boolean) as UnifiedChapter[];

    return { comic, chapters };
  } catch {
    return null;
  }
}

export async function kiryuuGetChapterImages(
  chapterSlug: string
): Promise<UnifiedChapterImages | null> {
  const start = Date.now();
  try {
    const data = await kiryuuFetch<KiryuuChapterResponse>(`/chapter/${chapterSlug}`, 3600);
    if (!data.images?.length) return null;

    return {
      sourceId: SOURCE_ID,
      sourceName: 'Kiryuu',
      images: data.images.map((src, i) => ({
        src,
        alt: `Page ${i + 1}`,
        page: i + 1,
      })),
      resolvedInMs: Date.now() - start,
    };
  } catch {
    return null;
  }
}

export async function kiryuuHealthCheck(): Promise<boolean> {
  try {
    await kiryuuFetch('/summary', 0);
    return true;
  } catch {
    return false;
  }
}
