"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useLocale } from "./localeProvider";

interface SearchBarProps {
  compact?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export default function SearchBar({ compact = false, autoFocus = true, className = "" }: SearchBarProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex gap-2.5 ${compact ? "w-full" : "max-w-xl mx-auto"} ${className}`}
    >
      {/* Search input */}
      <div
        className={`${compact ? "rounded-lg" : "rounded-2xl"} relative flex-1 overflow-hidden transition-all duration-200`}
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
          placeholder={compact ? "Search comic..." : t.searchPlaceholder}
          className={`w-full pl-11 pr-4 text-sm bg-transparent focus:outline-none ${compact ? "py-3" : "py-3.5"}`}
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className={`${compact ? "px-4 py-3 rounded-lg text-xs" : "px-6 py-3.5 rounded-2xl text-sm"} text-white font-semibold whitespace-nowrap transition-all duration-150 active:scale-95`}
        style={{ background: 'var(--accent)' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
      >
        {compact ? "FILTER" : t.search}
      </button>
    </form>
  );
}
