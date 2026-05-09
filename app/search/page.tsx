"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "../components/localeProvider";
import SourceBadge from "@/app/components/sourceBadge";
import type { SearchItem } from "@/lib/api";
import type { SourceId } from "@/types/source.types";

type AggregatedSearchItem = SearchItem & {
  sources?: SourceId[];
};

type PustakaLikeItem = {
  title: string;
  thumbnail?: string;
  type?: string;
  genre?: string;
  detailUrl?: string;
  description?: string;
  sources?: SourceId[];
};

type SortBy =
  | "best"
  | "latest"
  | "recently-added"
  | "title-asc"
  | "title-desc"
  | "source-count";
type GenreMatch = "AND" | "OR";

const SORT_OPTIONS: Array<{ value: SortBy; label: string }> = [
  { value: "best", label: "Best match" },
  { value: "latest", label: "Latest update" },
  { value: "recently-added", label: "Recently added" },
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "title-desc", label: "Title (Z-A)" },
  { value: "source-count", label: "Most Sources" },
];

const TYPE_OPTIONS = ["Manga", "Manhwa", "Manhua", "Other"];
const SOURCE_OPTIONS: SourceId[] = ["komiku", "asura", "kiryuu", "mangamint"];
const GENRE_OPTIONS = [
  "Action",
  "Adventure",
  "Boys Love",
  "Comedy",
  "Crime",
  "Drama",
  "Ecchi",
  "Fantasy",
  "Girls Love",
  "Hentai",
  "Historical",
  "Horror",
  "Isekai",
  "Magical Girls",
  "Mature",
  "Mecha",
  "Medical",
  "Mystery",
  "Philosophical",
  "Psychological",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Smut",
  "Sports",
  "Superhero",
  "Thriller",
  "Tragedy",
  "Wuxia",
];
const DISCOVERY_PAGE_SIZE = 25;

async function searchComics(query: string): Promise<{
  total: number;
  data: AggregatedSearchItem[];
}> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

async function fetchDiscoveryComics(): Promise<AggregatedSearchItem[]> {
  const pages = await Promise.all(
    [3, 4, 5, 6, 7, 8].map(async (page) => {
      try {
        const res = await fetch(`/api/pustaka?page=${page}`);
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data?.results) ? data.results as PustakaLikeItem[] : [];
      } catch {
        return [];
      }
    })
  );

  const seen = new Set<string>();
  const items = pages.flat().map((item): AggregatedSearchItem | null => {
    const slug = (item.detailUrl ?? "").replace("/detail-komik/", "").replace(/^\/+|\/+$/g, "");
    if (!slug || !item.title) return null;

    const normalized = slug.toLowerCase();
    if (seen.has(normalized)) return null;
    seen.add(normalized);

    return {
      title: item.title,
      altTitle: null,
      slug,
      href: `/komik/${slug}`,
      thumbnail: item.thumbnail ?? "",
      type: item.type ?? "Comic",
      genre: item.genre ?? "",
      description: item.description ?? "",
      sources: item.sources ?? ["komiku"],
    };
  }).filter(Boolean) as AggregatedSearchItem[];

  return items
    .map((item) => ({ item, score: Math.random() + ((item.sources?.length ?? 1) === 1 ? 0.2 : 0) }))
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

