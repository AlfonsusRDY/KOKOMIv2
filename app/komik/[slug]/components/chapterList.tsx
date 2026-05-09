"use client";

import Link from "next/link";
import { useRef, useState, useMemo } from "react";
import { useLocale } from "@/app/components/localeProvider";
import SourceBadge from "@/app/components/sourceBadge";
import type { MultiSourceChapter, UnifiedChapter } from "@/types/source.types";

// ─── Legacy flat chapter shape (kept for backwards compat) ────────────────────

interface FlatChapter {
  title: string;
  chapterNumber: string;
  date: string;
  views: string;
  apiLink: string | null;
}

interface Props {
  /** New multi-source format */
  multiChapters?: MultiSourceChapter[];
  /** Legacy flat format (still works) */
  chapters?: FlatChapter[];
  slug: string;
}

const PER_PAGE = 50;

function buildRanges(nums: number[]) {
  if (!nums.length) return [];
  const min = Math.floor(Math.min(...nums));
  const max = Math.ceil(Math.max(...nums));
  const ranges: { label: string; min: number; max: number }[] = [];
  for (let lo = min; lo <= max; lo += PER_PAGE) {
    const hi = Math.min(lo + PER_PAGE - 1, max);
    ranges.push({ label: `Ch.${lo}–${hi}`, min: lo, max: hi });
  }
  return ranges.reverse();
}

// ─── Single source row inside a chapter group ─────────────────────────────────

