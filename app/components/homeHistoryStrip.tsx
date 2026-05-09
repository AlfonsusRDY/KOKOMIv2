"use client";

import { useMemo } from "react";
import { useHistory } from "@/hooks/useComicStorage";
import HomePosterCarousel from "./homePosterCarousel";
import type { HomePosterItem } from "./homePosterCarousel";

function timeAgo(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function HomeHistoryStrip() {
  const { history } = useHistory();

  const items = useMemo<HomePosterItem[]>(
    () =>
      history.map((item) => {
        const page = item.lastImageIndex + 1;
        const params = new URLSearchParams({ page: String(page) });
        if (item.sourceId) params.set("source", item.sourceId);

        return {
          title: item.title,
          slug: item.slug,
          thumbnail: item.thumbnail,
          chapter: `Ch.${item.lastChapter} / ${item.totalImages ? page : "?"}`,
          time: timeAgo(item.timestamp),
          href: `/komik/${item.slug}/chapter/${item.lastChapter}?${params.toString()}#page-${page}`,
          progress: item.progress,
        };
      }),
    [history]
  );

  if (!items.length) {
    return (
      <section>
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Reading History
          </h2>
        </div>
        <div
          className="flex min-h-36 items-center justify-center rounded-md border border-dashed px-6 text-center text-sm"
          style={{ borderColor: 'var(--border-strong)', color: 'var(--text-tertiary)' }}
        >
          Belum ada riwayat baca.
        </div>
      </section>
    );
  }

  return <HomePosterCarousel title="Reading History" items={items} moreHref="/history" />;
}