function normalizedTokens(value: string) {
  return value
    .toLowerCase()
    .split(/[,/|]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function hasToken(comic: AggregatedSearchItem, token: string) {
  const normalized = token.toLowerCase();
  const type = comic.type?.toLowerCase() ?? "";
  const haystack = [
    comic.title,
    comic.genre,
    comic.description,
    type,
  ]
    .filter(Boolean)
    .join(",")
    .toLowerCase();
  const genres = normalizedTokens(haystack);
  return haystack.includes(normalized) || genres.some((genre) => genre.includes(normalized));
}

function filterAndSortComics(
  items: AggregatedSearchItem[],
  {
    excludeGenres,
    genreMatch,
    includeGenres,
    sortBy,
    sourceFilter,
    typeFilters,
  }: {
    excludeGenres: string[];
    genreMatch: GenreMatch;
    includeGenres: string[];
    sortBy: SortBy;
    sourceFilter: SourceId | "Any";
    typeFilters: string[];
  }
) {
  const filtered = items.filter((comic) => {
    if (typeFilters.length && !typeFilters.some((type) => hasToken(comic, type))) return false;
    if (sourceFilter !== "Any" && !(comic.sources ?? []).includes(sourceFilter)) return false;

    if (includeGenres.length) {
      const matched = genreMatch === "AND"
        ? includeGenres.every((genre) => hasToken(comic, genre))
        : includeGenres.some((genre) => hasToken(comic, genre));
      if (!matched) return false;
    }
    if (excludeGenres.some((genre) => hasToken(comic, genre))) return false;

    return true;
  });

  return [...filtered].sort((a, b) => {
    if (sortBy === "title-asc") return a.title.localeCompare(b.title);
    if (sortBy === "title-desc") return b.title.localeCompare(a.title);
    if (sortBy === "source-count") return (b.sources?.length ?? 0) - (a.sources?.length ?? 0);
    return 0;
  });
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--text-tertiary)" }}>
      {children}
    </span>
  );
}

