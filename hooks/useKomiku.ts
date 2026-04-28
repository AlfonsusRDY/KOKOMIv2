/**
 * React Hooks untuk Komiku API
 * Custom hooks untuk memudahkan penggunaan API di React components
 * 
 * Usage:
 * import { usePopularComics, useComicDetail, useChapterImages } from './hooks/useKomiku'
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  KomikPopulerResponse,
  DetailKomikResponse,
  BacaChapterResponse,
  SearchResult,
  GenreAllResponse,
  GenreDetailResponse,
} from '../types/komiku.types';
import { komiKuService } from '../services/komiku.service';

// ============================================================================
// GENERIC LOADING STATE HOOK
// ============================================================================

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAsyncReturn<T> extends UseAsyncState<T> {
  refetch: () => Promise<void>;
}

const useAsync = <T,>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
): UseAsyncReturn<T> => {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await asyncFunction();
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, refetch: execute };
};

// ============================================================================
// POPULAR COMICS HOOK
// ============================================================================

/**
 * Hook untuk mendapatkan daftar komik populer
 * 
 * @example
 * const { data: comics, loading, error } = usePopularComics();
 * 
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error}</div>;
 * 
 * return (
 *   <div>
 *     {comics?.manga.items.map(comic => (
 *       <div key={comic.mangaSlug}>{comic.title}</div>
 *     ))}
 *   </div>
 * );
 */
export const usePopularComics = () => {
  return useAsync(async () => {
    const result = await komiKuService.getPopularComics();
    if (!result.success) {
      throw new Error(result.error.error);
    }
    return result.data;
  });
};

// ============================================================================
// RECOMMENDED COMICS HOOK
// ============================================================================

export const useRecommendedComics = () => {
  return useAsync(async () => {
    const result = await komiKuService.getRecommendedComics();
    if (!result.success) {
      throw new Error(result.error.error);
    }
    return result.data;
  });
};

// ============================================================================
// LATEST COMICS HOOK
// ============================================================================

export const useLatestComics = () => {
  return useAsync(async () => {
    const result = await komiKuService.getLatestComics();
    if (!result.success) {
      throw new Error(result.error.error);
    }
    return result.data;
  });
};

// ============================================================================
// COMIC DETAIL HOOK
// ============================================================================

/**
 * Hook untuk mendapatkan detail komik dan daftar chapter
 * 
 * @param slug - Identifier komik (contoh: 'naruto')
 * @example
 * const { data: detail, loading, error, refetch } = useComicDetail('naruto');
 * 
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error}</div>;
 * 
 * return (
 *   <div>
 *     <h1>{detail?.title}</h1>
 *     <p>{detail?.sinopsis}</p>
 *     <div>
 *       {detail?.chapters.map((chapter) => (
 *         <div key={chapter.chapterNumber}>{chapter.title}</div>
 *       ))}
 *     </div>
 *   </div>
 * );
 */
export const useComicDetail = (slug: string | null) => {
  const [state, setState] = useState<UseAsyncState<DetailKomikResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    if (!slug) {
      setState({ data: null, loading: false, error: 'Slug not provided' });
      return;
    }

    setState({ data: null, loading: true, error: null });
    try {
      const result = await komiKuService.getComicDetail(slug);
      if (!result.success) {
        throw new Error(result.error.error);
      }
      setState({ data: result.data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      execute();
    }
  }, [slug, execute]);

  return { ...state, refetch: execute };
};

// ============================================================================
// CHAPTER IMAGES HOOK
// ============================================================================

/**
 * Hook untuk mendapatkan gambar chapter
 * 
 * @param slug - Identifier komik
 * @param chapter - Nomor chapter
 * @example
 * const { data: chapter, loading, error } = useChapterImages('naruto', '1');
 * 
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error}</div>;
 * 
 * return (
 *   <div>
 *     {chapter?.images.map((image) => (
 *       <img key={image.id} src={image.src} alt={image.alt} />
 *     ))}
 *   </div>
 * );
 */
