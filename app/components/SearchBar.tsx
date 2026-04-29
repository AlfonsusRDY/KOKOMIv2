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
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-xl mx-auto">
      <div className="relative flex-1">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: 'var(--text-secondary)' }}
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
          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition focus:outline-none"
          style={{
            backgroundColor: 'rgba(255,255,255,0.08)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        />
      </div>
      <button
        type="submit"
        className="px-5 py-3 text-white font-semibold rounded-xl text-sm whitespace-nowrap transition-opacity hover:opacity-90"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        {t.search}
      </button>
    </form>
  );
}
