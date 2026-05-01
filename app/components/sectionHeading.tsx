"use client";

import { useLocale } from "./localeProvider";

interface SectionHeadingProps {
  titleKey: "latestUpdates" | "popularComics";
  subtitleKey: "latestFirst" | "topTen";
}

export default function SectionHeading({ titleKey, subtitleKey }: SectionHeadingProps) {
  const { t } = useLocale();
  return (
    <div className="flex items-end justify-between mb-6">
      <div className="flex items-center gap-3">
        {/* Accent mark */}
        <span
          className="block w-1 h-5 rounded-full flex-shrink-0"
          style={{ background: 'var(--accent)' }}
        />
        <h2 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {t[titleKey]}
        </h2>
      </div>
      <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
        {t[subtitleKey]}
      </span>
    </div>
  );
}
