"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useLocale } from "@/app/components/localeProvider";

interface ChapterImage {
  src: string;
  alt: string;
  id: string;
  fallbackSrc: string;
}

interface Props {
  images: ChapterImage[];
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
    <div ref={containerRef} className="w-full">
      {status !== "loaded" && status !== "error" && (
        <div className="w-full animate-pulse" style={{ minHeight: "600px", backgroundColor: "#1a1c24" }} />
      )}
      {status === "error" && (
        <div className="w-full flex flex-col items-center justify-center text-sm py-16 gap-2"
          style={{ backgroundColor: "#0D0F14", color: "var(--text-secondary)" }}>
          <span className="text-2xl font-bold" style={{ color: "var(--warning)" }}>!</span>
          <span>{t.pageFailed(index + 1)}</span>
        </div>
      )}
      {(status === "loading" || status === "loaded") && (
        <img ref={imgRef} src={src} alt={image.alt ?? `Page ${index + 1}`}
          onLoad={handleLoad} onError={handleError}
          className={`w-full block transition-opacity duration-300 ${status === "loaded" ? "opacity-100" : "opacity-0 absolute pointer-events-none"}`}
          decoding="async" fetchPriority={index < 3 ? "high" : "auto"} />
      )}
    </div>
  );
}

export default function ChapterImages({ images }: Props) {
  const { t } = useLocale();
  if (!images || images.length === 0) {
    return (
      <div className="py-20 text-center" style={{ color: "var(--text-secondary)" }}>
        <p>{t.chapterImagesUnavailable}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      {images.map((img, i) => <MangaPage key={img.id ?? i} image={img} index={i} />)}
    </div>
  );
}