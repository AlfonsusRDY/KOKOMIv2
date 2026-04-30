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
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {["Manga", "Manhwa", "Manhua", "Action", "Romance", "Fantasy", "Comedy"].map((cat) => (
            <button
              key={cat}
              onClick={() => window.location.href = `/search?q=${cat}`}
              className="px-3 py-1 text-xs font-medium rounded-full transition-colors border"
              style={{
                backgroundColor: 'var(--bg-raised)',
                color: 'var(--text-secondary)',
                borderColor: 'var(--border)'
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
