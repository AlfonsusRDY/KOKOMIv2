"use client";

import Link from "next/link";
import type { KomikItem, TerbaruItem } from "@/lib/api";

export function LatestCard({ comic }: { comic: TerbaruItem }) {
  return (
    <Link
      href={`/komik/${comic.mangaSlug}`}
      className="group flex flex-col rounded-2xl overflow-hidden card-hover"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Cover */}
      <div
        className="relative w-full aspect-[3/4] overflow-hidden"
        style={{ background: 'var(--bg-raised)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={comic.thumbnail}
          alt={comic.title}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />

        {/* Colored badge */}
        {comic.isColored && (
          <span
            className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-md text-white"
            style={{ background: 'var(--accent)' }}
          >
            COLOR
          </span>
        )}

        {/* Type label & gradient */}
        <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)' }}>
          <span
            className="absolute bottom-2 left-2.5 text-[10px] font-bold tracking-widest uppercase text-white/80"
          >
            {comic.type}
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="p-3 flex flex-col gap-1.5">
        <h3
          className="font-semibold line-clamp-2 text-xs leading-snug"
          style={{ color: 'var(--text-primary)' }}
        >
          {comic.title}
        </h3>
        <div className="flex items-center justify-between mt-auto pt-1">
          <span
            className="text-[10px] px-2 py-0.5 rounded-md font-medium truncate max-w-[62%]"
            style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
          >
            {comic.latestChapterTitle}
          </span>
          <span
            className="text-[10px] whitespace-nowrap ml-1.5 flex-shrink-0"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {comic.updateTime.replace(' lalu', '')}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function PopularRow({ comic, rank }: { comic: KomikItem; rank: number }) {
  const isTop3 = rank <= 3;
  return (
    <Link
      href={`/komik/${comic.mangaSlug}`}
      className="group flex items-center gap-3 py-3 px-3 -mx-3 rounded-xl transition-all duration-150"
      style={{ borderBottom: '1px solid var(--border)' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-raised)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Rank badge */}
      <span
        className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg text-xs font-black"
        style={{
          background: isTop3 ? 'var(--accent)' : 'var(--bg-elevated)',
          color: isTop3 ? '#fff' : 'var(--text-tertiary)',
        }}
      >
        {rank}
      </span>

      {/* Thumbnail */}
      <div
        className="flex-shrink-0 w-9 h-12 rounded-lg overflow-hidden"
        style={{ background: 'var(--bg-raised)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={comic.thumbnail}
          alt={comic.title}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-semibold line-clamp-1 mb-0.5"
          style={{ color: 'var(--text-primary)' }}
        >
          {comic.title}
        </p>
        <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
          {comic.genre}
        </p>
      </div>

      {/* Arrow */}
      <svg
        className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: 'var(--accent)' }}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
