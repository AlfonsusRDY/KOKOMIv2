"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/app/components/localeProvider";
import DownloadButton from "./downloadButton";
import SourceBadge from "@/app/components/sourceBadge";
import type { ChapterImage } from "@/lib/api";
import type { SourceId } from "@/types/source.types";

interface SourceInfo {
  sourceId: SourceId;
  sourceName: string;
  status: "resolved" | "timeout" | "error" | "pending";
  resolvedInMs?: number;
}

interface Props {
  slug: string;
  number: string;
  comicTitle: string;
  prevChapter: string | null;
  nextChapter: string | null;
  images: ChapterImage[];
  /** Active source serving images */
  activeSourceId?: SourceId;
  activeSourceName?: string;
  resolvedInMs?: number | null;
  /** All sources attempted in the race */
  availableSources?: SourceInfo[];
  /** Callback when user manually switches source */
  onSwitchSource?: (sourceId: SourceId) => void;
}

export default function ChapterReaderNav({
  slug, number, comicTitle, prevChapter, nextChapter, images,
  activeSourceId, activeSourceName, resolvedInMs, availableSources, onSwitchSource,
}: Props) {
  const { t } = useLocale();
  const [showSources, setShowSources] = useState(false);

  return (
    <div
      data-reader-chrome
      className="sticky top-20 z-30 border-b"
      style={{
        background: "rgba(13,13,15,0.90)",
        borderColor: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Back to comic */}
        <Link
          href={`/komik/${slug}`}
          className="flex items-center gap-2 text-xs font-medium transition-opacity hover:opacity-70 truncate max-w-[30%] flex-shrink-0"
          style={{ color: "var(--text-secondary)" }}
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="truncate">{comicTitle}</span>
        </Link>

        {/* Chapter number */}
        <span
          className="text-xs font-bold flex-shrink-0 px-3 py-1.5 rounded-lg"
          style={{ background: "var(--bg-raised)", color: "var(--text-primary)" }}
        >
          Ch. {number}
        </span>

        {/* Source indicator (center) */}
        {activeSourceId && (
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowSources((v) => !v)}
              className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
              title="Switch source"
            >
              <SourceBadge sourceId={activeSourceId} short />
              {resolvedInMs != null && (
                <span className="hidden sm:block text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                  {resolvedInMs}ms
                </span>
              )}
              {availableSources && availableSources.length > 1 && (
                <svg
                  width="10" height="10" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2.5}
                  style={{ color: "var(--text-tertiary)" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            {/* Source switcher dropdown */}
            {showSources && availableSources && availableSources.length > 1 && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSources(false)}
                />
                <div
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-20 rounded-xl overflow-hidden min-w-[180px]"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-strong)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  }}
                >
                  <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>
                    Switch Source
                  </p>
                  {availableSources.map((s) => (
                    <button
                      key={s.sourceId}
                      onClick={() => {
                        onSwitchSource?.(s.sourceId);
                        setShowSources(false);
                      }}
                      disabled={s.status === "error" || s.status === "timeout"}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors"
                      style={{
                        opacity: s.status === "error" || s.status === "timeout" ? 0.4 : 1,
                        cursor: s.status === "error" || s.status === "timeout" ? "not-allowed" : "pointer",
                      }}
                      onMouseEnter={(e) => { if (s.status === "resolved") (e.currentTarget.style.background = "var(--bg-raised)"); }}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <SourceBadge sourceId={s.sourceId} />
                      <div className="flex items-center gap-1.5 ml-auto">
                        {s.resolvedInMs != null && (
                          <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                            {s.resolvedInMs}ms
                          </span>
                        )}
                        {s.sourceId === activeSourceId && (
                          <span className="text-[10px] font-bold" style={{ color: "var(--accent)" }}>✓</span>
                        )}
                        {(s.status === "error" || s.status === "timeout") && (
                          <span className="text-[10px]" style={{ color: "var(--warning, #f0a500)" }}>✗</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <DownloadButton comicTitle={comicTitle} chapterNumber={number} images={images} />
          {prevChapter && (
            <Link
              href={`/komik/${slug}/chapter/${prevChapter}`}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150"
              style={{ background: "var(--bg-raised)", color: "var(--text-secondary)" }}
            >
              ← {t.prev}
            </Link>
          )}
          {nextChapter && (
            <Link
              href={`/komik/${slug}/chapter/${nextChapter}`}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              {t.next} →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
