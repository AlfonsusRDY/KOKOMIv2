/**
 * Contoh Implementasi React Components menggunakan Komiku API
 * 
 * File ini menunjukkan cara praktis menggunakan hooks dan service
 * dalam komponen React yang nyata
 */

import React, { useState } from 'react';
import {
  usePopularComics,
  useComicDetail,
  useChapterImages,
  useSearchComics,
  usePagination,
} from '../hooks/useKomiku';
import {
  KomikItem,
  ChapterDetailInfo,
  ChapterImage,
} from '../types/komiku.types';

// ============================================================================
// 1. COMPONENT: Halaman Daftar Komik Populer
// ============================================================================

export const PopularComicsPage: React.FC = () => {
  const { data: comics, loading, error } = usePopularComics();
  const [selectedType, setSelectedType] = useState<'manga' | 'manhwa' | 'manhua'>('manga');

  if (loading) {
    return <div className="loading">Loading popular comics...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  const selectedComics = comics?.[selectedType];

  return (
    <div className="popular-comics-page">
      <h1>Komik Populer</h1>

      <div className="type-filter">
        {(['manga', 'manhwa', 'manhua'] as const).map((type) => (
          <button
            key={type}
            className={selectedType === type ? 'active' : ''}
            onClick={() => setSelectedType(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="comics-grid">
        {selectedComics?.items.map((comic) => (
          <ComicCard key={comic.mangaSlug} comic={comic} />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 2. COMPONENT: Comic Card (Item Komik)
// ============================================================================

interface ComicCardProps {
  comic: KomikItem;
  onClick?: (slug: string) => void;
}

export const ComicCard: React.FC<ComicCardProps> = ({ comic, onClick }) => {
  return (
    <div
      className="comic-card"
      onClick={() => onClick?.(comic.mangaSlug)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="comic-thumbnail">
        <img src={comic.thumbnail} alt={comic.title} />
        {comic.latestChapter && (
          <div className="latest-chapter-badge">
            {comic.latestChapter}
          </div>
        )}
      </div>

      <div className="comic-info">
        <h3 className="comic-title">{comic.title}</h3>
        <p className="comic-genre">{comic.genre}</p>
        <p className="comic-readers">{comic.readers}</p>

        {comic.apiDetailLink && (
          <a href={comic.apiDetailLink} className="btn-detail">
            Detail
          </a>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 3. COMPONENT: Halaman Detail Komik
// ============================================================================

interface ComicDetailPageProps {
  slug: string;
  onChapterSelect?: (slug: string, chapter: string) => void;
}

export const ComicDetailPage: React.FC<ComicDetailPageProps> = ({
  slug,
  onChapterSelect,
}) => {
  const { data: detail, loading, error } = useComicDetail(slug);
  const { paginate, currentPage, totalPages, goToNextPage, goToPreviousPage } =
    usePagination(detail?.chapters || [], 10);

  if (loading) {
    return <div className="loading">Loading comic detail...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!detail) {
    return <div className="error">Comic not found</div>;
  }

  return (
    <div className="comic-detail-page">
      {/* Header dengan gambar dan info dasar */}
      <div className="comic-header">
        <img src={detail.thumbnail} alt={detail.title} className="cover" />
        <div className="header-info">
          <h1>{detail.title}</h1>
          <p className="alt-title">{detail.alternativeTitle}</p>
          <p className="sinopsis">{detail.sinopsis}</p>

          {/* Genre tags */}
          <div className="genres">
            {detail.genres.map((genre) => (
              <span key={genre} className="genre-tag">
                {genre}
              </span>
            ))}
          </div>

          {/* Info table */}
          <div className="info-table">
            {Object.entries(detail.info).map(([key, value]) => (
              <div key={key} className="info-row">
                <span className="info-key">{key}:</span>
                <span className="info-value">{value}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="actions">
            {detail.firstChapter.apiLink && (
              <a
                href={detail.firstChapter.apiLink}
                className="btn btn-primary"
              >
                Baca dari Awal
              </a>
            )}
            {detail.latestChapter.apiLink && (
              <a
                href={detail.latestChapter.apiLink}
                className="btn btn-secondary"
              >
                Baca Terbaru ({detail.latestChapter.chapterNumber})
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Daftar Chapter */}
      <div className="chapters-section">
        <h2>Daftar Chapter ({detail.chapters.length} total)</h2>

        <div className="chapters-list">
          {paginate().map((chapter) => (
            <ChapterItem
              key={chapter.chapterNumber}
              chapter={chapter}
              onClick={() =>
                onChapterSelect?.(slug, chapter.chapterNumber)
              }
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Komik Serupa */}
      {detail.similarKomik.length > 0 && (
        <div className="similar-section">
          <h2>Komik Serupa</h2>
          <div className="similar-grid">
            {detail.similarKomik.slice(0, 6).map((komik) => (
              <ComicCard key={komik.slug} comic={
                {
                  title: komik.title,
                  originalLink: komik.originalLink,
                  apiDetailLink: komik.apiLink,
                  thumbnail: komik.thumbnail,
                  genre: komik.genres,
                  readers: komik.views,
                  latestChapter: '',
                  originalChapterLink: null,
                  apiChapterLink: null,
                  mangaSlug: komik.slug,
                  chapterNumber: '',
                } as KomikItem
              } />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 4. COMPONENT: Chapter Item
// ============================================================================

interface ChapterItemProps {
  chapter: ChapterDetailInfo;
  onClick?: () => void;
}

export const ChapterItem: React.FC<ChapterItemProps> = ({
  chapter,
  onClick,
}) => {
  return (
    <div
      className="chapter-item"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="chapter-header">
        <h4>{chapter.title}</h4>
        <span className="chapter-date">{chapter.date}</span>
      </div>
      <div className="chapter-footer">
        <span className="chapter-views">{chapter.views}</span>
      </div>
    </div>
  );
};

// ============================================================================
// 5. COMPONENT: Chapter Reader (Image Gallery)
// ============================================================================

interface ChapterReaderProps {
  slug: string;
  chapter: string;
}

export const ChapterReader: React.FC<ChapterReaderProps> = ({
  slug,
  chapter,
}) => {
  const { data: chapterData, loading, error } = useChapterImages(slug, chapter);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (loading) {
    return <div className="loading">Loading chapter...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!chapterData) {
    return <div className="error">Chapter not found</div>;
  }

  const currentImage = chapterData.images[currentImageIndex];
  const totalImages = chapterData.images.length;

  const goToNextImage = () => {
    if (currentImageIndex < totalImages - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  return (
    <div className="chapter-reader">
      {/* Header */}
      <div className="reader-header">
        <h2>{chapterData.title}</h2>
        <p>
          {chapterData.mangaInfo.title} - Chapter{' '}
          {chapterData.meta.chapterNumber}
        </p>
      </div>

      {/* Image viewer */}
      <div className="image-viewer">
        <div className="image-container">
          {currentImage && (
            <img
              src={currentImage.src}
              alt={currentImage.alt}
              onError={(e) => {
                // Fallback image jika yang utama gagal
                (e.target as HTMLImageElement).src = currentImage.fallbackSrc;
              }}
            />
          )}
        </div>

        <div className="image-info">
          Page {currentImageIndex + 1} of {totalImages}
        </div>
      </div>

      {/* Navigation */}
      <div className="reader-controls">
        <button
          onClick={goToPreviousImage}
          disabled={currentImageIndex === 0}
          className="btn-prev"
        >
          ← Previous
        </button>

        <div className="page-input">
          <input
            type="number"
            min="1"
            max={totalImages}
            value={currentImageIndex + 1}
            onChange={(e) => {
              const page = parseInt(e.target.value) - 1;
              if (page >= 0 && page < totalImages) {
                setCurrentImageIndex(page);
              }
            }}
          />
          <span>/ {totalImages}</span>
        </div>

        <button
          onClick={goToNextImage}
          disabled={currentImageIndex === totalImages - 1}
          className="btn-next"
        >
          Next →
        </button>
      </div>

      {/* Chapter Navigation */}
      {(chapterData.navigation.prevChapter ||
        chapterData.navigation.nextChapter) && (
        <div className="chapter-navigation">
          {chapterData.navigation.prevChapter && (
            <a
              href={chapterData.navigation.prevChapter.apiLink || '#'}
              className="btn-prev-chapter"
            >
              ← {chapterData.navigation.prevChapter.title}
            </a>
          )}

          {chapterData.navigation.allChapters && (
            <a
              href={chapterData.navigation.allChapters}
              className="btn-all-chapters"
            >
              All Chapters
            </a>
          )}

          {chapterData.navigation.nextChapter && (
            <a
              href={chapterData.navigation.nextChapter.apiLink || '#'}
              className="btn-next-chapter"
            >
              {chapterData.navigation.nextChapter.title} →
            </a>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 6. COMPONENT: Search Component
// ============================================================================

interface SearchComponentProps {
  onResultSelect?: (slug: string) => void;
}

export const SearchComponent: React.FC<SearchComponentProps> = ({
  onResultSelect,
}) => {
  const [query, setQuery] = useState('');
  const { data: results, loading, error, search } = useSearchComics();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      await search(query);
    }
  };

  return (
    <div className="search-component">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari komik..."
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {loading && <div className="loading">Searching...</div>}

      {error && <div className="error">Error: {error}</div>}

      {results && results.items.length > 0 && (
        <div className="search-results">
          <p className="results-count">
            Ditemukan {results.items.length} hasil untuk "{query}"
          </p>
          <div className="results-list">
            {results.items.map((comic) => (
              <div
                key={comic.mangaSlug}
                className="result-item"
                onClick={() => onResultSelect?.(comic.mangaSlug)}
              >
                <img src={comic.thumbnail} alt={comic.title} />
                <div className="result-info">
                  <h4>{comic.title}</h4>
                  <p>{comic.genre}</p>
                  <p>{comic.readers}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results && results.items.length === 0 && query && !loading && (
        <div className="no-results">Tidak ada hasil untuk "{query}"</div>
      )}
    </div>
  );
};

// ============================================================================
// 7. COMPONENT: Main App Layout
// ============================================================================

export const KomikuApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<
    'home' | 'detail' | 'reader' | 'search'
  >('home');
  const [selectedComic, setSelectedComic] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  return (
    <div className="komiku-app">
      {/* Navigation */}
      <nav className="navbar">
        <button onClick={() => setCurrentPage('home')}>Home</button>
        <SearchComponent
          onResultSelect={(slug) => {
            setSelectedComic(slug);
            setCurrentPage('detail');
          }}
        />
      </nav>

      {/* Main content */}
      <main className="main-content">
        {currentPage === 'home' && (
          <PopularComicsPage />
        )}

        {currentPage === 'detail' && selectedComic && (
          <ComicDetailPage
            slug={selectedComic}
            onChapterSelect={(slug, chapter) => {
              setSelectedChapter(chapter);
              setCurrentPage('reader');
            }}
          />
        )}

        {currentPage === 'reader' && selectedComic && selectedChapter && (
          <ChapterReader slug={selectedComic} chapter={selectedChapter} />
        )}
      </main>
    </div>
  );
};

export default KomikuApp;
