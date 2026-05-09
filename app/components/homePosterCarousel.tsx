"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type HomePosterItem = {
  title: string;
  slug: string;
  thumbnail: string;
  chapter: string;
  time: string;
  type?: string;
  href?: string;
  progress?: number;
};

function useItemsPerPage() {
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1280) setItemsPerPage(5);
      else if (window.innerWidth >= 640) setItemsPerPage(3);
      else setItemsPerPage(2);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return itemsPerPage;
}

function CarouselControls({
  canPrev,
  canNext,
  onPrev,
  onNext,
  moreHref,
}: {
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  moreHref?: string;
}) {
  return (
    <div className="hidden items-center gap-1 sm:flex">
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        className="flex h-9 w-9 items-center justify-center rounded-md text-2xl leading-none transition-opacity disabled:opacity-35"
        style={{ background: 'var(--bg-surface)', color: 'var(--text-tertiary)' }}
        aria-label="Previous"
      >
        &lsaquo;
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className="flex h-9 w-9 items-center justify-center rounded-md text-2xl leading-none transition-opacity disabled:opacity-35"
        style={{ background: 'var(--bg-raised)', color: 'var(--text-primary)' }}
        aria-label="Next"
      >
        &rsaquo;
      </button>
      {moreHref ? (
        <Link
          href={moreHref}
          className="flex h-9 w-9 items-center justify-center rounded-md text-lg font-bold"
          style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
          aria-label="View more"
        >
          ...
        </Link>
      ) : null}
    </div>
  );
}

function PosterCard({ item, rank }: { item: HomePosterItem; rank?: number }) {
  return (
    <Link href={item.href || `/komik/${item.slug}`} className="group block min-w-0">
      <div className="relative aspect-[3/4] overflow-hidden rounded-md" style={{ background: 'var(--bg-raised)' }}>
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.title}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
            No cover
          </div>
        )}
        {rank ? (
          <span
            className="absolute right-2 top-1 text-2xl font-black leading-none text-white"
            style={{
              WebkitTextStroke: '1.5px rgba(0,0,0,0.85)',
              textShadow: '0 1px 4px rgba(0,0,0,0.85)',
            }}
          >
            {rank}
          </span>
        ) : null}
        {typeof item.progress === "number" ? (
          <span
            className="absolute right-2 top-2 rounded px-1.5 py-0.5 text-xs font-black leading-none"
            style={{ background: "var(--success)", color: "#111113", boxShadow: "0 2px 8px rgba(0,0,0,0.45)" }}
          >
            {item.progress}%
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 font-mono text-sm" style={{ color: 'var(--text-tertiary)' }}>
        <span className="truncate">{item.chapter}</span>
        <span className="shrink-0">{item.time}</span>
      </div>
      <h3 className="mt-2 line-clamp-2 text-center text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
        {item.title}
      </h3>
    </Link>
  );
}

export default function HomePosterCarousel({
  title,
  items,
  ranked = false,
  moreHref,
}: {
  title: string;
  items: HomePosterItem[];
  ranked?: boolean;
  moreHref?: string;
}) {
  const itemsPerPage = useItemsPerPage();
  const [page, setPage] = useState(0);
  const maxPage = Math.max(0, Math.ceil(items.length / itemsPerPage) - 1);

  useEffect(() => {
    setPage((current) => Math.min(current, maxPage));
  }, [maxPage]);

  const visibleItems = useMemo(() => {
    const start = page * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, itemsPerPage, page]);

  if (!items.length) return null;

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        <CarouselControls
          canPrev={page > 0}
          canNext={page < maxPage}
          onPrev={() => setPage((current) => Math.max(0, current - 1))}
          onNext={() => setPage((current) => Math.min(maxPage, current + 1))}
          moreHref={moreHref}
        />
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 xl:grid-cols-5">
        {visibleItems.map((item, index) => (
          <PosterCard
            key={`${item.slug}-${title}-${page}-${index}`}
            item={item}
            rank={ranked ? page * itemsPerPage + index + 1 : undefined}
          />
        ))}
      </div>
    </section>
  );
}
