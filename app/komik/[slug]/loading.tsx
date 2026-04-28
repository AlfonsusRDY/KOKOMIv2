// Streaming skeleton for comic detail page
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 animate-pulse">
      {/* Backdrop placeholder */}
      <div className="h-52 bg-gray-200 dark:bg-gray-800" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-36 pb-16">
        {/* Header skeleton */}
        <section className="flex flex-col sm:flex-row gap-6 mb-8 mt-4">
          <div className="flex-shrink-0 mx-auto sm:mx-0 w-40 h-56 sm:w-48 rounded-2xl bg-gray-300 dark:bg-gray-700 shadow-2xl" />
          <div className="flex-1 space-y-3 py-2">
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
          </div>
        </section>

        {/* Chapter list skeleton */}
        <div className="space-y-2 mt-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-1/3 mb-4" />
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded hidden sm:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
