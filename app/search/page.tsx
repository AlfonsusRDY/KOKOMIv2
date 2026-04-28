import Link from "next/link";
import { searchComics } from "@/lib/api";

interface PageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const query = searchParams.q?.trim() ?? "";
  let results = null;
  let error = null;

  if (query) {
    try {
      results = await searchComics(query);
    } catch (e) {
      error = "Gagal mengambil hasil pencarian. Coba lagi.";
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Search heading */}
      <div className="mb-8">
        <Link href="/" className="text-sm text-blue-500 hover:underline mb-4 inline-block">
          ← Kembali
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {query ? (
            <>
              Hasil pencarian:{" "}
              <span className="text-blue-500">&quot;{query}&quot;</span>
              {results && (
                <span className="text-sm font-normal text-gray-400 ml-2">
                  ({results.totalResults ?? results.items.length} hasil)
                </span>
              )}
            </>
          ) : (
            "Cari Komik"
          )}
        </h1>
      </div>

      {/* Search form */}
      <form method="GET" className="flex gap-2 mb-10">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Cari judul komik..."
          autoFocus
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition text-sm"
        >
          Cari
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="py-10 text-center text-red-500 text-sm">{error}</div>
      )}

      {/* No query */}
      {!query && !error && (
        <div className="py-20 text-center text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p>Ketik judul komik di atas untuk mencari.</p>
        </div>
      )}

      {/* No results */}
      {query && results && results.items.length === 0 && (
        <div className="py-20 text-center text-gray-400">
          <p className="text-4xl mb-3">😕</p>
          <p>Tidak ada hasil untuk &quot;{query}&quot;.</p>
        </div>
      )}

      {/* Results grid */}
      {results && results.items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {results.items.map((comic) => (
            <Link
              key={comic.mangaSlug}
              href={`/komik/${comic.mangaSlug}`}
              className="group flex gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-sm hover:shadow-md transition-all"
            >
              {/* Cover */}
              <div className="flex-shrink-0 w-16 h-22 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={comic.thumbnail}
                  alt={comic.title}
                  className="w-16 h-full object-cover"
                />
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {comic.title}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                  {comic.genre}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                    {comic.latestChapter}
                  </span>
                  <span className="text-xs text-gray-400">{comic.readers}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
