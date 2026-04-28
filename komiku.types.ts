/**
 * API Komiku - TypeScript Interfaces
 * Generated from VernSG/Komiku-Rest-Api analysis
 * 
 * Usage:
 * import { KomikPopulerResponse, DetailKomikResponse, BacaChapterResponse } from './types/komiku.types'
 */

// ============================================================================
// KOMIK POPULER RESPONSE - /komik-populer
// ============================================================================

export interface KomikItem {
  title: string;
  originalLink: string;
  apiDetailLink: string | null;
  thumbnail: string;
  genre: string;
  readers: string;
  latestChapter: string;
  originalChapterLink: string | null;
  apiChapterLink: string | null;
  mangaSlug: string;
  chapterNumber: string;
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

// ============================================================================
// DETAIL KOMIK RESPONSE - /detail-komik/:slug
// ============================================================================

export interface ChapterInfo {
  title: string;
  originalLink: string;
  apiLink: string | null;
  chapterNumber: string;
}

export interface ChapterDetailInfo extends ChapterInfo {
  views: string;
  date: string;
}

export interface MangaInfo {
  title: string;
  originalLink: string | null;
  apiLink: string | null;
  slug: string;
}

export interface SimilarKomik {
  title: string;
  originalLink: string;
  apiLink: string | null;
  thumbnail: string;
  type: string;
  genres: string;
  synopsis: string;
  views: string;
  slug: string;
}

export interface DetailKomikResponse {
  title: string;
  alternativeTitle: string;
  description: string;
  sinopsis: string;
  thumbnail: string;
  info: Record<string, string>;
  genres: string[];
  slug: string;
  firstChapter: ChapterInfo;
  latestChapter: ChapterInfo;
  chapters: ChapterDetailInfo[];
  similarKomik: SimilarKomik[];
}

// ============================================================================
// BACA CHAPTER RESPONSE - /baca-chapter/:slug/:chapter
// ============================================================================

export interface ChapterImage {
  src: string;
  alt: string;
  id: string;
  fallbackSrc: string;
}

export interface ChapterMeta {
  chapterNumber: string;
  totalImages: number;
  publishDate: string;
  viewAnalyticsUrl: string;
}

export interface ChapterNavigation {
  prevChapter: ChapterInfo | null;
  nextChapter: ChapterInfo | null;
  allChapters: string | null;
}

export interface BacaChapterResponse {
  title: string;
  mangaInfo: MangaInfo;
  description: string;
  chapterInfo: Record<string, string>;
  images: ChapterImage[];
  meta: ChapterMeta;
  navigation: ChapterNavigation;
  additionalDescription: string;
}

// ============================================================================
// SEARCH RESPONSE - /search?q=keyword
// ============================================================================

export interface SearchResult {
  items: KomikItem[];
  query: string;
  totalResults: number;
}

// ============================================================================
// GENRE RESPONSE - /genre-all, /genre-detail/:slug
// ============================================================================

export interface GenreItem {
  name: string;
  slug: string;
  count?: number;
}

export interface GenreAllResponse {
  genres: GenreItem[];
}

export interface GenreDetailResponse extends KomikSection {
  genreSlug: string;
}

// ============================================================================
// API SERVICE HELPER TYPES
// ============================================================================

export interface ApiErrorResponse {
  error: string;
  detail?: string;
  stack?: string;
}

export interface ApiRequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  cache?: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Tipe untuk response API yang mungkin berhasil atau gagal
 */
export type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: ApiErrorResponse };

/**
 * Tipe untuk pagination (jika diperlukan di masa depan)
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// FILTER & QUERY TYPES
// ============================================================================

export interface KomikFilter {
  genre?: string;
  status?: 'ongoing' | 'completed' | 'hiatus';
  type?: 'manga' | 'manhwa' | 'manhua';
  sortBy?: 'popular' | 'latest' | 'rating' | 'views';
}

// ============================================================================
// LOCAL STORAGE / CACHE TYPES
// ============================================================================

export interface CachedKomikItem extends KomikItem {
  cachedAt: number;
  expiresAt: number;
}

export interface UserPreferences {
  favorites: string[]; // Array of komik slugs
  readHistory: ReadHistoryItem[];
  theme: 'light' | 'dark';
  language: 'id' | 'en';
}

export interface ReadHistoryItem {
  komikSlug: string;
  chapterNumber: string;
  readAt: number;
  lastPage?: number;
}

// ============================================================================
// COMPONENT & UI TYPES
// ============================================================================

export interface KomikCardProps {
  komik: KomikItem;
  onClick?: (slug: string) => void;
  showLatestChapter?: boolean;
}

export interface ChapterListProps {
  chapters: ChapterDetailInfo[];
  onChapterSelect?: (chapterNumber: string) => void;
  loading?: boolean;
}

export interface ImageGalleryProps {
  images: ChapterImage[];
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

// ============================================================================
// API CLIENT CONFIGURATION
// ============================================================================

export interface KomikuApiConfig {
  baseUrl: string;
  timeout?: number;
  enableCache?: boolean;
  cacheExpiration?: number; // in milliseconds
  retryAttempts?: number;
  retryDelay?: number; // in milliseconds
}

export const DEFAULT_API_CONFIG: KomikuApiConfig = {
  baseUrl: 'https://api.komiku.vercel.app', // Adjust based on your deployment
  timeout: 10000,
  enableCache: true,
  cacheExpiration: 3600000, // 1 hour
  retryAttempts: 3,
  retryDelay: 1000,
};
