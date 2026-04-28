// ISR: cache each comic detail page for 10 minutes
export const revalidate = 600;

import { notFound } from "next/navigation";
import Link from "next/link";
import { getComicDetail } from "@/lib/api";
import ChapterList from "./components/ChapterList";

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Blurred hero backdrop */}
      <div className="relative h-52 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={detail.thumbnail}
          alt=""
          className="w-full h-full object-cover blur-2xl scale-110 opacity-40 dark:opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-950" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-36 pb-16 relative">
        {/* Back button */}
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500 mb-4 transition">
          ← Beranda
        </Link>

        {/* Comic header */}
        <section className="flex flex-col sm:flex-row gap-6 mb-8">
          {/* Cover */}
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={detail.thumbnail}
              alt={detail.title}
              className="w-40 h-56 sm:w-48 object-cover rounded-2xl shadow-2xl ring-4 ring-white dark:ring-gray-800"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
                {detail.title}
              </h1>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {status && (
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    status.toLowerCase().includes("ongoing") || status.toLowerCase().includes("berlangsung")
                      ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  }`}>
                    {status}
                  </span>
                )}
                {type && (
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400">
                    {type}
                  </span>
                )}
                {detail.genres?.map((g) => (
                  <span key={g} className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                    {g}
                  </span>
                ))}
              </div>

              {author && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Penulis: <span className="font-semibold text-gray-800 dark:text-gray-200">{author}</span>
                </p>
              )}

              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4 leading-relaxed mb-4">
                {detail.sinopsis || detail.description}
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {detail.chapters.length.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Chapter</p>
              </div>
              {detail.info?.Readers && (
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {detail.info.Readers}
                  </p>
                  <p className="text-xs text-gray-500">Pembaca</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Chapter list — client component for search/pagination/scroll */}
        <ChapterList chapters={detail.chapters} slug={params.slug} />
      </div>
    </div>
  );
}
