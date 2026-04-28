import Link from "next/link";
import { getChapterImages, getComicDetail } from "@/lib/api";
import { notFound } from "next/navigation";
import ChapterImages from "./components/ChapterImages";

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
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link
            href={`/komik/${slug}`}
            className="text-sm text-gray-400 hover:text-white transition truncate max-w-[40%]"
          >
            ← {comicTitle}
          </Link>
          <span className="text-sm font-semibold text-gray-200 flex-shrink-0">
            Chapter {number}
          </span>
          <div className="flex items-center gap-2">
            {prev && (
              <Link
                href={`/komik/${slug}/chapter/${prev.chapterNumber}`}
                className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded-lg transition"
              >
                ← Prev
              </Link>
            )}
            {next && (
              <Link
                href={`/komik/${slug}/chapter/${next.chapterNumber}`}
                className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Chapter images — preloaded with IntersectionObserver */}
      <div className="max-w-2xl mx-auto px-2 py-6">
        <ChapterImages images={chapter.images ?? []} />

        {/* Bottom nav */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800">
          {prev ? (
            <Link
              href={`/komik/${slug}/chapter/${prev.chapterNumber}`}
              className="px-5 py-2.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-xl transition"
            >
              ← Chapter {prev.chapterNumber}
            </Link>
          ) : <div />}
          <Link
            href={`/komik/${slug}`}
            className="px-5 py-2.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-xl transition"
          >
            Daftar Chapter
          </Link>
          {next ? (
            <Link
              href={`/komik/${slug}/chapter/${next.chapterNumber}`}
              className="px-5 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 rounded-xl transition"
            >
              Chapter {next.chapterNumber} →
            </Link>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}
