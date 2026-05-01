"use client";

import { useLocale } from "./localeProvider";
import SearchBar from "./searchBar";

const CATEGORIES = ["Manga", "Manhwa", "Manhua", "Action", "Romance", "Fantasy", "Comedy"];

export default function HeroSection() {
  const { t } = useLocale();
  return (
    <section className="relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(218,119,86,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        {/* Headline */}
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] mb-5"
          style={{ color: 'var(--text-primary)' }}
        >
          {t.heroTitle}{' '}
          <span style={{ color: 'var(--accent)' }}>
            {t.heroTitleHighlight}
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="mb-10 text-base sm:text-lg leading-relaxed max-w-lg mx-auto"
          style={{ color: 'var(--text-secondary)' }}
        >
          {t.heroSubtitle}
        </p>

        {/* Search */}
        <SearchBar />

        {/* Category pills */}
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <a
              key={cat}
              href={`/search?q=${cat}`}
              className="px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all duration-150 hover:scale-[1.04]"
              style={{
                background: 'var(--bg-raised)',
                color: 'var(--text-secondary)',
                borderColor: 'var(--border-strong)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = 'var(--accent)';
                el.style.borderColor = 'var(--accent-border)';
                el.style.background = 'var(--accent-subtle)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = 'var(--text-secondary)';
                el.style.borderColor = 'var(--border-strong)';
                el.style.background = 'var(--bg-raised)';
              }}
            >
              {cat}
            </a>
          ))}
        </div>
      </div>

      {/* Bottom separator */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, var(--border-strong), transparent)' }}
      />
    </section>
  );
}
