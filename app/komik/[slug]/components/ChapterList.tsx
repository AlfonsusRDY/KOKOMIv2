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
    <section className="mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          {t.chapterListTitle}
          <span className="ml-2 text-sm font-normal" style={{ color: "var(--text-secondary)" }}>({chapters.length})</span>
        </h2>
        <button onClick={handleReadFromStart}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-opacity hover:opacity-90 active:scale-95"
          style={{ backgroundColor: "var(--accent)" }}>
          {t.readFromStart}
        </button>
      </div>
      <div className="relative mb-3">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: "var(--text-secondary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input type="text" placeholder={t.searchChapterPlaceholder} value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl transition focus:outline-none"
          style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)", color: "var(--text-primary)" }} />
        {search && (
          <button onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs transition-opacity hover:opacity-70"
            style={{ color: "var(--text-secondary)" }}>&#x2715;</button>
        )}
      </div>
      {!search && ranges.length > 1 && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          {ranges.map((r, i) => (
            <button key={r.label} onClick={() => setRangeIdx(i)}
              className="px-3 py-1 text-xs font-medium rounded-full border transition"
              style={{ backgroundColor: i === rangeIdx ? "var(--accent)" : "var(--bg-surface)", borderColor: i === rangeIdx ? "var(--accent)" : "var(--border)", color: i === rangeIdx ? "#fff" : "var(--text-secondary)" }}>
              {r.label}
            </button>
          ))}
        </div>
      )}
      <ul ref={listRef} className="rounded-2xl overflow-y-auto"
        style={{ maxHeight: "520px", border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}>
        {displayed.length === 0 ? (
          <li className="py-10 text-center text-sm" style={{ color: "var(--text-secondary)" }}>{t.chapterNotFound}</li>
        ) : (
          displayed.map((ch) => (
            <li key={ch.chapterNumber} style={{ borderBottom: "1px solid var(--border)" }}>
              <Link href={`/komik/${slug}/chapter/${ch.chapterNumber}`}
                className="flex items-center justify-between px-4 py-3.5 transition group" style={{ minHeight: "48px" }}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-12 text-center text-xs font-bold flex-shrink-0 rounded-lg py-1 px-1"
                    style={{ backgroundColor: "var(--bg-raised)", color: "var(--accent)" }}>{ch.chapterNumber}</span>
                  <span className="text-sm truncate" style={{ color: "var(--text-primary)" }}>{ch.title}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  {ch.date && <span className="text-xs hidden sm:block" style={{ color: "var(--text-secondary)" }}>{ch.date}</span>}
                  <span className="text-xs opacity-0 group-hover:opacity-100 transition" style={{ color: "var(--accent)" }}>{t.read} &rarr;</span>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
      {!search && (
        <p className="text-xs mt-2 text-right" style={{ color: "var(--text-secondary)" }}>
          {displayed.length} {t.chapterCount} &middot; {t.pageLabel} {rangeIdx + 1} / {ranges.length}
        </p>
      )}
    </section>
  );
}