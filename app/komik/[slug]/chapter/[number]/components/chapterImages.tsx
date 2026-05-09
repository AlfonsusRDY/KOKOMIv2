"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/app/components/localeProvider";
import { useHistory } from "@/hooks/useComicStorage";
import type { SourceId } from "@/types/source.types";

interface ChapterImage {
  src: string;
  alt: string;
  id: string;
  fallbackSrc: string;
}

interface Props {
  images: ChapterImage[];
  slug: string;
  chapterNumber: string;
  comicTitle: string;
  thumbnail: string | null;
  sourceId?: SourceId | null;
  sourceName?: string | null;
}

function MangaPage({ image, index }: { image: ChapterImage; index: number }) {
  const { t } = useLocale();
  const [status, setStatus] = useState<"idle" | "loading" | "loaded" | "error">(
    index < 3 ? "loading" : "idle"
  );
  const [src, setSrc] = useState(image.src);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (index < 3) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStatus("loading");
          observer.disconnect();
        }
      },
      { rootMargin: "800px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  const handleLoad = useCallback(() => setStatus("loaded"), []);
  const handleError = useCallback(() => {
    if (src === image.src && image.fallbackSrc) {
      setSrc(image.fallbackSrc);
    } else {
      setStatus("error");
    }
  }, [src, image.src, image.fallbackSrc]);

  return (
    <div ref={containerRef} id={`page-${index + 1}`} data-page-index={index} className="w-full scroll-mt-36">
      {status !== "loaded" && status !== "error" && (
        <div className="w-full animate-pulse" style={{ minHeight: "600px", backgroundColor: "#1a1c24" }} />
      )}
      {status === "error" && (
        <div
          className="flex w-full flex-col items-center justify-center gap-2 py-16 text-sm"
          style={{ backgroundColor: "#0D0F14", color: "var(--text-secondary)" }}
        >
          <span className="text-2xl font-bold" style={{ color: "var(--warning)" }}>
            !
          </span>
          <span>{t.pageFailed(index + 1)}</span>
        </div>
      )}
      {(status === "loading" || status === "loaded") && (
        <img
          ref={imgRef}
          src={src}
          alt={image.alt ?? `Page ${index + 1}`}
          onLoad={handleLoad}
          onError={handleError}
          className={`block w-full transition-opacity duration-300 ${
            status === "loaded" ? "opacity-100" : "absolute opacity-0 pointer-events-none"
          }`}
          decoding="async"
          fetchPriority={index < 3 ? "high" : "auto"}
        />
      )}
    </div>
  );
}

export default function ChapterImages({
  images,
  slug,
  chapterNumber,
  comicTitle,
  thumbnail,
  sourceId,
  sourceName,
}: Props) {
  const { t } = useLocale();
  const { addToHistory } = useHistory();
  const lastSavedIndexRef = useRef<number | null>(null);
  const resumeTargetIndexRef = useRef<number | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromQuery = Number(urlParams.get("page"));
    const fromHash = Number(window.location.hash.replace("#page-", ""));
    const targetPage = Number.isFinite(fromQuery) && fromQuery > 0 ? fromQuery : fromHash;

    if (!targetPage || !images.length) return;

    const clampedPage = Math.min(images.length, Math.max(1, targetPage));
    resumeTargetIndexRef.current = clampedPage - 1;

    const targetId = `page-${clampedPage}`;
    const scrollToTarget = () => {
      document.getElementById(targetId)?.scrollIntoView({ block: "start" });
    };

    window.requestAnimationFrame(scrollToTarget);
    const firstTimer = window.setTimeout(scrollToTarget, 150);
    const secondTimer = window.setTimeout(scrollToTarget, 800);
    const thirdTimer = window.setTimeout(scrollToTarget, 1800);
    const fourthTimer = window.setTimeout(scrollToTarget, 3200);

    const target = document.getElementById(targetId);
    const resizeObserver =
      typeof ResizeObserver !== "undefined" && target
        ? new ResizeObserver(() => scrollToTarget())
        : null;

    resizeObserver?.observe(document.body);
    const stopResizeTimer = window.setTimeout(() => resizeObserver?.disconnect(), 4200);

    return () => {
      window.clearTimeout(firstTimer);
      window.clearTimeout(secondTimer);
      window.clearTimeout(thirdTimer);
      window.clearTimeout(fourthTimer);
      window.clearTimeout(stopResizeTimer);
      resizeObserver?.disconnect();
    };
  }, [images.length]);

  useEffect(() => {
    if (!images.length) return;

    const saveProgress = (index: number) => {
      const resumeTargetIndex = resumeTargetIndexRef.current;
      if (resumeTargetIndex !== null && index < resumeTargetIndex) return;
      if (resumeTargetIndex !== null && index >= resumeTargetIndex) {
        resumeTargetIndexRef.current = null;
      }

      if (lastSavedIndexRef.current === index) return;
      if (lastSavedIndexRef.current !== null && index < lastSavedIndexRef.current) return;
      lastSavedIndexRef.current = index;

      addToHistory({
        slug,
        title: comicTitle,
        thumbnail: thumbnail || "",
        lastChapter: chapterNumber,
        lastImageIndex: index,
        totalImages: images.length,
        progress: Math.round(((index + 1) / images.length) * 100),
        sourceId: sourceId ?? undefined,
        sourceName: sourceName ?? undefined,
      });
    };

    if (resumeTargetIndexRef.current === null) {
      saveProgress(0);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const focused = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!focused) return;

        const index = Number((focused.target as HTMLElement).dataset.pageIndex);
        if (Number.isFinite(index)) saveProgress(index);
      },
      {
        rootMargin: "-144px 0px -45% 0px",
        threshold: [0.2, 0.45, 0.7],
      }
    );

    document.querySelectorAll<HTMLElement>("[data-page-index]").forEach((page) => observer.observe(page));

    return () => observer.disconnect();
  }, [addToHistory, chapterNumber, comicTitle, images.length, slug, sourceId, sourceName, thumbnail]);

  if (!images || images.length === 0) {
    return (
      <div className="py-20 text-center" style={{ color: "var(--text-secondary)" }}>
        <p>{t.chapterImagesUnavailable}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {images.map((img, i) => (
        <MangaPage key={img.id ?? i} image={img} index={i} />
      ))}
    </div>
  );
}
