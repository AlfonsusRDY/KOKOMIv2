/**
 * Halaman Detail Komik - Next.js App Router
 * Path: app/komik/[slug]/page.tsx
 */

'use client';

import { useState } from 'react';
import { useComicDetail } from '@/hooks/useKomiku';
import ComicDetailContent from '@/components/komik/detail/ComicDetailContent';

interface ComicDetailPageProps {
  params: {
    slug: string;
  };
}

export default function ComicDetailPage({ params }: ComicDetailPageProps) {
  const { slug } = params;
  const { data: detail, loading, error, refetch } = useComicDetail(slug);
  const [isDarkMode, setIsDarkMode] = useState(true);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Loading komik detail...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
            Error
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            {error}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2 rounded-lg transition ${
            isDarkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
              : 'bg-white hover:bg-gray-100 text-gray-600'
          }`}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {detail && <ComicDetailContent detail={detail} isDarkMode={isDarkMode} />}
    </div>
  );
}
