/**
 * MangaMint API Service Adapter
 *
 * Wraps the febryardiansyah/manga-api hosted endpoint.
 * Treated as a low-priority fallback — unreliable uptime.
 * Circuit breaker auto-disables after 3 consecutive failures.
 */

import type {
  SourceId,
  UnifiedComic,
  UnifiedChapter,
  UnifiedChapterImages,
} from '../types/source.types';

const SOURCE_ID: SourceId = 'mangamint';
const BASE = process.env.MANGAMINT_API_URL ?? 'https://mangamint.kaedenoki.net/api';

// ─── Circuit Breaker ──────────────────────────────────────────────────────────

let failures = 0;
let disabledUntil = 0;
const MAX_FAILURES = 3;
const RETRY_AFTER_MS = 5 * 60 * 1000; // 5 minutes

function isCircuitOpen(): boolean {
  if (Date.now() < disabledUntil) return true;
  if (disabledUntil > 0 && Date.now() >= disabledUntil) {
    // Reset for retry
    failures = 0;
    disabledUntil = 0;
  }
  return false;
}

function recordFailure() {
  failures++;
  if (failures >= MAX_FAILURES) {
    disabledUntil = Date.now() + RETRY_AFTER_MS;
    console.warn(`[MangaMint] Circuit breaker open for 5 minutes after ${failures} failures`);
  }
}

function recordSuccess() {
  failures = 0;
  disabledUntil = 0;
}

// ─── Raw Shapes ───────────────────────────────────────────────────────────────

interface MangaMintItem {
  title?: string;
  thumbnail?: string;
  endpoint?: string;
  genre?: string;
  type?: string;
  chapter?: string;
}

interface MangaMintListResponse {
  manga_list?: MangaMintItem[];
  data?: MangaMintItem[];
}

interface MangaMintDetailChapter {
  chapter_title?: string;
  chapter_endpoint?: string;
  chapter_date?: string;
}

interface MangaMintDetailResponse {
  title?: string;
  thumbnail?: string;
  genre_list?: Array<{ genre_name: string }>;
  synopsis?: string;
  status?: string;
  author?: string;
  chapter_list?: MangaMintDetailChapter[];
}

interface MangaMintChapterResponse {
  chapter_image?: Array<{ chapter_image_link: string }>;
}

// ─── Fetch Helper ─────────────────────────────────────────────────────────────

async function mintFetch<T>(path: string, timeoutMs = 8000): Promise<T> {
  if (isCircuitOpen()) throw new Error('[MangaMint] Circuit breaker is open');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${BASE}${path}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`MangaMint ${res.status}: ${path}`);
    const data = await res.json();
    recordSuccess();
    return data as T;
  } catch (err) {
    clearTimeout(timer);
    recordFailure();
    throw err;
  }
}

// ─── Normalizers ──────────────────────────────────────────────────────────────

function itemToComic(item: MangaMintItem): UnifiedComic | null {
  const slug = item.endpoint?.replace(/\//g, '').replace(/^komik-/, '') ?? '';
  if (!item.title || !slug) return null;
  return {
    title: item.title,
    slug,
    thumbnail: item.thumbnail ?? '',
    description: '',
    genres: item.genre ? [item.genre] : [],
    status: 'Unknown',
    type: item.type,
    sources: [SOURCE_ID],
    sourceIds: { mangamint: item.endpoint ?? slug },
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function mintGetLatest(page = 1): Promise<UnifiedComic[]> {
  try {
    const data = await mintFetch<MangaMintListResponse>(`/manga/page/${page}`);
    const items = data.manga_list ?? data.data ?? [];
    return items.map(itemToComic).filter(Boolean) as UnifiedComic[];
  } catch {
    return [];
  }
}

export async function mintGetPopular(page = 1): Promise<UnifiedComic[]> {
  try {
    const data = await mintFetch<MangaMintListResponse>(`/manga/popular/${page}`);
    const items = data.manga_list ?? data.data ?? [];
    return items.map(itemToComic).filter(Boolean) as UnifiedComic[];
  } catch {
    return [];
  }
}

export async function mintSearch(query: string): Promise<UnifiedComic[]> {
  try {
    const data = await mintFetch<MangaMintListResponse>(
      `/search/${encodeURIComponent(query)}`
    );
    const items = data.manga_list ?? data.data ?? [];
    return items.map(itemToComic).filter(Boolean) as UnifiedComic[];
  } catch {
    return [];
  }
}

export async function mintGetDetail(endpoint: string): Promise<{
  comic: UnifiedComic;
  chapters: UnifiedChapter[];
} | null> {
  try {
    const path = endpoint.startsWith('/') ? endpoint : `/manga/detail/${endpoint}`;
    const data = await mintFetch<MangaMintDetailResponse>(path);
    if (!data.title) return null;

    const slug = endpoint.replace(/\//g, '').replace(/^komik-/, '');

    const comic: UnifiedComic = {
      title: data.title,
      slug,
      thumbnail: data.thumbnail ?? '',
      description: data.synopsis ?? '',
      genres: (data.genre_list ?? []).map((g) => g.genre_name),
      status: data.status ?? 'Unknown',
      author: data.author,
      sources: [SOURCE_ID],
      sourceIds: { mangamint: endpoint },
    };

    const chapters: UnifiedChapter[] = (data.chapter_list ?? [])
      .map((ch): UnifiedChapter | null => {
        const numMatch = (ch.chapter_title ?? '').match(/[\d.]+/);
        const num = numMatch ? numMatch[0] : '';
        if (!num) return null;
        return {
          chapterNumber: num,
          title: ch.chapter_title ?? `Chapter ${num}`,
          date: ch.chapter_date ?? '',
          dateMs: 0,
          sourceId: SOURCE_ID,
          sourceName: 'MangaMint',
          sourceChapterId: ch.chapter_endpoint ?? '',
          sourceSlug: endpoint,
          views: undefined,
        };
      })
      .filter(Boolean) as UnifiedChapter[];

    return { comic, chapters };
  } catch {
    return null;
  }
}

export async function mintGetChapterImages(
  chapterEndpoint: string
): Promise<UnifiedChapterImages | null> {
  const start = Date.now();
  try {
    const path = chapterEndpoint.startsWith('/')
      ? chapterEndpoint
      : `/chapter/${chapterEndpoint}`;
    const data = await mintFetch<MangaMintChapterResponse>(path);
    const imgs = data.chapter_image ?? [];
    if (!imgs.length) return null;

    return {
      sourceId: SOURCE_ID,
      sourceName: 'MangaMint',
      images: imgs.map((img, i) => ({
        src: img.chapter_image_link,
        alt: `Page ${i + 1}`,
        page: i + 1,
      })),
      resolvedInMs: Date.now() - start,
    };
  } catch {
    return null;
  }
}

export async function mintHealthCheck(): Promise<boolean> {
  if (isCircuitOpen()) return false;
  try {
    await mintFetch('/manga/page/1', 3000);
    return true;
  } catch {
    return false;
  }
}

/** Expose circuit breaker state for health dashboard */
export function mintCircuitStatus() {
  return {
    isOpen: isCircuitOpen(),
    failures,
    disabledUntil: disabledUntil > 0 ? new Date(disabledUntil).toISOString() : null,
  };
}
