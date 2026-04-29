/**
 * Thin wrapper around the Komiku REST API
 * Base: https://api.komiku.vercel.app
 *
 * Endpoints used:
 *   GET /komik-populer          → popular manga/manhwa/manhua
 *   GET /terbaru                → latest updates
 *   GET /detail-komik/:slug     → comic detail + chapter list
 *   GET /baca-chapter/:slug/:n  → chapter images
 *   GET /search?q=keyword       → search
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://mangaverse-api.vercel.app";

// ── Types ────────────────────────────────────────────────────────────────────

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

/** Shape returned by /terbaru-2 */
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

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, revalidate = 300): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getPopularComics() {
  return apiFetch<KomikPopulerResponse>("/komik-populer", 300); // 5 min
}

export async function getLatestComics(): Promise<TerbaruItem[]> {
  return apiFetch<TerbaruItem[]>("/terbaru-2", 60); // 1 min — changes often
}

export async function getComicDetail(slug: string) {
  return apiFetch<DetailKomikResponse>(`/detail-komik/${slug}`, 600); // 10 min
}

export async function getChapterImages(slug: string, chapter: string) {
  return apiFetch<BacaChapterResponse>(`/baca-chapter/${slug}/${chapter}`, 3600); // 1 hr — static
}

export async function searchComics(query: string) {
  return apiFetch<SearchResult>(`/search?q=${encodeURIComponent(query)}`, 120); // 2 min
}
