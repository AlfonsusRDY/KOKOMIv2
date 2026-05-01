"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "../components/localeProvider";
import { searchComics } from "@/lib/api";
import type { SearchItem } from "@/lib/api";

function SearchPageContent() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [results, setResults] = useState<SearchItem[] | null>(null);
  const [totalResults, setTotalResults] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuery) {
      setLoading(true);
      setError(null);
      setResults(null);
      searchComics(initialQuery).then(data => {
        setResults(data.data || []);
        setTotalResults(data.total || 0);
      }).catch(() => {
        setError("Failed to fetch search results. Please try again.");
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [initialQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = inputValue.trim();
    if (!q) return;
    setQuery(q);
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await searchComics(q);
      setResults(data.data || []);
      setTotalResults(data.total || 0);
    } catch {
      setError("Failed to fetch search results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Heading */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium mb-4 transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-secondary)' }}>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {t.back}
        </Link>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {query ? (
            <>
              {t.searchResults}{" "}
              <span style={{ color: 'var(--accent)' }}>&quot;{query}&quot;</span>
              {results && (
                <span className="text-sm font-normal ml-2" style={{ color: 'var(--text-secondary)' }}>
                  ({totalResults} {t.results})
                </span>
              )}
            </>
          ) : (
            t.searchComics
          )}
        </h1>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="flex gap-2.5 mb-10">
        <div
          className="relative flex-1 rounded-2xl overflow-hidden transition-all duration-200"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)' }}
          onFocusCapture={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-border)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px var(--accent-subtle)';
          }}
          onBlurCapture={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={t.searchPlaceholder}
            autoFocus
            className="w-full pl-11 pr-4 py-3.5 text-sm bg-transparent focus:outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3.5 text-white text-sm font-semibold rounded-2xl transition-all duration-150 active:scale-95"
          style={{ background: 'var(--accent)' }}
        >
          {t.search}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="py-10 text-center text-sm" style={{ color: 'var(--warning)' }}>{error}</div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="w-16 h-24 skeleton rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3.5 skeleton rounded-md w-4/5" />
                <div className="h-3 skeleton rounded-md w-3/5" />
                <div className="h-5 skeleton rounded-full w-16 mt-3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No query */}
      {!query && !error && !loading && (
        <div className="py-20 text-center" style={{ color: 'var(--text-secondary)' }}>
          <p className="text-4xl mb-3 opacity-20">&#x2315;</p>
          <p>{t.searchPrompt}</p>
        </div>
      )}

      {/* No results */}
      {query && results && results.length === 0 && !loading && (
        <div className="py-20 text-center" style={{ color: 'var(--text-secondary)' }}>
          <p>{t.noResults} &quot;{query}&quot;.</p>
        </div>
      )}

      {/* Results */}
      {results && results.length > 0 && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {results.map((comic) => (
            <Link
              key={comic.slug}
              href={`/komik/${comic.slug}`}
              className="group flex gap-4 p-4 rounded-2xl transition-all duration-150"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-border)';
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-raised)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)';
              }}
            >
              <div className="flex-shrink-0 w-16 h-24 rounded-xl overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={comic.thumbnail} alt={comic.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-sm line-clamp-2 mb-1" style={{ color: 'var(--text-primary)' }}>
                  {comic.title}
                </h2>
                <p className="text-xs line-clamp-1 mb-2.5" style={{ color: 'var(--text-secondary)' }}>
                  {comic.genre}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className="chip"
                    style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
                  >
                    {comic.type}
                  </span>
                </div>
              </div>
              <svg className="w-4 h-4 self-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
