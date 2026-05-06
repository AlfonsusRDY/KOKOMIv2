"use client";

import { useMemo } from "react";
import { useFavorites } from "@/hooks/useComicStorage";
import HomePosterCarousel from "./homePosterCarousel";
import type { HomePosterItem } from "./homePosterCarousel";

export default function HomeFollowedChapters({ latestItems }: { latestItems: HomePosterItem[] }) {
  const { favorites } = useFavorites();

  const followedItems = useMemo(() => {
    if (!favorites.length) return [];

    const favoriteSlugs = new Set(favorites.map((item) => item.slug));
    const matches = latestItems.filter((item) => favoriteSlugs.has(item.slug));

    if (matches.length) return matches;

    return favorites.map((item) => ({
      title: item.title,
      slug: item.slug,
      thumbnail: item.thumbnail,
      chapter: item.type || "Favorite",
      time: "",
      type: item.type,
    }));
  }, [favorites, latestItems]);

  if (!favorites.length) return null;

  return (
    <HomePosterCarousel
      title="New Chapters from Followed Comics"
      items={followedItems}
      moreHref="/favorites"
    />
  );
}
