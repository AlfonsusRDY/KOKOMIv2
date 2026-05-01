"use client";

import Link from "next/link";
import { useFavorites } from "@/hooks/useComicStorage";
import { useLocale } from "@/app/components/localeProvider";

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const { t } = useLocale();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium mb-4 transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-secondary)' }}>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {t.back || "Back"}
        </Link>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Favorites
        </h1>
      </div>

      {favorites.length === 0 ? (
        <div className="py-24 text-center">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'var(--bg-raised)' }}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--text-tertiary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No favorites yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {favorites.map((comic) => (
            <Link
              key={comic.slug}
              href={`/komik/${comic.slug}`}
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={comic.thumbnail} alt={comic.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-sm line-clamp-2 mb-2" style={{ color: 'var(--text-primary)' }}>
                  {comic.title}
                </h2>
                <span
                  className="chip"
                  style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
                >
                  {comic.type}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
