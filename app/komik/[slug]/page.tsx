// ISR: cache each comic detail page for 10 minutes
export const revalidate = 600;

import { notFound } from "next/navigation";
import { getAggregatedComic } from "@/lib/aggregator";
import { getComicDetail } from "@/lib/api";
import ChapterList from "./components/chapterList";
import ComicDetailHero from "./components/comicDetailHero";

interface PageProps {
  params: { slug: string };
}

export default async function ComicDetailPage({ params }: PageProps) {
  const { slug } = params;

  // Try aggregated (multi-source) first, fall back to Komiku-only
  let detail = null;
  let multiChapters: import("@/types/source.types").MultiSourceChapter[] | undefined = undefined;

  try {
    const aggregated = await getAggregatedComic(slug);
    detail = {
      title: aggregated.comic.title,
      thumbnail: aggregated.comic.thumbnail,
      sinopsis: aggregated.comic.description,
      description: aggregated.comic.description,
      info: {
        Status: aggregated.comic.status,
        ...(aggregated.comic.author ? { Author: aggregated.comic.author } : {}),
        ...(aggregated.comic.type ? { Tipe: aggregated.comic.type } : {}),
      },
      genres: aggregated.comic.genres,
      slug,
      chapters: [], // not used when multiChapters is set
    };
    multiChapters = aggregated.chapters;
  } catch {
    // Aggregator failed — try plain Komiku
    try {
      detail = await getComicDetail(slug);
    } catch {
      notFound();
    }
  }

  if (!detail) notFound();

  const status = detail.info?.Status ?? detail.info?.status ?? "Unknown";
  const author = detail.info?.Author ?? detail.info?.Pengarang ?? null;
  const type = detail.info?.Tipe ?? detail.info?.Type ?? null;

  return (
    <div className="min-h-screen">
      {/* Blurred hero backdrop */}
      <div className="relative h-64 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={detail.thumbnail}
          alt=""
          className="w-full h-full object-cover blur-3xl scale-110"
          style={{ opacity: 0.08 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(218,119,86,0.04) 0%, var(--bg-primary) 90%)",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 pb-20 relative">
        <ComicDetailHero
          title={detail.title}
          thumbnail={detail.thumbnail}
          status={status}
          author={author}
          type={type}
          genres={detail.genres ?? []}
          sinopsis={detail.sinopsis || detail.description}
          chapterCount={multiChapters?.length ?? detail.chapters.length}
          readers={detail.info?.Readers ?? null}
          slug={slug}
        />
        <ChapterList
          multiChapters={multiChapters}
          chapters={multiChapters ? undefined : detail.chapters}
          slug={slug}
        />
      </div>
    </div>
  );
}
