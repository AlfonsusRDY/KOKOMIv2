import Link from "next/link";
import { getChapterImages, getComicDetail } from "@/lib/api";
import { notFound } from "next/navigation";
import ChapterImages from "./components/chapterImages";
import ChapterReaderNav from "./components/chapterReaderNav";

interface PageProps {
  params: { slug: string; number: string };
}

export default async function ChapterReaderPage({ params }: PageProps) {
  const { slug, number } = params;

  let chapter = null;
  let comicTitle = slug;

  try {
    chapter = await getChapterImages(slug, number);
    comicTitle = chapter.mangaInfo?.title ?? slug;
  } catch {
    notFound();
  }

  const prev = chapter.navigation?.prevChapter;
  const next = chapter.navigation?.nextChapter;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0D0F14', color: '#E8E9ED' }}>
      {/* Sticky top bar */}
      <ChapterReaderNav
        slug={slug}
        number={number}
        comicTitle={comicTitle}
        prevChapter={prev?.chapterNumber ?? null}
        nextChapter={next?.chapterNumber ?? null}
      />

      {/* Chapter images */}
      <div className="max-w-2xl mx-auto px-0 sm:px-2 py-6">
        <ChapterImages images={chapter.images ?? []} />

        {/* Bottom nav */}
        <div
          className="flex items-center justify-between mt-8 pt-6 mx-4 sm:mx-0"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {prev ? (
            <Link
              href={`/komik/${slug}/chapter/${prev.chapterNumber}`}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'var(--bg-raised)', color: 'var(--text-primary)' }}
            >
              &larr; Ch. {prev.chapterNumber}
            </Link>
          ) : <div />}
          <Link
            href={`/komik/${slug}`}
            className="px-4 py-2.5 text-xs rounded-xl transition-opacity hover:opacity-80"
            style={{ backgroundColor: 'var(--bg-raised)', color: 'var(--text-secondary)' }}
          >
            &#9776; List
          </Link>
          {next ? (
            <Link
              href={`/komik/${slug}/chapter/${next.chapterNumber}`}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            >
              Ch. {next.chapterNumber} &rarr;
            </Link>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}
