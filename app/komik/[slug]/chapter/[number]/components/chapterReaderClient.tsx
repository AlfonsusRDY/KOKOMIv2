"use client";

import { useSearchParams } from "next/navigation";
import { useRaceChapter } from "@/hooks/useRaceChapter";
import ChapterImages from "./chapterImages";
import ChapterReaderNav from "./chapterReaderNav";
import ReaderFocusMode from "./readerFocusMode";
import type { MultiSourceChapter } from "@/types/source.types";
import type { SourceId } from "@/types/source.types";

interface Props {
  slug: string;
  number: string;
  comicTitle: string;
  thumbnail: string | null;
  multiChapter?: MultiSourceChapter;
  prevChapter: string | null;
  nextChapter: string | null;
}

export default function ChapterReaderClient({
  slug, number, comicTitle, thumbnail,
  multiChapter, prevChapter, nextChapter,
}: Props) {
  const searchParams = useSearchParams();
  const preferredSource = (searchParams.get("source") ?? undefined) as SourceId | undefined;

  const entries = multiChapter?.entries ?? [];

  const { status, images, activeSourceId, activeSourceName, resolvedInMs, availableSources, switchSource } =
    useRaceChapter(slug, number, entries, preferredSource);

  const navImages = images?.map((img, i) => ({
    src: img.src,
    alt: img.alt ?? `Page ${i + 1}`,
    id: String(i),
    fallbackSrc: img.fallbackSrc ?? img.src,
  })) ?? [];

  const chapterImages = images?.map((img, i) => ({
    src: img.src,
    alt: img.alt ?? `Page ${i + 1}`,
    id: String(i),
    fallbackSrc: img.fallbackSrc ?? img.src,
  })) ?? [];

  return (
    <>
      <ReaderFocusMode />

      <ChapterReaderNav
        slug={slug}
        number={number}
        comicTitle={comicTitle}
        prevChapter={prevChapter}
        nextChapter={nextChapter}
        images={navImages}
        activeSourceId={activeSourceId ?? undefined}
        activeSourceName={activeSourceName ?? undefined}
        resolvedInMs={resolvedInMs}
        availableSources={availableSources}
        onSwitchSource={switchSource}
      />

      <div className="mx-auto max-w-2xl px-0 py-6 sm:px-3">
        {status === "racing" && (
          <div className="flex flex-col items-center gap-3 py-20" style={{ color: "var(--text-secondary)" }}>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ background: "var(--accent)", animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-sm">Racing sources…</p>
          </div>
        )}

        {status === "error" && (
          <div className="py-20 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            <p className="text-2xl mb-3 opacity-20">!</p>
            <p>All sources failed to load this chapter.</p>
          </div>
        )}

        {status === "resolved" && chapterImages.length > 0 && (
          <ChapterImages
            images={chapterImages}
            slug={slug}
            chapterNumber={number}
            comicTitle={comicTitle}
            thumbnail={thumbnail}
            sourceId={activeSourceId}
            sourceName={activeSourceName}
          />
        )}
      </div>
    </>
  );
}
