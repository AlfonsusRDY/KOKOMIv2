"use client";

import Link from "next/link";
import { useLocale } from "@/app/components/localeProvider";
import { useFavorites } from "@/hooks/useComicStorage";

interface Props {
  title: string;
  thumbnail: string;
  status: string;
  author: string | null;
  type: string | null;
  genres: string[];
  sinopsis: string;
  chapterCount: number;
  readers: string | null;
  slug: string;
}

export default function ComicDetailHero({
  title, thumbnail, status, author, type, genres, sinopsis, chapterCount, readers, slug
}: Props) {
  const { t } = useLocale();
  const isOngoing = status.toLowerCase().includes("ongoing") || status.toLowerCase().includes("berlangsung");
  
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const isFav = isFavorite(slug);

  const toggleFav = () => {
    if (isFav) {
      removeFavorite(slug);
    } else {
      addFavorite({ slug, title, thumbnail, type: type || 'Unknown' });
    }
  };

  return (
    <>
      <Link href="/" className="inline-flex items-center gap-1 text-sm mb-4 transition-colors hover:opacity-80"
        style={{ color: 'var(--text-secondary)' }}>
        &larr; {t.home}
      </Link>

      <section className="flex flex-col sm:flex-row gap-6 mb-8">
        {/* Cover */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail}
            alt={title}
            className="w-40 h-56 sm:w-48 object-cover rounded-2xl shadow-2xl"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
          />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold mb-2 leading-tight"
              style={{ color: 'var(--text-primary)' }}>
              {title}
            </h1>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {status && (
                <span className="px-3 py-1 text-xs font-bold rounded-full"
                  style={{
                    backgroundColor: isOngoing
                      ? 'rgba(76,175,125,0.15)'
                      : 'var(--bg-raised)',
                    color: isOngoing ? 'var(--success)' : 'var(--text-secondary)',
                  }}>
                  {status}
                </span>
              )}
              {type && (
                <span className="px-3 py-1 text-xs font-bold rounded-full"
                  style={{ backgroundColor: 'var(--bg-raised)', color: 'var(--text-secondary)' }}>
                  {type}
                </span>
              )}
              {genres.map((g) => (
                <span key={g} className="px-3 py-1 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor: 'rgba(45,156,219,0.12)',
                    color: 'var(--accent)',
                    border: '1px solid rgba(45,156,219,0.25)',
                  }}>
                  {g}
                </span>
              ))}
            </div>

            {author && (
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                {t.author} <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{author}</span>
              </p>
            )}

            <p className="text-sm line-clamp-4 leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              {sinopsis}
            </p>
          </div>

          {/* Stats & Actions */}
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {chapterCount.toLocaleString()}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t.chapterLabel}</p>
            </div>
            {readers && (
              <div>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{readers}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t.readers}</p>
              </div>
            )}
            <div className="ml-auto sm:ml-0">
              <button
                onClick={toggleFav}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{
                  backgroundColor: isFav ? 'rgba(239,68,68,0.1)' : 'var(--bg-raised)',
                  color: isFav ? '#ef4444' : 'var(--text-primary)',
                  border: `1px solid ${isFav ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
                }}
              >
                {isFav ? '♥ Favorited' : '♡ Add to Favorites'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
