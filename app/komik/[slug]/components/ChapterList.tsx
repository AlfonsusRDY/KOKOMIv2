"use client";

import Link from "next/link";
import { useRef, useState, useMemo } from "react";

interface Chapter {
  title: string;
  chapterNumber: string;
  date: string;
  views: string;
  apiLink: string | null;
}

interface Props {
  chapters: Chapter[]; // from API: newest-first (largest number first)
  slug: string;
}

const PER_PAGE = 50;

function buildRanges(chapters: Chapter[]) {
  // chapters is newest-first, so last chapter = chapters[0], first = chapters[last]
  // We bucket by chapter number ranges
  const nums = chapters.map((c) => parseFloat(c.chapterNumber) || 0);
  const min = Math.floor(Math.min(...nums));
  const max = Math.ceil(Math.max(...nums));
  const ranges: { label: string; min: number; max: number }[] = [];
  for (let lo = min; lo <= max; lo += PER_PAGE) {
    const hi = lo + PER_PAGE - 1;
    ranges.push({ label: `Ch.${lo}–${Math.min(hi, max)}`, min: lo, max: Math.min(hi, max) });
  }
  return ranges.reverse(); // newest range first
}

export default function ChapterList({ chapters, slug }: Props) {
  const listRef = useRef<HTMLUListElement>(null);
  const [search, setSearch] = useState("");
  const [rangeIdx, setRangeIdx] = useState(0); // 0 = newest range

  const ranges = useMemo(() => buildRanges(chapters), [chapters]);

  const displayed = useMemo(() => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return chapters.filter(
        (c) =>
          c.chapterNumber.includes(search) ||
          c.title.toLowerCase().includes(q)
      );
    }
    const range = ranges[rangeIdx];
    if (!range) return chapters;
    return chapters.filter((c) => {
      const n = parseFloat(c.chapterNumber) || 0;
      return n >= range.min && n <= range.max;
    });
  }, [chapters, search, rangeIdx, ranges]);

  const handleReadFromStart = () => {
    // Jump to the oldest range (where Ch.1 lives = last range in reversed array)
    setSearch("");
    setRangeIdx(ranges.length - 1);
    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, 60);
  };

  return (
    <section className="mt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Daftar Chapter
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({chapters.length})
          </span>
        </h2>
        <button
          onClick={handleReadFromStart}
          className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-blue-900/20"
        >
          ▶ Baca dari Awal
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
        <input
          type="text"
          placeholder="Cari chapter (nomor atau nama)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-9 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Range tabs */}
      {!search && ranges.length > 1 && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          {ranges.map((r, i) => (
            <button
              key={r.label}
              onClick={() => setRangeIdx(i)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition ${
                i === rangeIdx
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      {/* Chapter list */}
      <ul
        ref={listRef}
        className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[500px] divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900"
      >
        {displayed.length === 0 ? (
          <li className="py-10 text-center text-gray-400 text-sm">
            Chapter tidak ditemukan.
          </li>
        ) : (
          displayed.map((ch) => (
            <li key={ch.chapterNumber}>
              <Link
                href={`/komik/${slug}/chapter/${ch.chapterNumber}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-12 text-center text-xs font-bold text-blue-600 dark:text-blue-400 flex-shrink-0 bg-blue-50 dark:bg-blue-900/20 rounded-lg py-1 px-1">
                    {ch.chapterNumber}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                    {ch.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  {ch.date && (
                    <span className="text-xs text-gray-400 hidden sm:block">{ch.date}</span>
                  )}
                  <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition">
                    Baca →
                  </span>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>

      {!search && (
        <p className="text-xs text-gray-400 mt-2 text-right">
          {displayed.length} chapter · Halaman {rangeIdx + 1} / {ranges.length}
        </p>
      )}
    </section>
  );
}
