/**
 * Komponen Similar Comics
 * Path: components/komik/detail/SimilarComics.tsx
 */

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SimilarKomik } from '@/types/komiku.types';

interface SimilarComicsProps {
  comics: SimilarKomik[];
  isDarkMode: boolean;
}

export default function SimilarComics({ comics, isDarkMode }: SimilarComicsProps) {
  return (
    <div
      className={`rounded-lg p-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comics.slice(0, 6).map((comic) => (
          <Link
            key={comic.slug}
            href={`/komik/${comic.slug}`}
            className={`rounded-lg overflow-hidden transition hover:shadow-lg ${
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            {/* Thumbnail */}
            <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-500">
              <Image
                src={comic.thumbnail}
                alt={comic.title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = '/fallback-cover.png';
                }}
              />
              {comic.type && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  {comic.type}
                </div>
              )}
              {comic.views && (
                <div
                  className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-semibold ${
                    isDarkMode ? 'bg-gray-900/70' : 'bg-white/70'
                  }`}
                >
                  👁️ {comic.views}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-3">
              <h3 className="font-semibold line-clamp-2 hover:text-blue-500 transition">
                {comic.title}
              </h3>
              {comic.genres && (
                <p
                  className={`text-xs mt-1 line-clamp-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {comic.genres}
                </p>
              )}
              {comic.synopsis && (
                <p
                  className={`text-xs mt-2 line-clamp-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {comic.synopsis}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