function FilterDropdown({
  label,
  value,
  open,
  onOpenChange,
  children,
  minWidth = "min-w-[270px]",
}: {
  label: string;
  value: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  minWidth?: string;
}) {
  return (
    <div className="relative">
      <FieldLabel>{label}</FieldLabel>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="flex h-12 w-full items-center justify-between rounded-md px-4 text-left text-sm transition-all duration-150"
        style={{
          background: open ? "var(--bg-raised)" : "var(--bg-surface)",
          color: "var(--text-primary)",
          border: `1px solid ${open ? "var(--accent-border)" : "var(--border)"}`,
          boxShadow: open ? "0 0 0 2px var(--accent-subtle)" : "none",
        }}
      >
        <span className="truncate">{value}</span>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={open ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
        </svg>
      </button>
      {open ? (
        <div
          className={`absolute left-0 top-[calc(100%+6px)] z-30 max-h-[520px] w-full ${minWidth} overflow-auto rounded-md p-4 shadow-2xl`}
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)" }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function OptionRow({
  checked,
  label,
  onClick,
  radio,
}: {
  checked: boolean;
  label: string;
  onClick: () => void;
  radio?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-white/5"
      style={{ color: checked ? "var(--accent)" : "var(--text-secondary)" }}
    >
      <span
        className={radio ? "h-5 w-5 rounded-full" : "h-5 w-5 rounded"}
        style={{
          border: `1px solid ${checked ? "var(--accent)" : "var(--border-strong)"}`,
          background: checked ? "var(--accent-subtle)" : "transparent",
          boxShadow: checked && radio ? "inset 0 0 0 5px var(--bg-surface)" : "none",
        }}
      />
      <span>{label}</span>
    </button>
  );
}

function SearchPageContent() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialAdvanced = searchParams.get("advanced") === "1";

  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [results, setResults] = useState<AggregatedSearchItem[] | null>(null);
  const [discoveryItems, setDiscoveryItems] = useState<AggregatedSearchItem[]>([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [discoveryPage, setDiscoveryPage] = useState(1);
  const [totalResults, setTotalResults] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(initialAdvanced);
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("latest");
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [sourceFilter, setSourceFilter] = useState<SourceId | "Any">("Any");
  const [includeGenres, setIncludeGenres] = useState<string[]>([]);
  const [excludeGenres, setExcludeGenres] = useState<string[]>([]);
  const [genreMatch, setGenreMatch] = useState<GenreMatch>("AND");

  const filteredResults = useMemo(() => {
    return filterAndSortComics(results ?? [], {
      excludeGenres,
      genreMatch,
      includeGenres,
      sortBy,
      sourceFilter,
      typeFilters,
    });
  }, [excludeGenres, genreMatch, includeGenres, results, sortBy, sourceFilter, typeFilters]);

  const filteredDiscovery = useMemo(() => {
    return filterAndSortComics(discoveryItems, {
      excludeGenres,
      genreMatch,
      includeGenres,
      sortBy,
      sourceFilter,
      typeFilters,
    });
  }, [discoveryItems, excludeGenres, genreMatch, includeGenres, sortBy, sourceFilter, typeFilters]);

  const discoveryTotalPages = Math.max(1, Math.ceil(filteredDiscovery.length / DISCOVERY_PAGE_SIZE));
  const visibleDiscovery = filteredDiscovery.slice(
    (discoveryPage - 1) * DISCOVERY_PAGE_SIZE,
    discoveryPage * DISCOVERY_PAGE_SIZE
  );

  const activeFilterCount =
    (sortBy === "latest" ? 0 : 1) +
    typeFilters.length +
    (sourceFilter === "Any" ? 0 : 1) +
    includeGenres.length +
    excludeGenres.length;

  const toggleInList = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const toggleGenre = (genre: string, mode: "include" | "exclude") => {
    if (mode === "include") {
      setIncludeGenres((prev) => {
        const next = prev.includes(genre) ? prev.filter((item) => item !== genre) : [...prev, genre];
        if (!prev.includes(genre)) setExcludeGenres((current) => current.filter((item) => item !== genre));
        return next;
      });
      return;
    }

    setExcludeGenres((prev) => {
      const next = prev.includes(genre) ? prev.filter((item) => item !== genre) : [...prev, genre];
      if (!prev.includes(genre)) setIncludeGenres((current) => current.filter((item) => item !== genre));
      return next;
    });
  };

  const resetFilters = () => {
    setSortBy("latest");
    setTypeFilters([]);
    setSourceFilter("Any");
    setIncludeGenres([]);
    setExcludeGenres([]);
    setGenreMatch("AND");
  };

  const feelingLucky = () => {
    const pool = query
      ? filteredResults.length ? filteredResults : results ?? []
      : filteredDiscovery.length ? filteredDiscovery : discoveryItems;
    const lucky = pool[Math.floor(Math.random() * pool.length)];
    if (lucky) window.location.href = `/komik/${lucky.slug}`;
  };

  useEffect(() => {
    if (initialQuery) return;

    setDiscoveryLoading(true);
    fetchDiscoveryComics()
      .then(setDiscoveryItems)
      .finally(() => setDiscoveryLoading(false));
  }, [initialQuery]);

  useEffect(() => {
    setDiscoveryPage(1);
  }, [excludeGenres, genreMatch, includeGenres, sortBy, sourceFilter, typeFilters]);

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
    <div className="mx-auto max-w-[1728px] px-4 py-10 sm:px-6 lg:px-8">
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
      <form onSubmit={handleSubmit} className="flex gap-2.5 mb-4">
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

      <div className="mb-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className="ml-auto inline-flex h-12 items-center gap-2 rounded-md px-5 text-xs font-bold uppercase tracking-[0.12em] transition-all duration-150"
            style={{
              background: filtersOpen ? "var(--bg-raised)" : "var(--bg-surface)",
              color: "var(--accent)",
              border: "1px solid var(--border-strong)",
            }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18M6 12h12M10 19h4" />
            </svg>
            Advanced Filters
            {activeFilterCount > 0 ? (
              <span
                className="rounded px-1.5 py-0.5 text-[10px] leading-none"
                style={{ background: "var(--accent)", color: "#111113" }}
              >
                {activeFilterCount}
              </span>
            ) : null}
          </button>
          {results ? (
            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              {filteredResults.length} / {results.length} shown
            </span>
          ) : null}
        </div>

        {filtersOpen ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <FilterDropdown
              label="Sort by"
              value={SORT_OPTIONS.find((option) => option.value === sortBy)?.label ?? "Latest update"}
              open={openFilter === "sort"}
              onOpenChange={(open) => setOpenFilter(open ? "sort" : null)}
            >
              {SORT_OPTIONS.map((option) => (
                <OptionRow
                  key={option.value}
                  radio
                  checked={sortBy === option.value}
                  label={option.label}
                  onClick={() => {
                    setSortBy(option.value);
                    setOpenFilter(null);
                  }}
                />
              ))}
            </FilterDropdown>

            <FilterDropdown
              label="Types"
              value={typeFilters.length ? typeFilters.join(", ") : "Any"}
              open={openFilter === "types"}
              onOpenChange={(open) => setOpenFilter(open ? "types" : null)}
            >
              {TYPE_OPTIONS.map((type) => (
                <OptionRow
                  key={type}
                  checked={typeFilters.includes(type)}
                  label={type}
                  onClick={() => toggleInList(type, setTypeFilters)}
                />
              ))}
            </FilterDropdown>

            <FilterDropdown
              label="Genres"
              value={includeGenres.length ? includeGenres.join(", ") : "Any"}
              open={openFilter === "genres"}
              onOpenChange={(open) => setOpenFilter(open ? "genres" : null)}
              minWidth="min-w-[620px]"
            >
              <div className="-m-4 mb-4 flex items-center justify-between gap-4 px-5 py-3" style={{ background: "var(--bg-raised)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--text-tertiary)" }}>
                    Match
                  </span>
                  {(["AND", "OR"] as GenreMatch[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setGenreMatch(mode)}
                      className="rounded-md px-4 py-2 text-xs font-bold"
                      style={{
                        background: genreMatch === mode ? "var(--bg-surface)" : "transparent",
                        color: genreMatch === mode ? "var(--text-primary)" : "var(--text-tertiary)",
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <span className="hidden text-[10px] uppercase tracking-[0.18em] sm:block" style={{ color: "var(--text-tertiary)" }}>
                  Click to include · again to exclude
                </span>
              </div>
              <FieldLabel>Tags</FieldLabel>
              <input
                type="text"
                placeholder="Type to add a tag, press Enter..."
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
                  const value = event.currentTarget.value.trim();
                  if (!value) return;
                  if (!includeGenres.includes(value)) setIncludeGenres((prev) => [...prev, value]);
                  event.currentTarget.value = "";
                }}
                className="mb-4 h-12 w-full rounded-md px-4 text-sm outline-none"
                style={{ background: "var(--bg-raised)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
              />
              <FieldLabel>Genres</FieldLabel>
              <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
                {GENRE_OPTIONS.map((genre) => {
                  const included = includeGenres.includes(genre);
                  const excluded = excludeGenres.includes(genre);
                  return (
                    <OptionRow
                      key={genre}
                      checked={included || excluded}
                      label={excluded ? `- ${genre}` : genre}
                      onClick={() => toggleGenre(genre, included ? "exclude" : "include")}
                    />
                  );
                })}
              </div>
            </FilterDropdown>

            <FilterDropdown
              label="Source"
              value={sourceFilter === "Any" ? "Any" : sourceFilter}
              open={openFilter === "source"}
              onOpenChange={(open) => setOpenFilter(open ? "source" : null)}
            >
              <OptionRow checked={sourceFilter === "Any"} radio label="Any" onClick={() => setSourceFilter("Any")} />
              {SOURCE_OPTIONS.map((source) => (
                <OptionRow
                  key={source}
                  radio
                  checked={sourceFilter === source}
                  label={source}
                  onClick={() => {
                    setSourceFilter(source);
                    setOpenFilter(null);
                  }}
                />
              ))}
            </FilterDropdown>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-auto h-12 rounded-md px-4 text-xs font-bold uppercase tracking-[0.12em]"
              style={{ background: "var(--bg-raised)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={feelingLucky}
              className="mt-auto h-12 rounded-md px-4 text-xs font-bold uppercase tracking-[0.12em]"
              style={{ background: "var(--bg-raised)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              I'm Feeling Lucky
            </button>
            <button
              type="button"
              onClick={() => setOpenFilter(null)}
              className="mt-auto h-12 rounded-md px-4 text-xs font-bold uppercase tracking-[0.12em]"
              style={{ background: "var(--accent)", color: "#111113" }}
            >
              Apply Filter
            </button>
          </div>
        ) : null}
      </div>

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
        <div>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                Underground Picks
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                Randomized discoveries from deeper catalog pages.
              </p>
            </div>
            {filteredDiscovery.length ? (
              <span className="font-mono text-sm" style={{ color: "var(--text-tertiary)" }}>
                {filteredDiscovery.length} items
              </span>
            ) : null}
          </div>

          {discoveryLoading ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 xl:grid-cols-5">
              {Array.from({ length: 25 }).map((_, index) => (
                <div key={index}>
                  <div className="aspect-[3/4] rounded-md skeleton" />
                  <div className="mx-auto mt-3 h-4 w-4/5 rounded-md skeleton" />
                  <div className="mx-auto mt-2 h-3 w-3/5 rounded-md skeleton" />
                </div>
              ))}
            </div>
          ) : visibleDiscovery.length ? (
            <>
              <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 xl:grid-cols-5">
                {visibleDiscovery.map((comic) => (
                  <Link key={`discovery-${comic.slug}`} href={`/komik/${comic.slug}`} className="group block min-w-0">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-md" style={{ background: "var(--bg-raised)" }}>
                      {comic.thumbnail ? (
                        <img
                          src={comic.thumbnail}
                          alt={comic.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm" style={{ color: "var(--text-tertiary)" }}>
                          No cover
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 font-mono text-sm" style={{ color: "var(--text-tertiary)" }}>
                      <span className="truncate">{comic.type || "Comic"}</span>
                      <span className="shrink-0">{(comic.sources ?? []).slice(0, 1).map((sourceId) => (
                        <SourceBadge key={sourceId} sourceId={sourceId} short />
                      ))}</span>
                    </div>
                    <h3 className="mt-2 line-clamp-2 text-center text-sm font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                      {comic.title}
                    </h3>
                  </Link>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setDiscoveryPage((page) => Math.max(1, page - 1))}
                  disabled={discoveryPage === 1}
                  className="h-9 rounded-md px-4 text-sm font-semibold transition-opacity disabled:opacity-40"
                  style={{ background: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border-strong)" }}
                >
                  Prev
                </button>
                {Array.from({ length: discoveryTotalPages }).map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setDiscoveryPage(page)}
                      className="h-9 w-9 rounded-md text-sm font-semibold"
                      style={{
                        background: discoveryPage === page ? "var(--accent)" : "var(--bg-surface)",
                        color: discoveryPage === page ? "#111113" : "var(--text-secondary)",
                        border: `1px solid ${discoveryPage === page ? "var(--accent)" : "var(--border-strong)"}`,
                      }}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setDiscoveryPage((page) => Math.min(discoveryTotalPages, page + 1))}
                  disabled={discoveryPage === discoveryTotalPages}
                  className="h-9 rounded-md px-4 text-sm font-semibold transition-opacity disabled:opacity-40"
                  style={{ background: "var(--accent)", color: "#111113" }}
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="py-20 text-center" style={{ color: 'var(--text-secondary)' }}>
              <p className="text-4xl mb-3 opacity-20">&#x2315;</p>
              <p>{t.searchPrompt}</p>
            </div>
          )}
        </div>
      )}

      {/* No results */}
      {query && results && results.length === 0 && !loading && (
        <div className="py-20 text-center" style={{ color: 'var(--text-secondary)' }}>
          <p>{t.noResults} &quot;{query}&quot;.</p>
        </div>
      )}

      {query && results && results.length > 0 && filteredResults.length === 0 && !loading && (
        <div className="py-20 text-center" style={{ color: 'var(--text-secondary)' }}>
          <p>No comics match the current filters.</p>
        </div>
      )}

      {/* Results */}
      {filteredResults.length > 0 && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredResults.map((comic) => (
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
                  {(comic.sources ?? []).slice(0, 3).map((sourceId) => (
                    <SourceBadge key={sourceId} sourceId={sourceId} short />
                  ))}
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

