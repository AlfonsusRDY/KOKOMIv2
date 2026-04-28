/**
 * Komponen List Chapter dengan Auto-Scroll
 * Path: components/komik/detail/ChapterList.tsx
 * 
 * HIGHLIGHT: Auto-scroll ke chapter 1 menggunakan useRef dan smooth scroll
 */

'use client';

import React, { useRef, useCallback, useState } from 'react';
import Link from 'next/link';
import { ChapterDetailInfo } from '@/types/komiku.types';
import { usePagination } from '@/hooks/useKomiku';

interface ChapterListProps {
  chapters: ChapterDetailInfo[];
  komikSlug: string;
  isDarkMode: boolean;
}

export default function ChapterList({
  chapters,
  komikSlug,
  isDarkMode,
}: ChapterListProps) {
  // =========================================================================
  // AUTO-SCROLL IMPLEMENTATION dengan useRef
  // =========================================================================
  
  // Ref untuk container list chapters
  const chapterListRef = useRef<HTMLDivElement>(null);
  
  // Ref untuk chapter pertama (Chapter 1)
  const firstChapterRef = useRef<HTMLDivElement>(null);

  const [isScrolling, setIsScrolling] = useState(false);

  /**
   * Fungsi untuk melakukan auto-scroll ke chapter pertama (Chapter 1)
   * dengan smooth scrolling effect
   * 
   * Cara kerja:
   * 1. Scroll ke posisi chapter 1 dengan smooth behavior
   * 2. Highlight chapter 1 sebentar
   * 3. Reset highlight setelah beberapa detik
   */
  const scrollToFirstChapter = useCallback(() => {
    if (!firstChapterRef.current) return;

    setIsScrolling(true);

    // Scroll ke chapter pertama dengan smooth effect
    firstChapterRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center', // Chapter akan berada di tengah viewport
    });

    // Highlight effect
    firstChapterRef.current.classList.add('highlight-pulse');

    // Remove highlight setelah 2 detik
    setTimeout(() => {
      firstChapterRef.current?.classList.remove('highlight-pulse');
      setIsScrolling(false);
    }, 2000);
  }, []);

  // Pagination setup - 15 chapters per page
  const {
    paginate,
    currentPage,
    totalPages,
    goToNextPage,
    goToPreviousPage,
  } = usePagination(chapters, 15);

  const paginatedChapters = paginate();

  // Sort chapters untuk menampilkan dari terbaru ke terakhir (reverse order)
  const displayedChapters = [...paginatedChapters].reverse();

  return (
    <div
      className={`rounded-lg overflow-hidden ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow`}
    >
      {/* Header dengan Tombol "Baca dari Awal" */}
      <div
        className={`p-4 border-b ${
          isDarkMode
            ? 'border-gray-700 bg-gray-700/50'
            : 'border-gray-200 bg-gray-50'
        } flex items-center justify-between flex-wrap gap-3`}
      >
        <div>
          <p
            className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Halaman {currentPage} dari {totalPages}
          </p>
        </div>

        {/* TOMBOL "BACA DARI AWAL" - AUTO SCROLL TRIGGER */}
        <button
          onClick={scrollToFirstChapter}
          disabled={isScrolling}
          className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
            isScrolling
              ? isDarkMode
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isDarkMode
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          <span>
            {isScrolling ? '⏳' : '📖'}
          </span>
          <span>
            {isScrolling ? 'Scrolling...' : 'Baca dari Awal'}
          </span>
        </button>
      </div>

      {/* Chapter List Container */}
      <div
        ref={chapterListRef}
        className="overflow-y-auto max-h-[600px] divide-y"
      >
        {displayedChapters.map((chapter, index) => {
          // Flag untuk chapter pertama (untuk auto-scroll ref)
          const isFirstChapter = chapter.chapterNumber === chapters[0]?.chapterNumber;

          return (
            <div
              key={`${chapter.chapterNumber}-${index}`}
              ref={isFirstChapter ? firstChapterRef : null}
              className={`p-4 transition hover:bg-opacity-50 ${
                isDarkMode
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-100'
              } group`}
            >
              <Link
                href={`/komik/${komikSlug}/chapter/${chapter.chapterNumber}`}
                className="block"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold group-hover:text-blue-500 transition line-clamp-2">
                      {chapter.title}
                    </h4>
                    <p
                      className={`text-xs mt-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      📅 {chapter.date}
                    </p>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <p
                      className={`text-xs font-medium ${
                        isDarkMode
                          ? 'text-gray-400'
                          : 'text-gray-600'
                      }`}
                    >
                      👁️ {chapter.views}
                    </p>
                  </div>
                </div>
              </Link>

              {/* Highlight indicator untuk chapter yang di-scroll */}
              {isFirstChapter && (
                <div className="mt-2 text-xs text-green-500 font-semibold flex items-center gap-1">
                  <span>⭐</span> Chapter Pertama
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          className={`p-4 border-t ${
            isDarkMode
              ? 'border-gray-700 bg-gray-700/50'
              : 'border-gray-200 bg-gray-50'
          } flex items-center justify-center gap-3 flex-wrap`}
        >
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded transition font-medium ${
              currentPage === 1
                ? isDarkMode
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
            }`}
          >
            ← Sebelumnya
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const pageNum =
                currentPage <= 3 ? i + 1 : currentPage - 2 + i;
              return pageNum <= totalPages ? (
                <button
                  key={pageNum}
                  onClick={() => {
                    // Add pagination page jump functionality if needed
                  }}
                  className={`w-8 h-8 rounded text-sm font-medium transition ${
                    pageNum === currentPage
                      ? isDarkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-300 text-gray-900 hover:bg-gray-400'
                  }`}
                >
                  {pageNum}
                </button>
              ) : null;
            })}
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded transition font-medium ${
              currentPage === totalPages
                ? isDarkMode
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
            }`}
          >
            Selanjutnya →
          </button>
        </div>
      )}

      {/* CSS untuk highlight effect */}
      <style jsx>{`
        @keyframes highlight-pulse {
          0% {
            background-color: ${isDarkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)'};
          }
          50% {
            background-color: ${isDarkMode ? 'rgba(34, 197, 94, 0.4)' : 'rgba(34, 197, 94, 0.2)'};
          }
          100% {
            background-color: transparent;
          }
        }

        :global(.highlight-pulse) {
          animation: highlight-pulse 2s ease-in-out;
        }
      `}</style>
    </div>
  );
}
