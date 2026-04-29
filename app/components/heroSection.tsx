"use client";

import { useLocale } from "./localeProvider";
import SearchBar from "./searchBar";

export default function HeroSection() {
  const { t } = useLocale();
  return (
    <section
      className="py-14 px-4"
      style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <div
          className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase"
          style={{
            backgroundColor: 'var(--bg-raised)',
            color: 'var(--accent)',
            border: '1px solid var(--border)',
          }}
        >
          {t.heroBadge}
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 tracking-tight leading-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {t.heroTitle}{" "}
          <span style={{ color: 'var(--accent)' }}>{t.heroTitleHighlight}</span>
        </h1>
        <p className="mb-8 text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
          {t.heroSubtitle}
        </p>
        <SearchBar />
      </div>
    </section>
  );
}
