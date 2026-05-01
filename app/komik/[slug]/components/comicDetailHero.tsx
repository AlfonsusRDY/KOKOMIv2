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
    if (isFav) removeFavorite(slug);
    else addFavorite({ slug, title, thumbnail, type: type || 'Unknown' });
  };

  return (
    <>
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 transition-opacity hover:opacity-70"
        style={{ color: 'var(--text-secondary)' }}
      >
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        {t.home}
      </Link>

      <section className="flex flex-col sm:flex-row gap-8 mb-10">
        {/* Cover art */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.65)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnail}
              alt={title}
              className="w-44 sm:w-52 object-cover block"
              style={{ aspectRatio: '3/4' }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4 flex-1">
          {/* Title */}
          <div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              {title}
            </h1>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5">
              {status && (
                <span
                  className="chip"
                  style={{
                    background: isOngoing ? 'var(--success-subtle)' : 'var(--bg-raised)',
                    color: isOngoing ? 'var(--success)' : 'var(--text-secondary)',
                    border: `1px solid ${isOngoing ? 'rgba(48,209,88,0.25)' : 'var(--border-strong)'}`,
                  }}
                >
                  {isOngoing && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: 'var(--success)' }}
                    />
                  )}
                  {status}
                </span>
              )}
              {type && (
                <span
                  className="chip"
                  style={{
                    background: 'var(--bg-raised)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-strong)',
                  }}
                >
                  {type}
                </span>
              )}
              {genres.map((g) => (
                <span
                  key={g}
                  className="chip"
                  style={{
                    background: 'var(--accent-subtle)',
                    color: 'var(--accent)',
                    border: '1px solid var(--accent-border)',
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Author */}
          {author && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t.author}{' '}
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {author}
              </span>
            </p>
          )}

          {/* Synopsis */}
          <p
            className="text-sm line-clamp-4 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {sinopsis}
          </p>

          {/* Stats + Actions */}
          <div className="flex flex-wrap items-end gap-6 mt-auto pt-2">
            <div>
              <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {chapterCount.toLocaleString()}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {t.chapterLabel}
              </p>
            </div>
            {readers && (
              <div>
                <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {readers}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  {t.readers}
                </p>
              </div>
            )}
            <div className="ml-auto sm:ml-0">
              <button
                onClick={toggleFav}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95"
                style={{
                  background: isFav ? 'var(--danger-subtle)' : 'var(--bg-raised)',
                  color: isFav ? 'var(--danger)' : 'var(--text-primary)',
                  border: `1px solid ${isFav ? 'rgba(255,69,58,0.3)' : 'var(--border-strong)'}`,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {isFav ? 'Favorited' : 'Add to Favorites'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
