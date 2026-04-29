"use client";

import Link from "next/link";
import { useLocale } from "@/app/components/localeProvider";

interface Props {
  slug: string;
  number: string;
  comicTitle: string;
  prevChapter: string | null;
  nextChapter: string | null;
}

export default function ChapterReaderNav({ slug, number, comicTitle, prevChapter, nextChapter }: Props) {
  const { t } = useLocale();
  return (
    <div
      className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: 'rgba(13,15,20,0.95)', borderColor: 'var(--border)', backdropFilter: 'blur(8px)' }}
    >
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link
          href={`/komik/${slug}`}
          className="text-sm transition-opacity hover:opacity-70 truncate max-w-[40%]"
          style={{ color: 'var(--text-secondary)' }}
        >
          &larr; {comicTitle}
        </Link>
        <span className="text-sm font-semibold flex-shrink-0" style={{ color: 'var(--text-primary)' }}>
          Ch. {number}
        </span>
        <div className="flex items-center gap-2">
          {prevChapter && (
            <Link
              href={`/komik/${slug}/chapter/${prevChapter}`}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'var(--bg-raised)', color: 'var(--text-primary)' }}
            >
              &larr; {t.prev}
            </Link>
          )}
          {nextChapter && (
            <Link
              href={`/komik/${slug}/chapter/${nextChapter}`}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            >
              {t.next} &rarr;
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
