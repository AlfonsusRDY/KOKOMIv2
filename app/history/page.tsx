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
          <Link href="/" className="text-sm mb-4 inline-block transition-colors hover:opacity-80"
            style={{ color: 'var(--accent)' }}>
            &larr; {t.back || "Back"}
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Reading History
          </h1>
        </div>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="text-sm px-3 py-1.5 rounded transition-colors"
            style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
          >
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="py-20 text-center" style={{ color: 'var(--text-secondary)' }}>
          <p className="text-4xl mb-3 opacity-20">&#128366;</p>
          <p>No history yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {history.map((item) => (
            <Link
              key={item.slug}
              href={`/komik/${item.slug}/chapter/${item.lastChapter}`}
              className="group flex gap-4 p-4 rounded-2xl transition-all"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div className="flex-shrink-0 w-16 rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-raised)' }}>
                {item.thumbnail ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={item.thumbnail} alt={item.title} className="w-16 h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-50">?</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-sm line-clamp-2 transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {item.title}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: 'var(--bg-raised)', color: 'var(--accent)' }}>
                    Ch. {item.lastChapter}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
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
