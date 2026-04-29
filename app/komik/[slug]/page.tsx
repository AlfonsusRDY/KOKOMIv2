// ISR: cache each comic detail page for 10 minutes
export const revalidate = 600;

import { notFound } from "next/navigation";
import { getComicDetail } from "@/lib/api";
import ChapterList from "./components/chapterList";
import ComicDetailHero from "./components/comicDetailHero";

interface PageProps {
  params: { slug: string };
}

export default async function ComicDetailPage({ params }: PageProps) {
  let detail = null;
  try {
    detail = await getComicDetail(params.slug);
  } catch {
    notFound();
  }

  if (!detail) notFound();

  const status = detail.info?.Status ?? detail.info?.status ?? "Unknown";
  const author = detail.info?.Author ?? detail.info?.Pengarang ?? null;
  const type = detail.info?.Tipe ?? detail.info?.Type ?? null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Blurred hero backdrop */}
      <div className="relative h-52 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={detail.thumbnail}
          alt=""
          className="w-full h-full object-cover blur-2xl scale-110"
          style={{ opacity: 0.15 }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--bg-primary))' }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-36 pb-16 relative">
        {/* Back button + comic info via client component for locale */}
        <ComicDetailHero
          title={detail.title}
          thumbnail={detail.thumbnail}
          status={status}
          author={author}
          type={type}
          genres={detail.genres ?? []}
          sinopsis={detail.sinopsis || detail.description}
          chapterCount={detail.chapters.length}
          readers={detail.info?.Readers ?? null}
          slug={params.slug}
        />

        {/* Chapter list */}
        <ChapterList chapters={detail.chapters} slug={params.slug} />
      </div>
    </div>
  );
}
