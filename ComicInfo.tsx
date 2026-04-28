/**
 * Komponen Info Detail Komik
 * Path: components/komik/detail/ComicInfo.tsx
 */

'use client';

import React from 'react';
import { DetailKomikResponse } from '@/types/komiku.types';

interface ComicInfoProps {
  detail: DetailKomikResponse;
  isDarkMode: boolean;
}

export default function ComicInfo({ detail, isDarkMode }: ComicInfoProps) {
  return (
    <div
      className={`rounded-lg p-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow`}
    >
      {/* Description */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Deskripsi</h3>
        <p
          className={`leading-relaxed ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          {detail.sinopsis || detail.description}
        </p>
      </div>

      {/* Info Table */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Informasi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(detail.info).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span
                className={`font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {key}:
              </span>
              <span className="font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* First and Latest Chapter Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Chapter */}
        <div
          className={`p-4 rounded-lg border ${
            isDarkMode
              ? 'border-gray-700 bg-gray-700/30'
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <p
            className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            } mb-1`}
          >
            Chapter Pertama
          </p>
          <p className="font-semibold">{detail.firstChapter.title}</p>
        </div>

        {/* Latest Chapter */}
        <div
          className={`p-4 rounded-lg border ${
            isDarkMode
              ? 'border-gray-700 bg-gray-700/30'
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <p
            className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            } mb-1`}
          >
            Chapter Terbaru
          </p>
          <p className="font-semibold">{detail.latestChapter.title}</p>
        </div>
      </div>
    </div>
  );
}
