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
  let thumbnail = null;

  try {
    const [chapterData, detailData] = await Promise.all([
      getChapterImages(slug, number),
      getComicDetail(slug).catch(() => null)
    ]);
    chapter = chapterData;
    comicTitle = chapter.mangaInfo?.title ?? slug;
    thumbnail = detailData?.thumbnail ?? null;
  } catch {
    notFound();
  }

  const prev = chapter.navigation?.prevChapter;
  const next = chapter.navigation?.nextChapter;

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F', color: 'var(--text-primary)' }}>
      {/* Sticky top bar */}
      <ChapterReaderNav
        slug={slug}
        number={number}
        comicTitle={comicTitle}
        thumbnail={thumbnail}
        prevChapter={prev?.chapterNumber ?? null}
        nextChapter={next?.chapterNumber ?? null}
        images={chapter.images ?? []}
      />

      {/* Chapter images */}
      <div className="max-w-2xl mx-auto px-0 sm:px-3 py-6">
        <ChapterImages images={chapter.images ?? []} />

        {/* Bottom navigation */}
        <div
          className="flex items-center justify-between mt-10 pt-6 mx-4 sm:mx-0 gap-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          {prev ? (
            <Link
              href={`/komik/${slug}/chapter/${prev.chapterNumber}`}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-150 active:scale-95"
              style={{ background: 'var(--bg-raised)', color: 'var(--text-primary)' }}
            >
              ← Ch. {prev.chapterNumber}
            </Link>
          ) : <div />}

          <Link
            href={`/komik/${slug}`}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-xl transition-all duration-150"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            List
          </Link>

          {next ? (
            <Link
              href={`/komik/${slug}/chapter/${next.chapterNumber}`}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-150 active:scale-95"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Ch. {next.chapterNumber} →
            </Link>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}
