"use client";

import Link from "next/link";
import type { KomikItem, TerbaruItem } from "@/lib/api";

export function LatestCard({ comic }: { comic: TerbaruItem }) {
  return (
    <Link
      href={`/komik/${comic.mangaSlug}`}
      className="group flex gap-4 p-4 rounded-xl transition-all duration-200 hover-card-border"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      <div className="relative flex-shrink-0 w-16 h-20 sm:w-20 sm:h-28 rounded-lg overflow-hidden"
        style={{ backgroundColor: 'var(--bg-raised)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={comic.thumbnail} alt={comic.title}
          className="w-full h-full object-cover" loading="lazy" decoding="async" />
        {comic.isColored && (
          <span className="absolute top-1 left-1 text-[9px] font-bold px-1 rounded"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>Color</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>{comic.type}</span>
          <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>·</span>
          <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{comic.genre}</span>
        </div>
        <h3 className="font-bold line-clamp-2 text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
          {comic.title}
        </h3>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: 'var(--bg-raised)', color: 'var(--accent)' }}>
            {comic.latestChapterTitle}
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--success)' }}>{comic.updateCountText}</span>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{comic.updateTime}</span>
        </div>
      </div>
      <div className="hidden sm:flex items-center text-lg" style={{ color: 'var(--border)' }}>&rarr;</div>
    </Link>
  );
}

export function PopularRow({ comic, rank }: { comic: KomikItem; rank: number }) {
  return (
    <Link href={`/komik/${comic.mangaSlug}`}
      className="group flex items-center gap-3 py-3 -mx-2 px-2 rounded-lg transition"
      style={{ borderBottom: '1px solid var(--border)' }}>
      <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-md text-xs font-black"
        style={{ backgroundColor: rank <= 3 ? 'var(--accent)' : 'var(--bg-raised)', color: rank <= 3 ? '#fff' : 'var(--text-secondary)' }}>
        {rank}
      </span>
      <div className="flex-shrink-0 w-8 h-10 rounded overflow-hidden" style={{ backgroundColor: 'var(--bg-raised)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={comic.thumbnail} alt={comic.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold line-clamp-1" style={{ color: 'var(--text-primary)' }}>{comic.title}</p>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{comic.genre}</p>
      </div>
    </Link>
  );
}
