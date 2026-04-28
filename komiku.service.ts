/**
 * Komiku API Service
 * Service untuk berkomunikasi dengan Komiku REST API
 * 
 * Usage dalam React:
 * import { komiKuService } from './services/komiku.service'
 * 
 * const comics = await komiKuService.getPopularComics();
 * const detail = await komiKuService.getComicDetail('naruto');
 * const chapter = await komiKuService.getChapterImages('naruto', '1');
 */

import {
  KomikPopulerResponse,
  DetailKomikResponse,
  BacaChapterResponse,
  SearchResult,
  GenreAllResponse,
  GenreDetailResponse,
  ApiResponse,
  ApiErrorResponse,
  KomikuApiConfig,
  DEFAULT_API_CONFIG,
} from '../types/komiku.types';

class KomikuApiService {
  private config: KomikuApiConfig;
  private cache: Map<string, { data: any; timestamp: number }>;

  constructor(config?: Partial<KomikuApiConfig>) {
    this.config = { ...DEFAULT_API_CONFIG, ...config };
    this.cache = new Map();
  }

  /**
   * Melakukan HTTP request dengan retry logic
   */
  private async fetchWithRetry(
    url: string,
    attempt: number = 1
  ): Promise<Response> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return response;
    } catch (error) {
      if (attempt < (this.config.retryAttempts || 3)) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.config.retryDelay)
        );
        return this.fetchWithRetry(url, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Generic fetch method dengan caching
   */
  private async get<T>(url: string): Promise<T> {
    // Check cache
    if (this.config.enableCache) {
      const cached = this.cache.get(url);
      if (cached) {
        const isExpired = Date.now() - cached.timestamp > (this.config.cacheExpiration || 3600000);
        if (!isExpired) {
          return cached.data as T;
        }
        this.cache.delete(url);
      }
    }

    // Fetch data
    const response = await this.fetchWithRetry(url);
    const data = await response.json();

    // Cache result
    if (this.config.enableCache) {
      this.cache.set(url, {
        data,
        timestamp: Date.now(),
      });
    }

    return data as T;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear specific cache entry
   */
  clearCacheEntry(url: string): void {
    this.cache.delete(url);
  }

  // ========================================================================
  // PUBLIC API METHODS
  // ========================================================================

  /**
   * Mendapatkan daftar komik populer (Manga, Manhwa, Manhua)
   * 
   * @returns Promise<KomikPopulerResponse>
   * @example
   * const comics = await komiKuService.getPopularComics();
   * console.log(comics.manga.items);
   */
  async getPopularComics(): Promise<ApiResponse<KomikPopulerResponse>> {
    try {
      const url = `${this.config.baseUrl}/komik-populer`;
      const data = await this.get<KomikPopulerResponse>(url);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error),
      };
    }
  }

  /**
   * Mendapatkan komik yang direkomendasikan
   * 
   * @returns Promise<KomikPopulerResponse>
   */
  async getRecommendedComics(): Promise<ApiResponse<KomikPopulerResponse>> {
    try {
      const url = `${this.config.baseUrl}/rekomendasi`;
      const data = await this.get<KomikPopulerResponse>(url);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error),
      };
    }
  }

  /**
   * Mendapatkan komik terbaru
   * 
   * @returns Promise<KomikPopulerResponse>
   */
  async getLatestComics(): Promise<ApiResponse<KomikPopulerResponse>> {
    try {
      const url = `${this.config.baseUrl}/terbaru`;
      const data = await this.get<KomikPopulerResponse>(url);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error),
      };
    }
  }

  /**
   * Mendapatkan detail komik dan daftar chapter
   * 
   * @param slug - Identifier komik (contoh: 'naruto')
   * @returns Promise<DetailKomikResponse>
   * @example
   * const detail = await komiKuService.getComicDetail('naruto');
   * console.log(detail.chapters); // Daftar semua chapter
   */
  async getComicDetail(
    slug: string
  ): Promise<ApiResponse<DetailKomikResponse>> {
    if (!slug) {
      return {
        success: false,
        error: {
          error: 'Slug komik diperlukan',
        },
      };
    }

    try {
      const url = `${this.config.baseUrl}/detail-komik/${slug}`;
      const data = await this.get<DetailKomikResponse>(url);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error),
      };
    }
  }

  /**
   * Mendapatkan gambar chapter
   * 
   * @param slug - Identifier komik
   * @param chapter - Nomor chapter (contoh: '1', '150.5')
   * @returns Promise<BacaChapterResponse>
   * @example
   * const images = await komiKuService.getChapterImages('naruto', '1');
   * console.log(images.images); // Array of image URLs
   */
  async getChapterImages(
    slug: string,
    chapter: string
  ): Promise<ApiResponse<BacaChapterResponse>> {
    if (!slug || !chapter) {
      return {
        success: false,
        error: {
          error: 'Slug komik dan nomor chapter diperlukan',
        },
      };
    }

    try {
      const url = `${this.config.baseUrl}/baca-chapter/${slug}/${chapter}`;
      const data = await this.get<BacaChapterResponse>(url);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error),
      };
    }
  }

  /**
   * Mencari komik berdasarkan keyword
   * 
   * @param query - Keyword pencarian
   * @returns Promise<SearchResult>
   * @example
   * const results = await komiKuService.searchComics('naruto');
   */
  async searchComics(
    query: string
  ): Promise<ApiResponse<SearchResult>> {
    if (!query) {
      return {
        success: false,
        error: {
          error: 'Query pencarian diperlukan',
        },
      };
    }

    try {
      const url = `${this.config.baseUrl}/search?q=${encodeURIComponent(query)}`;
      const data = await this.get<SearchResult>(url);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error),
      };
    }
  }

  /**
   * Mendapatkan semua genre
   * 
   * @returns Promise<GenreAllResponse>
   */
  async getAllGenres(): Promise<ApiResponse<GenreAllResponse>> {
    try {
      const url = `${this.config.baseUrl}/genre-all`;
      const data = await this.get<GenreAllResponse>(url);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error),
      };
    }
  }

  /**
   * Mendapatkan komik berdasarkan genre
   * 
   * @param genreSlug - Slug genre
   * @returns Promise<GenreDetailResponse>
   */
  async getComicsByGenre(
    genreSlug: string
  ): Promise<ApiResponse<GenreDetailResponse>> {
    if (!genreSlug) {
      return {
        success: false,
        error: {
          error: 'Genre slug diperlukan',
        },
      };
    }

    try {
      const url = `${this.config.baseUrl}/genre-detail/${genreSlug}`;
      const data = await this.get<GenreDetailResponse>(url);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error),
      };
    }
  }

  /**
   * Mendapatkan komik berwarna
   * 
   * @returns Promise<KomikPopulerResponse>
   */
  async getColoredComics(): Promise<ApiResponse<KomikPopulerResponse>> {
    try {
      const url = `${this.config.baseUrl}/berwarna`;
      const data = await this.get<KomikPopulerResponse>(url);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error),
      };
    }
  }

  // ========================================================================
  // HELPER METHODS
  // ========================================================================

  /**
   * Format error untuk consistency
   */
  private formatError(error: any): ApiErrorResponse {
    if (error instanceof Error) {
      return {
        error: error.message,
        detail: error.message,
      };
    }
    return {
      error: 'Unknown error occurred',
      detail: String(error),
    };
  }

  /**
   * Update base URL (untuk switching environment)
   */
  setBaseUrl(url: string): void {
    this.config.baseUrl = url;
    this.clearCache();
  }

  /**
   * Get current configuration
   */
  getConfig(): KomikuApiConfig {
    return { ...this.config };
  }
}

// Singleton instance
export const komiKuService = new KomikuApiService();

// Export class untuk custom instance jika diperlukan
export { KomikuApiService };
