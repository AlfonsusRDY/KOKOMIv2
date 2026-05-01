"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useLocale } from "./localeProvider";

export default function SearchBar() {
  const router = useRouter();
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2.5 max-w-xl mx-auto">
      {/* Search input */}
      <div
        className="relative flex-1 rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
        }}
        onFocusCapture={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-border)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px var(--accent-subtle), 0 1px 2px rgba(0,0,0,0.3)';
        }}
        onBlurCapture={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 2px rgba(0,0,0,0.3)';
        }}
      >
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none flex-shrink-0"
          style={{ color: 'var(--text-tertiary)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-11 pr-4 py-3.5 text-sm bg-transparent focus:outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="px-6 py-3.5 text-white text-sm font-semibold rounded-2xl whitespace-nowrap transition-all duration-150 active:scale-95"
        style={{ background: 'var(--accent)' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
      >
        {t.search}
      </button>
    </form>
  );
}
