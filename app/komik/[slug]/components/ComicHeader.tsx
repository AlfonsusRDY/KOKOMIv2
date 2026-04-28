"use client";

interface Props {
  title: string;
  thumbnail: string;
  author?: string;
  status?: string;
  genre?: string[];
  description: string;
  chapterCount?: number;
  views?: string;
  rating?: number;
}

export default function ComicHeader({
  title,
  thumbnail,
  author,
  status,
  genre,
  description,
  chapterCount,
  views,
  rating,
}: Props) {
  const isOngoing = status === "Ongoing";

  return (
    <section className="flex flex-col sm:flex-row gap-6 mb-6">
      {/* Cover */}
      <div className="flex-shrink-0 mx-auto sm:mx-0">
        <img
          src={thumbnail}
          alt={title}
          className="w-40 h-56 sm:w-48 sm:h-68 object-cover rounded-2xl shadow-2xl ring-4 ring-white dark:ring-gray-800"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${title}/200/280`;
          }}
        />
      </div>

      {/* Details */}
      <div className="flex flex-col justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
            {title}
          </h1>

          <div className="flex flex-wrap gap-2 mb-3">
            {status && (
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full ${
                  isOngoing
                    ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                {status}
              </span>
            )}
            {genre?.map((g) => (
              <span
                key={g}
                className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900"
              >
                {g}
              </span>
            ))}
          </div>

          {author && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Penulis:{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">{author}</span>
            </p>
          )}

          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4 leading-relaxed mb-4">
            {description}
          </p>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-5">
          {chapterCount && (
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{chapterCount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Chapter</p>
            </div>
          )}
          {views && (
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{views}</p>
              <p className="text-xs text-gray-500">Views</p>
            </div>
          )}
          {rating && (
            <div>
              <p className="text-lg font-bold text-yellow-500">★ {rating.toFixed(1)}</p>
              <p className="text-xs text-gray-500">Rating</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
