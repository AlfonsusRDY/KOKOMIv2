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
        <Link href="/" className="text-sm mb-4 inline-block transition-colors hover:opacity-80"
          style={{ color: 'var(--accent)' }}>
          &larr; {t.back}
        </Link>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
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
      <form onSubmit={handleSubmit} className="flex gap-2 mb-10">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder={t.searchPlaceholder}
          autoFocus
          className="flex-1 px-4 py-3 rounded-xl text-sm transition focus:outline-none"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        />
        <button
          type="submit"
          className="px-6 py-3 text-white font-semibold rounded-xl text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--accent)' }}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl animate-pulse"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="w-16 h-22 rounded-xl flex-shrink-0" style={{ backgroundColor: 'var(--bg-raised)' }} />
              <div className="flex-1 space-y-2">
                <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'var(--bg-raised)' }} />
                <div className="h-3 rounded w-1/2" style={{ backgroundColor: 'var(--bg-raised)' }} />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {results.map((comic) => (
            <Link
              key={comic.slug}
              href={`/komik/${comic.slug}`}
              className="group flex gap-4 p-4 rounded-2xl transition-all"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div className="flex-shrink-0 w-16 rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-raised)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={comic.thumbnail} alt={comic.title} className="w-16 h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-sm line-clamp-2 transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {comic.title}
                </h2>
                <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                  {comic.genre}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: 'var(--bg-raised)', color: 'var(--accent)' }}>
                    {comic.type}
                  </span>
                  <span className="text-xs line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{comic.description}</span>
                </div>
              </div>
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
