/**
 * Komponen Detail Komik - Content
 * Path: components/komik/detail/ComicDetailContent.tsx
 */

'use client';

import React, { useState } from 'react';
import { DetailKomikResponse } from '@/types/komiku.types';
import ComicHeader from './ComicHeader';
import ComicInfo from './ComicInfo';
import ChapterList from './ChapterList';
import SimilarComics from './SimilarComics';

interface ComicDetailContentProps {
  detail: DetailKomikResponse;
  isDarkMode: boolean;
}

export default function ComicDetailContent({
  detail,
  isDarkMode,
}: ComicDetailContentProps) {
  const [expandedSections, setExpandedSections] = useState({
    info: true,
    chapters: true,
    similar: false,
  });

  const toggleSection = (section: 'info' | 'chapters' | 'similar') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <ComicHeader detail={detail} isDarkMode={isDarkMode} />

      {/* Info Section */}
      <section className="mt-8">
        <button
          onClick={() => toggleSection('info')}
          className={`w-full flex items-center justify-between p-4 rounded-lg transition ${
            isDarkMode
              ? 'bg-gray-800 hover:bg-gray-700'
              : 'bg-white hover:bg-gray-100'
          }`}
        >
          <h2 className="text-xl font-semibold">Informasi Komik</h2>
          <span
            className={`text-2xl transition-transform ${
              expandedSections.info ? 'rotate-180' : ''
            }`}
          >
            ▼
          </span>
        </button>

        {expandedSections.info && (
          <div className="mt-4">
            <ComicInfo detail={detail} isDarkMode={isDarkMode} />
          </div>
        )}
      </section>

      {/* Chapters Section */}
      <section className="mt-8">
        <button
          onClick={() => toggleSection('chapters')}
          className={`w-full flex items-center justify-between p-4 rounded-lg transition ${
            isDarkMode
              ? 'bg-gray-800 hover:bg-gray-700'
              : 'bg-white hover:bg-gray-100'
          }`}
        >
          <h2 className="text-xl font-semibold">
            Daftar Chapter ({detail.chapters.length})
          </h2>
          <span
            className={`text-2xl transition-transform ${
              expandedSections.chapters ? 'rotate-180' : ''
            }`}
          >
            ▼
          </span>
        </button>

        {expandedSections.chapters && (
          <div className="mt-4">
            <ChapterList
              chapters={detail.chapters}
              komikSlug={detail.slug}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
      </section>

      {/* Similar Comics Section */}
      {detail.similarKomik.length > 0 && (
        <section className="mt-8">
          <button
            onClick={() => toggleSection('similar')}
            className={`w-full flex items-center justify-between p-4 rounded-lg transition ${
              isDarkMode
                ? 'bg-gray-800 hover:bg-gray-700'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            <h2 className="text-xl font-semibold">Komik Serupa</h2>
            <span
              className={`text-2xl transition-transform ${
                expandedSections.similar ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </button>

          {expandedSections.similar && (
            <div className="mt-4">
              <SimilarComics
                comics={detail.similarKomik}
                isDarkMode={isDarkMode}
              />
            </div>
          )}
        </section>
      )}
    </main>
  );
}