function SourceRow({ entry, slug, isRecommended }: {
  entry: UnifiedChapter;
  slug: string;
  isRecommended: boolean;
}) {
  return (
    <Link
      href={`/komik/${slug}/chapter/${entry.chapterNumber}?source=${entry.sourceId}`}
      className="flex items-center gap-3 px-4 py-2.5 transition-colors duration-100 group"
      style={{ borderTop: "1px solid var(--border)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-raised)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Indent indicator */}
      <span className="w-4 flex-shrink-0 flex items-center justify-center">
        <span
          className="w-px h-full min-h-[14px]"
          style={{ background: "var(--border-strong)" }}
        />
      </span>

      {/* Source badge */}
      <SourceBadge sourceId={entry.sourceId} />

      {/* Chapter title (if not just "Chapter N") */}
      {entry.title && !entry.title.match(/^chapter\s+[\d.]+$/i) && (
        <span
          className="text-xs truncate flex-1 min-w-0"
          style={{ color: "var(--text-secondary)" }}
        >
          {entry.title}
        </span>
      )}

      <div className="flex items-center gap-3 ml-auto flex-shrink-0">
        {/* Views */}
        {entry.views && (
          <span className="hidden sm:flex items-center gap-1 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {entry.views}
          </span>
        )}

        {/* Date */}
        {entry.date && (
          <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            {entry.date}
          </span>
        )}

        {/* Fastest / recommended badge */}
        {isRecommended && (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
          >
            ⚡
          </span>
        )}

        {/* Read arrow */}
        <span
          className="text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: "var(--accent)" }}
        >
          Read →
        </span>
      </div>
    </Link>
  );
}

// ─── Multi-source chapter group ────────────────────────────────────────────────

function MultiChapterRow({ group, slug }: { group: MultiSourceChapter; slug: string }) {
  const [expanded, setExpanded] = useState(false);
  const hasMultiple = group.entries.length > 1;
  const recommended = group.recommended;

  return (
    <li style={{ borderBottom: "1px solid var(--border)" }}>
      {/* Chapter header row — click to read recommended source */}
      <div className="flex items-center group" style={{ minHeight: "48px" }}>
        <Link
          href={`/komik/${slug}/chapter/${group.chapterNumber}?source=${recommended.sourceId}`}
          className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0 transition-colors duration-100"
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-raised)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {/* Chapter number badge */}
          <span
            className="w-12 text-center text-[10px] font-bold flex-shrink-0 rounded-lg py-1"
            style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
          >
            {group.chapterNumber}
          </span>

          {/* Title */}
          <span className="text-sm truncate flex-1 min-w-0" style={{ color: "var(--text-primary)" }}>
            {recommended.title}
          </span>

          {/* Right side info */}
          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            <SourceBadge sourceId={recommended.sourceId} short />
            {recommended.date && (
              <span className="hidden sm:block text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                {recommended.date}
              </span>
            )}
            <span
              className="text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "var(--accent)" }}
            >
              Read →
            </span>
          </div>
        </Link>

        {/* Expand toggle if multiple sources */}
        {hasMultiple && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 px-3 py-3 text-[11px] font-medium flex-shrink-0 transition-opacity hover:opacity-70"
            style={{ color: "var(--text-tertiary)" }}
            title={expanded ? "Hide sources" : `${group.entries.length} sources`}
          >
            <span>{group.entries.length}</span>
            <svg
              width="10"
              height="10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Expanded source rows */}
      {expanded && hasMultiple && (
        <div style={{ background: "var(--bg-surface)" }}>
          {group.entries.map((entry) => (
            <SourceRow
              key={`${entry.sourceId}-${entry.chapterNumber}`}
              entry={entry}
              slug={slug}
              isRecommended={entry === recommended}
            />
          ))}
        </div>
      )}
    </li>
  );
}

// ─── Legacy flat chapter row ──────────────────────────────────────────────────

function FlatChapterRow({ ch, slug }: { ch: FlatChapter; slug: string }) {
  return (
    <li key={ch.chapterNumber} style={{ borderBottom: "1px solid var(--border)" }}>
      <Link
        href={`/komik/${slug}/chapter/${ch.chapterNumber}`}
        className="flex items-center justify-between px-4 py-3.5 group transition-colors duration-100"
        style={{ minHeight: "52px" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-raised)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="w-12 text-center text-[10px] font-bold flex-shrink-0 rounded-lg py-1"
            style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
          >
            {ch.chapterNumber}
          </span>
          <span className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
            {ch.title}
          </span>
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
            Read →
          </span>
        </div>
      </Link>
    </li>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChapterList({ multiChapters, chapters, slug }: Props) {
  const { t } = useLocale();
  const listRef = useRef<HTMLUListElement>(null);
  const [search, setSearch] = useState("");
  const [rangeIdx, setRangeIdx] = useState(0);

  const isMulti = !!multiChapters?.length;

  const allNums = useMemo(() => {
    if (isMulti) return multiChapters!.map((c) => parseFloat(c.chapterNumber) || 0);
    return (chapters ?? []).map((c) => parseFloat(c.chapterNumber) || 0);
  }, [isMulti, multiChapters, chapters]);

  const ranges = useMemo(() => buildRanges(allNums), [allNums]);

  const displayedMulti = useMemo(() => {
    if (!isMulti) return [];
    if (search.trim()) {
      const q = search.toLowerCase();
      return multiChapters!.filter(
        (c) =>
          c.chapterNumber.includes(search) ||
          c.recommended.title.toLowerCase().includes(q)
      );
    }
    const range = ranges[rangeIdx];
    if (!range) return multiChapters!;
    return multiChapters!.filter((c) => {
      const n = parseFloat(c.chapterNumber) || 0;
      return n >= range.min && n <= range.max;
    });
  }, [isMulti, multiChapters, search, rangeIdx, ranges]);

  const displayedFlat = useMemo(() => {
    if (isMulti || !chapters) return [];
    if (search.trim()) {
      const q = search.toLowerCase();
      return chapters.filter(
        (c) => c.chapterNumber.includes(search) || c.title.toLowerCase().includes(q)
      );
    }
    const range = ranges[rangeIdx];
    if (!range) return chapters;
    return chapters.filter((c) => {
      const n = parseFloat(c.chapterNumber) || 0;
      return n >= range.min && n <= range.max;
    });
  }, [isMulti, chapters, search, rangeIdx, ranges]);

  const totalCount = isMulti ? (multiChapters?.length ?? 0) : (chapters?.length ?? 0);

  const handleReadFromStart = () => {
    setSearch("");
    setRangeIdx(ranges.length - 1);
    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, 60);
  };

  return (
    <section className="mt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h2 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <span className="block w-1 h-4 rounded-full" style={{ background: "var(--accent)" }} />
          {t.chapterListTitle}
          <span className="text-xs font-normal ml-1" style={{ color: "var(--text-tertiary)" }}>
            ({totalCount})
          </span>
        </h2>
        <button
          onClick={handleReadFromStart}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-all duration-150 active:scale-95"
          style={{ background: "var(--accent)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
        >
          {t.readFromStart}
        </button>
      </div>

      {/* Search */}
      <div
        className="relative mb-3 rounded-xl overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)" }}
        onFocusCapture={(e) => (e.currentTarget.style.borderColor = "var(--accent-border)")}
        onBlurCapture={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
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
        style={{ maxHeight: "560px", border: "1px solid var(--border)", background: "var(--bg-surface)" }}
      >
        {isMulti ? (
          displayedMulti.length === 0 ? (
            <li className="py-12 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
              {t.chapterNotFound}
            </li>
          ) : (
            displayedMulti.map((group) => (
              <MultiChapterRow key={group.chapterNumber} group={group} slug={slug} />
            ))
          )
        ) : (
          displayedFlat.length === 0 ? (
            <li className="py-12 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
              {t.chapterNotFound}
            </li>
          ) : (
            displayedFlat.map((ch) => (
              <FlatChapterRow key={ch.chapterNumber} ch={ch} slug={slug} />
            ))
          )
        )}
      </ul>

      {!search && ranges.length > 1 && (
        <p className="text-[11px] mt-2 text-right" style={{ color: "var(--text-tertiary)" }}>
          {isMulti ? displayedMulti.length : displayedFlat.length} chapters · Page {rangeIdx + 1} / {ranges.length}
        </p>
      )}
    </section>
  );
}