import Link from "next/link";
import { Suspense } from "react";
import { getAggregatedComic } from "@/lib/aggregator";
import { getComicDetail } from "@/lib/api";
import { notFound } from "next/navigation";
import ChapterReaderClient from "./components/chapterReaderClient";
import type { MultiSourceChapter } from "@/types/source.types";

interface PageProps {
  params: { slug: string; number: string };
  searchParams: { source?: string };
}

export default async function ChapterReaderPage({ params, searchParams }: PageProps) {
  const { slug, number } = params;

  let comicTitle = slug;
  let thumbnail: string | null = null;
  let multiChapter: MultiSourceChapter | undefined;
  let prevChapter: string | null = null;
  let nextChapter: string | null = null;

  try {
    // Try aggregated first to get multi-source chapter entries
    const aggregated = await getAggregatedComic(slug);
    comicTitle = aggregated.comic.title ?? slug;
    thumbnail = aggregated.comic.thumbnail ?? null;

    // Find the specific chapter in the aggregated list
    multiChapter = aggregated.chapters.find((c) => c.chapterNumber === number);

    // Build prev/next from aggregated chapters (sorted newest first)
    const sortedNums = aggregated.chapters.map((c) => parseFloat(c.chapterNumber)).sort((a, b) => a - b);
    const currentNum = parseFloat(number);
    const currentIdx = sortedNums.indexOf(currentNum);
    if (currentIdx > 0) prevChapter = String(sortedNums[currentIdx - 1]);
    if (currentIdx < sortedNums.length - 1) nextChapter = String(sortedNums[currentIdx + 1]);
  } catch {
    // Aggregator failed — try Komiku alone for navigation data
    try {
      const detail = await getComicDetail(slug);
      comicTitle = detail.title ?? slug;
      thumbnail = detail.thumbnail ?? null;
      const nums = detail.chapters.map((c) => parseFloat(c.chapterNumber)).sort((a, b) => a - b);
      const currentNum = parseFloat(number);
      const idx = nums.indexOf(currentNum);
      if (idx > 0) prevChapter = String(nums[idx - 1]);
      if (idx < nums.length - 1) nextChapter = String(nums[idx + 1]);
    } catch {
      notFound();
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#0D0D0F", color: "var(--text-primary)" }}>
      <Suspense>
        <ChapterReaderClient
          slug={slug}
          number={number}
          comicTitle={comicTitle}
          thumbnail={thumbnail}
          multiChapter={multiChapter}
          prevChapter={prevChapter}
          nextChapter={nextChapter}
        />
      </Suspense>

      {/* Bottom navigation */}
      <div
        data-reader-chrome
        className="mx-4 mt-10 flex items-center justify-between gap-3 pt-6 sm:mx-auto sm:max-w-2xl"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        {prevChapter ? (
          <Link
            href={`/komik/${slug}/chapter/${prevChapter}`}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-150 active:scale-95"
            style={{ background: "var(--bg-raised)", color: "var(--text-primary)" }}
          >
            Prev Ch. {prevChapter}
          </Link>
        ) : <div />}

        <Link
          href={`/komik/${slug}`}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-medium"
          style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          List
        </Link>

        {nextChapter ? (
          <Link
            href={`/komik/${slug}/chapter/${nextChapter}`}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-150 active:scale-95"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Next Ch. {nextChapter}
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
