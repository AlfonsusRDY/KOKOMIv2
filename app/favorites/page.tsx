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
        <Link href="/" className="text-sm mb-4 inline-block transition-colors hover:opacity-80"
          style={{ color: 'var(--accent)' }}>
          &larr; {t.back || "Back"}
        </Link>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Favorites
        </h1>
      </div>

      {favorites.length === 0 ? (
        <div className="py-20 text-center" style={{ color: 'var(--text-secondary)' }}>
          <p className="text-4xl mb-3 opacity-20">♥</p>
          <p>No favorites yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favorites.map((comic) => (
            <Link
              key={comic.slug}
              href={`/komik/${comic.slug}`}
              className="group flex gap-4 p-4 rounded-2xl transition-all"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div className="flex-shrink-0 w-16 rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-raised)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={comic.thumbnail} alt={comic.title} className="w-16 h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-sm line-clamp-2 transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {comic.title}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: 'var(--bg-raised)', color: 'var(--accent)' }}>
                    {comic.type}
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
