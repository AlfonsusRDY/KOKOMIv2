/**
 * Multi-Source Aggregator — Unified Type Definitions
 *
 * Every external API adapter normalizes its data into these types
 * so the rest of the app never needs to know which source it came from.
 */

// ─── Source Identity ────────────────────────────────────────────────────────

export type SourceId = 'komiku' | 'asura' | 'kiryuu' | 'mangamint';

export interface SourceMeta {
  id: SourceId;
  name: string;
  /** Short label shown in badges */
  shortName: string;
  /** Tailwind-compatible CSS hex for badge accent */
  color: string;
  /** Light bg tint for badge background */
  bgColor: string;
  baseUrl: string;
  /** Runtime health flag (updated by sourceHealth.ts) */
  isHealthy: boolean;
  /** Rolling average latency in ms */
  avgLatencyMs: number;
}

export const SOURCE_META: Record<SourceId, Omit<SourceMeta, 'isHealthy' | 'avgLatencyMs'>> = {
  komiku: {
    id: 'komiku',
    name: 'Komiku',
    shortName: 'Komiku',
    color: '#5b9bd5',
    bgColor: 'rgba(91,155,213,0.12)',
    baseUrl: 'https://mangaverse-api.vercel.app',
  },
  asura: {
    id: 'asura',
    name: 'Asura Scans',
    shortName: 'Asura',
    color: '#b05bd5',
    bgColor: 'rgba(176,91,213,0.12)',
    baseUrl: 'https://asuracomic.net',
  },
  kiryuu: {
    id: 'kiryuu',
    name: 'Kiryuu',
    shortName: 'Kiryuu',
    color: '#5bd59b',
    bgColor: 'rgba(91,213,155,0.12)',
    baseUrl: 'http://45.76.148.33:8080/api/kiryuu/v6',
  },
  mangamint: {
    id: 'mangamint',
    name: 'MangaMint',
    shortName: 'Mint',
    color: '#d5b05b',
    bgColor: 'rgba(213,176,91,0.12)',
    baseUrl: 'https://mangamint.kaedenoki.net/api',
  },
};

// ─── Normalized Comic ────────────────────────────────────────────────────────

export interface UnifiedComic {
  title: string;
  /** Primary slug (Komiku slug used for internal routing) */
  slug: string;
  thumbnail: string;
  description: string;
  genres: string[];
  status: string;
  author?: string;
  type?: string;
  /** Which sources have confirmed they carry this comic */
  sources: SourceId[];
  /** Source-specific slugs/IDs for fetching detail/chapters */
  sourceIds: Partial<Record<SourceId, string>>;
}

// ─── Normalized Chapter ──────────────────────────────────────────────────────

export interface UnifiedChapter {
  chapterNumber: string;
  title: string;
  /** ISO date string or relative text */
  date: string;
  /** Sortable timestamp (ms). 0 if unknown */
  dateMs: number;
  sourceId: SourceId;
  sourceName: string;
  /** Opaque chapter ID the source needs to fetch images */
  sourceChapterId: string;
  /** Comic slug/ID the source uses */
  sourceSlug: string;
  views?: string;
}

/** Same chapter number available from multiple sources */
export interface MultiSourceChapter {
  chapterNumber: string;
  /** Sorted: newest/most reliable source first */
  entries: UnifiedChapter[];
  /** Best entry to use by default (most recent date) */
  recommended: UnifiedChapter;
}

// ─── Chapter Images ──────────────────────────────────────────────────────────

export interface UnifiedImage {
  src: string;
  alt: string;
  page: number;
  fallbackSrc?: string;
}

export interface UnifiedChapterImages {
  sourceId: SourceId;
  sourceName: string;
  images: UnifiedImage[];
  /** How long this source took to respond */
  resolvedInMs: number;
}

// ─── Race Result ─────────────────────────────────────────────────────────────

export interface RaceResult {
  winner: UnifiedChapterImages;
  /** All sources attempted, with their outcome */
  all: Array<{
    sourceId: SourceId;
    /** 'pending' = still loading in background, 'resolved' = done, 'error'/'timeout' = failed */
    status: 'resolved' | 'timeout' | 'error' | 'pending';
    resolvedInMs?: number;
  }>;
}
