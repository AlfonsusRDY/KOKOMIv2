// Streaming skeleton for comic detail page
export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="h-64" style={{ background: 'var(--bg-surface)' }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 pb-20 relative">
        {/* Back link skeleton */}
        <div className="h-4 w-12 skeleton rounded-md mb-6" />

        {/* Comic hero skeleton */}
        <section className="flex flex-col sm:flex-row gap-8 mb-10">
          <div className="w-44 sm:w-52 rounded-2xl skeleton flex-shrink-0 mx-auto sm:mx-0" style={{ aspectRatio: '3/4' }} />
          <div className="flex-1 space-y-4 pt-2">
            <div className="h-7 skeleton rounded-lg w-3/4" />
            <div className="flex gap-2">
              <div className="h-5 w-20 skeleton rounded-full" />
              <div className="h-5 w-16 skeleton rounded-full" />
              <div className="h-5 w-16 skeleton rounded-full" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-3.5 skeleton rounded-md w-full" />
              <div className="h-3.5 skeleton rounded-md w-5/6" />
              <div className="h-3.5 skeleton rounded-md w-4/6" />
              <div className="h-3.5 skeleton rounded-md w-3/6" />
            </div>
            <div className="flex items-end gap-6 pt-4">
              <div>
                <div className="h-7 w-12 skeleton rounded-lg mb-1" />
                <div className="h-3 w-16 skeleton rounded-md" />
              </div>
              <div>
                <div className="h-7 w-16 skeleton rounded-lg mb-1" />
                <div className="h-3 w-12 skeleton rounded-md" />
              </div>
              <div className="h-10 w-32 skeleton rounded-xl ml-auto sm:ml-0" />
            </div>
          </div>
        </section>

        {/* Chapter list skeleton */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="h-5 w-28 skeleton rounded-lg" />
            <div className="h-9 w-32 skeleton rounded-xl" />
          </div>
          <div className="h-11 skeleton rounded-xl mb-3" />
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-4 py-4"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div className="w-12 h-6 skeleton rounded-lg flex-shrink-0" />
                <div className="flex-1 h-3.5 skeleton rounded-md" />
                <div className="w-16 h-3 skeleton rounded-md hidden sm:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