export const useChapterImages = (
  slug: string | null,
  chapter: string | null
) => {
  const [state, setState] = useState<UseAsyncState<BacaChapterResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    if (!slug || !chapter) {
      setState({
        data: null,
        loading: false,
        error: 'Slug and chapter number required',
      });
      return;
    }

    setState({ data: null, loading: true, error: null });
    try {
      const result = await komiKuService.getChapterImages(slug, chapter);
      if (!result.success) {
        throw new Error(result.error.error);
      }
      setState({ data: result.data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [slug, chapter]);

  useEffect(() => {
    if (slug && chapter) {
      execute();
    }
  }, [slug, chapter, execute]);

  return { ...state, refetch: execute };
};

// ============================================================================
// SEARCH COMICS HOOK
// ============================================================================

/**
 * Hook untuk mencari komik
 * 
 * @example
 * const [query, setQuery] = useState('');
 * const { data: results, loading, error, search } = useSearchComics();
 * 
 * const handleSearch = async (q: string) => {
 *   setQuery(q);
 *   await search(q);
 * }
 */
export const useSearchComics = () => {
  const [state, setState] = useState<UseAsyncState<SearchResult>>({
    data: null,
    loading: false,
    error: null,
  });

  const search = useCallback(async (query: string) => {
    if (!query) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState({ data: null, loading: true, error: null });
    try {
      const result = await komiKuService.searchComics(query);
      if (!result.success) {
        throw new Error(result.error.error);
      }
      setState({ data: result.data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, []);

  return { ...state, search };
};

// ============================================================================
// GENRES HOOK
// ============================================================================

export const useAllGenres = () => {
  return useAsync(async () => {
    const result = await komiKuService.getAllGenres();
    if (!result.success) {
      throw new Error(result.error.error);
    }
    return result.data;
  });
};

// ============================================================================
// COMICS BY GENRE HOOK
// ============================================================================

/**
 * Hook untuk mendapatkan komik berdasarkan genre
 * 
 * @param genreSlug - Slug genre
 */
export const useComicsByGenre = (genreSlug: string | null) => {
  const [state, setState] = useState<UseAsyncState<GenreDetailResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    if (!genreSlug) {
      setState({ data: null, loading: false, error: 'Genre slug not provided' });
      return;
    }

    setState({ data: null, loading: true, error: null });
    try {
      const result = await komiKuService.getComicsByGenre(genreSlug);
      if (!result.success) {
        throw new Error(result.error.error);
      }
      setState({ data: result.data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [genreSlug]);

  useEffect(() => {
    if (genreSlug) {
      execute();
    }
  }, [genreSlug, execute]);

  return { ...state, refetch: execute };
};

// ============================================================================
// COLORED COMICS HOOK
// ============================================================================

export const useColoredComics = () => {
  return useAsync(async () => {
    const result = await komiKuService.getColoredComics();
    if (!result.success) {
      throw new Error(result.error.error);
    }
    return result.data;
  });
};

// ============================================================================
// PAGINATION HOOK (untuk chapter, results, dll)
// ============================================================================

/**
 * Hook untuk mengelola pagination
 * 
 * @example
 * const { currentPage, pageSize, paginate, goToNextPage, goToPreviousPage } 
 *   = usePagination(items, 20);
 * 
 * return (
 *   <div>
 *     {paginate().map(item => <div>{item}</div>)}
 *     <button onClick={goToPreviousPage}>Previous</button>
 *     <button onClick={goToNextPage}>Next</button>
 *   </div>
 * );
 */
interface UsePaginationReturn<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  paginate: () => T[];
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToPage: (page: number) => void;
}

export const usePagination = <T,>(
  items: T[],
  pageSize: number = 10
): UsePaginationReturn<T> => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / pageSize);

  const paginate = useCallback(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, pageSize]);

  const goToNextPage = useCallback(() => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  }, [totalPages]);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  }, []);

  const goToPage = useCallback((page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  }, [totalPages]);

  return {
    currentPage,
    pageSize,
    totalPages,
    paginate,
    goToNextPage,
    goToPreviousPage,
    goToPage,
  };
};
