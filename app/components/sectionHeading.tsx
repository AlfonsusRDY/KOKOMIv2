"use client";

import { useLocale } from "./localeProvider";

interface SectionHeadingProps {
  titleKey: "latestUpdates" | "popularComics";
  subtitleKey: "latestFirst" | "topTen";
}

export default function SectionHeading({ titleKey, subtitleKey }: SectionHeadingProps) {
  const { t } = useLocale();
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
        {t[titleKey]}
      </h2>
      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {t[subtitleKey]}
      </span>
    </div>
  );
}
