/**
 * Komponen Header Detail Komik
 * Path: components/komik/detail/ComicHeader.tsx
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { DetailKomikResponse } from '@/types/komiku.types';

interface ComicHeaderProps {
  detail: DetailKomikResponse;
  isDarkMode: boolean;
}

export default function ComicHeader({ detail, isDarkMode }: ComicHeaderProps) {
  return (
    <div
      className={`rounded-lg overflow-hidden ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-lg`}
    >
      {/* Main Header - Flex Layout */}
      <div className="flex flex-col md:flex-row gap-6 p-6">
        {/* Cover Image */}
        <div className="flex-shrink-0 w-full md:w-48">
          <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden shadow-md">
            <Image
              src={detail.thumbnail}
              alt={detail.title}
              fill
              className="object-cover"
              priority
              onError={(e) => {
                e.currentTarget.src = '/fallback-cover.png';
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Title */}
          <div className="mb-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {detail.title}
            </h1>
            {detail.alternativeTitle && (
              <p
                className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {detail.alternativeTitle}
              </p>
            )}
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-4">
            {detail.genres.map((genre) => (
              <span
                key={genre}
                className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                  isDarkMode
                    ? 'bg-gray-700 text-blue-400'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Description */}
          <p
            className={`mb-6 leading-relaxed line-clamp-4 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {detail.sinopsis || detail.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {detail.firstChapter.apiLink && (
              <a
                href={detail.firstChapter.apiLink}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-center"
              >
                📖 Baca dari Awal
              </a>
            )}

            {detail.latestChapter.apiLink && (
              <a
                href={detail.latestChapter.apiLink}
                className={`px-6 py-3 font-semibold rounded-lg transition text-center ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                ⭐ Baca Terbaru (Ch. {detail.latestChapter.chapterNumber})
              </a>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {detail.chapters.length}
              </div>
              <p
                className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Total Chapter
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {detail.info['Status'] || 'Unknown'}
              </div>
              <p
                className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Status
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {detail.info['Tipe'] || 'N/A'}
              </div>
              <p
                className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Tipe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
