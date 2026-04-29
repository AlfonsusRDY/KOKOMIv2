"use client";

import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { ChapterImage } from "@/lib/api";

interface Props {
  comicTitle: string;
  chapterNumber: string;
  images: ChapterImage[];
}

export default function DownloadButton({ comicTitle, chapterNumber, images }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    setProgress(0);

    try {
      const zip = new JSZip();
      let downloaded = 0;

      const fetchImage = async (img: ChapterImage) => {
        // Use our proxy to bypass CORS
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(img.src)}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`Failed to fetch ${img.src}`);
        const blob = await res.blob();
        return blob;
      };

      for (let i = 0; i < images.length; i++) {
        try {
          const blob = await fetchImage(images[i]);
          // extension heuristic
          const ext = images[i].src.split('.').pop()?.split('?')[0] || 'jpg';
          const fileName = `${(i + 1).toString().padStart(3, '0')}.${ext}`;
          zip.file(fileName, blob);
        } catch (err) {
          console.error("Failed to download image:", err);
        }
        downloaded++;
        setProgress(Math.round((downloaded / images.length) * 100));
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${comicTitle} - Chapter ${chapterNumber}.zip`);
    } catch (err) {
      console.error("Zip generation failed", err);
      alert("Failed to create zip file.");
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
        downloading ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"
      }`}
      style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
    >
      <span>&#11123;</span>
      {downloading ? `Downloading ${progress}%` : "Download"}
    </button>
  );
}
