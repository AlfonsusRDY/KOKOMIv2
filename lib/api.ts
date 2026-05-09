/**
 * Komiku API — Primary Source Adapter
 *
 * Wraps mangaverse-api.vercel.app (Komiku scraper).
 * Kiryuu logic has been extracted to services/kiryuu.service.ts.
 * Multi-source orchestration lives in lib/aggregator.ts.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://mangaverse-api.vercel.app';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KomikItem {
  title: string;
  thumbnail: string;
  genre: string;
  readers: string;
  latestChapter: string;
  mangaSlug: string;
  chapterNumber: string;
  apiDetailLink: string | null;
  apiChapterLink: string | null;
}

export interface TerbaruItem {
  title: string;
  thumbnail: string;
  type: string;
  genre: string;
  updateTime: string;
  latestChapterTitle: string;
  latestChapterLink: string;
  isColored: boolean;
  updateCountText: string;
  mangaSlug: string;
  apiDetailLink: string | null;
  apiChapterLink: string | null;
}

export interface KomikSection {
  title: string;
  items: KomikItem[];
}

export interface KomikPopulerResponse {
  manga: KomikSection;
  manhwa: KomikSection;
  manhua: KomikSection;
  source?: string;
}

export interface ChapterDetailInfo {
  title: string;
  chapterNumber: string;
  date: string;
  views: string;
  apiLink: string | null;
  originalLink: string;
}

export interface DetailKomikResponse {
  title: string;
  thumbnail: string;
  sinopsis: string;
  description: string;
  info: Record<string, string>;
  genres: string[];
  slug: string;
  chapters: ChapterDetailInfo[];
}

export interface ChapterImage {
  src: string;
  alt: string;
  id: string;
  fallbackSrc: string;
}

export interface BacaChapterResponse {
  title: string;
  mangaInfo: {
    title: string;
    slug: string;
    originalLink: string | null;
    apiLink: string | null;
  };
  images: ChapterImage[];
  navigation: {
    prevChapter: { chapterNumber: string } | null;
    nextChapter: { chapterNumber: string } | null;
  };
}

export interface SearchItem {
  title: string;
  altTitle: string | null;
  slug: string;
  href: string;
  thumbnail: string;
  type: string;
  genre: string;
  description: string;
}

export interface SearchResult {
  status: boolean;
  message: string;
  keyword: string;
  url: string;
  total: number;
  data: SearchItem[];
}

export interface PustakaItem {
  title: string;
  thumbnail: string;
  type: string;
  genre: string;
  url: string;
  detailUrl: string;
  description: string;
  stats: string;
  firstChapter: { title: string; url: string };
  latestChapter: { title: string; url: string };
}

export interface PustakaResponse {
  page: number;
  type: string;
  results: PustakaItem[];
  source?: string;
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, revalidate = 300): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate },
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Komiku API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getPopularComics(): Promise<KomikPopulerResponse> {
  return apiFetch<KomikPopulerResponse>('/komik-populer', 300);
}

export async function getLatestComics(): Promise<TerbaruItem[]> {
  return apiFetch<TerbaruItem[]>('/terbaru-2', 60);
}

export async function getComicDetail(slug: string): Promise<DetailKomikResponse> {
  return apiFetch<DetailKomikResponse>(`/detail-komik/${slug}`, 600);
}

export async function getChapterImages(slug: string, chapter: string): Promise<BacaChapterResponse> {
  return apiFetch<BacaChapterResponse>(`/baca-chapter/${slug}/${chapter}`, 3600);
}

export async function getPustaka(page = 1): Promise<PustakaResponse> {
  return apiFetch<PustakaResponse>(`/pustaka/page/${page}`, 60);
}

export async function searchComics(query: string): Promise<SearchResult> {
  return apiFetch<SearchResult>(`/search?q=${encodeURIComponent(query)}`, 120);
}
