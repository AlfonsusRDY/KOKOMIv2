"use client";

import Link from "next/link";
import type { KomikItem, TerbaruItem } from "@/lib/api";

export function LatestCard({ comic }: { comic: TerbaruItem }) {
  return (
    <Link
      href={`/komik/${comic.mangaSlug}`}
      className="group flex flex-col rounded-xl overflow-hidden transition-transform duration-200 hover:-translate-y-1"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      <div className="relative w-full aspect-[3/4] overflow-hidden"
        style={{ backgroundColor: 'var(--bg-raised)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={comic.thumbnail} alt={comic.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async" />
        {comic.isColored && (
          <span className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>COLOR</span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2 pt-6 bg-gradient-to-t from-black/80 to-transparent">
          <span className="text-[10px] font-bold text-white uppercase">{comic.type}</span>
        </div>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold line-clamp-2 text-sm leading-tight mb-2" style={{ color: 'var(--text-primary)' }}>
          {comic.title}
        </h3>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xs px-2 py-0.5 rounded font-medium truncate max-w-[60%]"
            style={{ backgroundColor: 'var(--bg-raised)', color: 'var(--accent)' }}>
            {comic.latestChapterTitle}
          </span>
          <span className="text-[10px] whitespace-nowrap ml-2" style={{ color: 'var(--text-secondary)' }}>
            {comic.updateTime.replace(' lalu', '')}
          </span>
        </div>
      </div>
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
