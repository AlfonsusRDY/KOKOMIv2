"use client";

import Link from "next/link";
import { useRef, useState, useMemo } from "react";
import { useLocale } from "@/app/components/localeProvider";

interface Chapter {
  title: string;
  chapterNumber: string;
  date: string;
  views: string;
  apiLink: string | null;
}

interface Props {
  chapters: Chapter[];
  slug: string;
}

const PER_PAGE = 50;

function buildRanges(chapters: Chapter[]) {
  const nums = chapters.map((c) => parseFloat(c.chapterNumber) || 0);
  const min = Math.floor(Math.min(...nums));
  const max = Math.ceil(Math.max(...nums));
  const ranges: { label: string; min: number; max: number }[] = [];
  for (let lo = min; lo <= max; lo += PER_PAGE) {
    const hi = lo + PER_PAGE - 1;
    ranges.push({ label: `Ch.${lo}-${Math.min(hi, max)}`, min: lo, max: Math.min(hi, max) });
  }
  return ranges.reverse();
}

export default function ChapterList({ chapters, slug }: Props) {
  const { t } = useLocale();
  const listRef = useRef<HTMLUListElement>(null);
  const [search, setSearch] = useState("");
  const [rangeIdx, setRangeIdx] = useState(0);

  const ranges = useMemo(() => buildRanges(chapters), [chapters]);

  const displayed = useMemo(() => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return chapters.filter((c) => c.chapterNumber.includes(search) || c.title.toLowerCase().includes(q));
    }
    const range = ranges[rangeIdx];
    if (!range) return chapters;
    return chapters.filter((c) => {
      const n = parseFloat(c.chapterNumber) || 0;
      return n >= range.min && n <= range.max;
    });
  }, [chapters, search, rangeIdx, ranges]);

  const handleReadFromStart = () => {
    setSearch("");
    setRangeIdx(ranges.length - 1);
    setTimeout(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, 60);
  };

  return (
    <section className="mt-6">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h2 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <span className="block w-1 h-4 rounded-full" style={{ background: "var(--accent)" }} />
          {t.chapterListTitle}
          <span className="text-xs font-normal ml-1" style={{ color: "var(--text-tertiary)" }}>
            ({chapters.length})
          </span>
        </h2>
        <button
          onClick={handleReadFromStart}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-all duration-150 active:scale-95"
          style={{ background: "var(--accent)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--accent-hover)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--accent)")}
        >
          {t.readFromStart}
        </button>
      </div>

      {/* Search input */}
      <div
        className="relative mb-3 rounded-xl overflow-hidden transition-all duration-150"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)" }}
        onFocusCapture={e => (e.currentTarget.style.borderColor = "var(--accent-border)")}
        onBlurCapture={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
      >
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
          style={{ color: "var(--text-tertiary)" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          placeholder={t.searchChapterPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 text-sm bg-transparent focus:outline-none"
          style={{ color: "var(--text-primary)" }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs transition-opacity hover:opacity-70"
            style={{ color: "var(--text-secondary)" }}
          >
            &#x2715;
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
              className="px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-150"
              style={{
                background: i === rangeIdx ? "var(--accent)" : "var(--bg-surface)",
                borderColor: i === rangeIdx ? "var(--accent)" : "var(--border-strong)",
                color: i === rangeIdx ? "#fff" : "var(--text-secondary)",
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      {/* Chapter list */}
      <ul
        ref={listRef}
        className="rounded-2xl overflow-hidden overflow-y-auto"
        style={{
          maxHeight: "520px",
          border: "1px solid var(--border)",
          background: "var(--bg-surface)",
        }}
      >
        {displayed.length === 0 ? (
          <li className="py-12 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            {t.chapterNotFound}
          </li>
        ) : (
          displayed.map((ch) => (
            <li key={ch.chapterNumber} style={{ borderBottom: "1px solid var(--border)" }}>
              <Link
                href={`/komik/${slug}/chapter/${ch.chapterNumber}`}
                className="flex items-center justify-between px-4 py-3.5 group transition-colors duration-100"
                style={{ minHeight: "52px" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-raised)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-12 text-center text-[10px] font-bold flex-shrink-0 rounded-lg py-1"
                    style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
                  >{ch.chapterNumber}</span>
                  <span className="text-sm truncate" style={{ color: "var(--text-primary)" }}>{ch.title}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  {ch.date && (
                    <span className="text-[11px] hidden sm:block" style={{ color: "var(--text-tertiary)" }}>
                      {ch.date}
                    </span>
                  )}
                  <span
                    className="text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--accent)" }}
                  >
                    {t.read} →
                  </span>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
      {!search && ranges.length > 1 && (
        <p className="text-[11px] mt-2 text-right" style={{ color: "var(--text-tertiary)" }}>
          {displayed.length} chapters · Page {rangeIdx + 1} / {ranges.length}
        </p>
      )}
    </section>
  );
}