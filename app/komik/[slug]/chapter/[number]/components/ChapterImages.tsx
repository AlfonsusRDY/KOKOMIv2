"use client";

import { useEffect, useRef, useState, useCallback } from "react";

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
  const [status, setStatus] = useState<"idle" | "loading" | "loaded" | "error">(
    index < 3 ? "loading" : "idle"  // first 3 load immediately
  );
  const [src, setSrc] = useState(image.src);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // IntersectionObserver with 800px preload margin
  useEffect(() => {
    if (index < 3) return; // first 3 are already loading

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStatus("loading");
          observer.disconnect();
        }
      },
      { rootMargin: "800px 0px" } // preload 800px ahead of viewport
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  const handleLoad = useCallback(() => setStatus("loaded"), []);
  const handleError = useCallback(() => {
    if (src === image.src && image.fallbackSrc) {
      setSrc(image.fallbackSrc); // try fallback URL
    } else {
      setStatus("error");
    }
  }, [src, image.src, image.fallbackSrc]);

  return (
    <div ref={containerRef} className="w-full">
      {/* Skeleton shown while idle or loading */}
      {status !== "loaded" && status !== "error" && (
        <div
          className="w-full bg-gray-800 animate-pulse"
          style={{ minHeight: "600px" }}
        />
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="w-full flex flex-col items-center justify-center bg-gray-900 text-gray-500 text-sm py-16 gap-2">
          <span className="text-3xl">⚠️</span>
          <span>Halaman {index + 1} gagal dimuat</span>
        </div>
      )}

      {/* Actual image — rendered as soon as status = "loading" or "loaded" */}
      {(status === "loading" || status === "loaded") && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src}
          alt={image.alt ?? `Halaman ${index + 1}`}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full block transition-opacity duration-300 ${
            status === "loaded" ? "opacity-100" : "opacity-0 absolute pointer-events-none"
          }`}
          // no loading="lazy" — we control this ourselves via IntersectionObserver
          decoding="async"
          fetchPriority={index < 3 ? "high" : "auto"}
        />
      )}
    </div>
  );
}

export default function ChapterImages({ images }: Props) {
  if (!images || images.length === 0) {
    return (
      <div className="py-20 text-center text-gray-400">
        <p className="text-4xl mb-3">📄</p>
        <p>Gambar chapter tidak tersedia.</p>
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
