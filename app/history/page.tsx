"use client";

import Link from "next/link";
import { useHistory } from "@/hooks/useComicStorage";
import { useLocale } from "@/app/components/localeProvider";

export default function HistoryPage() {
  const { history, clearHistory } = useHistory();
  const { t } = useLocale();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium mb-4 transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t.back || "Back"}
          </Link>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Reading History
          </h1>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs px-3 py-2 rounded-xl transition-all duration-150 font-medium"
            style={{ background: 'var(--danger-subtle)', color: 'var(--danger)', border: '1px solid rgba(255,69,58,0.2)' }}
          >
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="py-24 text-center">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'var(--bg-raised)' }}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--text-tertiary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No history yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {history.map((item) => (
            <Link
              key={item.slug}
              href={`/komik/${item.slug}/chapter/${item.lastChapter}`}
              className="group flex gap-4 p-4 rounded-2xl transition-all duration-150"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-border)';
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-raised)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)';
              }}
            >
              <div className="flex-shrink-0 w-14 h-20 rounded-xl overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                {item.thumbnail ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--text-tertiary)' }}>?</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-sm line-clamp-2 mb-2" style={{ color: 'var(--text-primary)' }}>
                  {item.title}
                </h2>
                <div className="flex items-center gap-2">
                  <span
                    className="chip"
                    style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
                  >
                    Ch. {item.lastChapter}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
