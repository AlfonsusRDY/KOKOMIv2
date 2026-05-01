"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useLocale } from "@/app/components/localeProvider";
import { useHistory } from "@/hooks/useComicStorage";
import DownloadButton from "./downloadButton";
import type { ChapterImage } from "@/lib/api";

interface Props {
  slug: string;
  number: string;
  comicTitle: string;
  thumbnail: string | null;
  prevChapter: string | null;
  nextChapter: string | null;
  images: ChapterImage[];
}

export default function ChapterReaderNav({ slug, number, comicTitle, thumbnail, prevChapter, nextChapter, images }: Props) {
  const { t } = useLocale();
  const { addToHistory } = useHistory();

  useEffect(() => {
    addToHistory({
      slug,
      title: comicTitle,
      thumbnail: thumbnail || '',
      lastChapter: number
    });
  }, [slug, comicTitle, thumbnail, number]);

  return (
    <div
      className="sticky top-0 z-50 border-b"
      style={{
        background: 'rgba(13,13,15,0.90)',
        borderColor: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Back to comic */}
        <Link
          href={`/komik/${slug}`}
          className="flex items-center gap-2 text-xs font-medium transition-opacity hover:opacity-70 truncate max-w-[40%] flex-shrink-0"
          style={{ color: 'var(--text-secondary)' }}
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="truncate">{comicTitle}</span>
        </Link>

        {/* Chapter number */}
        <span
          className="text-xs font-bold flex-shrink-0 px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--bg-raised)', color: 'var(--text-primary)' }}
        >
          Ch. {number}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <DownloadButton comicTitle={comicTitle} chapterNumber={number} images={images} />
          {prevChapter && (
            <Link
              href={`/komik/${slug}/chapter/${prevChapter}`}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150"
              style={{ background: 'var(--bg-raised)', color: 'var(--text-secondary)' }}
            >
              ← {t.prev}
            </Link>
          )}
          {nextChapter && (
            <Link
              href={`/komik/${slug}/chapter/${nextChapter}`}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {t.next} →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
