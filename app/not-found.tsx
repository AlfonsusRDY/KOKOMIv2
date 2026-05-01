import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      {/* Large muted number */}
      <p
        className="text-[9rem] sm:text-[12rem] font-black leading-none tracking-tighter select-none mb-2"
        style={{ color: 'var(--bg-elevated)' }}
      >
        404
      </p>

      {/* Accent bar + heading */}
      <div className="flex items-center gap-3 mb-3">
        <span
          className="block w-1 h-5 rounded-full flex-shrink-0"
          style={{ background: 'var(--accent)' }}
        />
        <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          Page not found
        </h1>
      </div>

      <p className="text-sm max-w-xs mb-8" style={{ color: 'var(--text-secondary)' }}>
        Whatever you were looking for isn't here. It might have moved or never existed in the first place.
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          Go home
        </Link>
        <Link
          href="/search"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
          style={{
            background: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-strong)',
          }}
        >
          Search comics
        </Link>
      </div>
    </div>
  );
}
