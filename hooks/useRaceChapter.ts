"use client";

import { useEffect, useRef, useState } from "react";
import type { UnifiedChapter, UnifiedChapterImages, SourceId } from "@/types/source.types";

type RaceStatus = "racing" | "resolved" | "error";

interface RaceState {
  status: RaceStatus;
  images: UnifiedChapterImages["images"] | null;
  activeSourceId: SourceId | null;
  activeSourceName: string | null;
  resolvedInMs: number | null;
  availableSources: Array<{
    sourceId: SourceId;
    sourceName: string;
    status: "resolved" | "timeout" | "error" | "pending";
    resolvedInMs?: number;
  }>;
}

export function useRaceChapter(
  slug: string,
  chapterNumber: string,
  entries: UnifiedChapter[],
  /** If set, skip race and use this specific source */
  preferredSource?: SourceId
) {
  const [state, setState] = useState<RaceState>({
    status: "racing",
    images: null,
    activeSourceId: null,
    activeSourceName: null,
    resolvedInMs: null,
    availableSources: entries.map((e) => ({
      sourceId: e.sourceId,
      sourceName: e.sourceName,
      status: "pending",
    })),
  });

  const hasResolved = useRef(false);

  useEffect(() => {
    if (!entries.length) {
      setState((s) => ({ ...s, status: "error" }));
      return;
    }

    hasResolved.current = false;
    const startTime = Date.now();

    // Filter to preferred source if specified
    const toFetch = preferredSource
      ? entries.filter((e) => e.sourceId === preferredSource)
      : entries;

    if (!toFetch.length) {
      setState((s) => ({ ...s, status: "error" }));
      return;
    }

    // Fire race via server API
    fetch("/api/race-chapter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, chapterNumber, entries: toFetch }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Race API ${res.status}`);
        return res.json();
      })
      .then((result) => {
        if (hasResolved.current) return;
        hasResolved.current = true;

        const { winner, all } = result;
        setState({
          status: "resolved",
          images: winner.images,
          activeSourceId: winner.sourceId,
          activeSourceName: winner.sourceName,
          resolvedInMs: winner.resolvedInMs,
          availableSources: all.map((a: any) => ({
            sourceId: a.sourceId,
            sourceName: entries.find((e) => e.sourceId === a.sourceId)?.sourceName ?? a.sourceId,
            status: a.status,
            resolvedInMs: a.resolvedInMs,
          })),
        });
      })
      .catch(() => {
        if (!hasResolved.current) {
          setState((s) => ({ ...s, status: "error" }));
        }
      });

    return () => {
      hasResolved.current = true; // Cancel on unmount
    };
  }, [slug, chapterNumber, preferredSource]); // eslint-disable-line react-hooks/exhaustive-deps

  const switchSource = (sourceId: SourceId) => {
    hasResolved.current = false;
    setState((s) => ({ ...s, status: "racing", images: null, activeSourceId: null }));

    const entry = entries.find((e) => e.sourceId === sourceId);
    if (!entry) return;

    fetch("/api/race-chapter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, chapterNumber, entries: [entry] }),
    })
      .then((res) => res.json())
      .then((result) => {
        hasResolved.current = true;
        setState((s) => ({
          ...s,
          status: "resolved",
          images: result.winner.images,
          activeSourceId: result.winner.sourceId,
          activeSourceName: result.winner.sourceName,
          resolvedInMs: result.winner.resolvedInMs,
        }));
      })
      .catch(() => {
        setState((s) => ({ ...s, status: "error" }));
      });
  };

  return { ...state, switchSource };
}
