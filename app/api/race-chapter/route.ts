/**
 * Race Chapter API Route
 *
 * Fires all available sources for a chapter simultaneously,
 * returns the fastest successful result.
 *
 * POST /api/race-chapter
 * Body: { slug, chapterNumber, entries: UnifiedChapter[] }
 * Returns: RaceResult
 */

import { NextRequest, NextResponse } from "next/server";
import { raceChapterImages } from "@/lib/aggregator";
import type { UnifiedChapter } from "@/types/source.types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, chapterNumber, entries } = body as {
      slug: string;
      chapterNumber: string;
      entries: UnifiedChapter[];
    };

    if (!slug || !chapterNumber || !Array.isArray(entries) || !entries.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await raceChapterImages(slug, chapterNumber, entries);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[race-chapter]", err?.message);
    return NextResponse.json({ error: err?.message ?? "Race failed" }, { status: 502 });
  }
}
