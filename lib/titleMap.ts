/**
 * Title Matching — Fastest Runtime Response Strategy
 *
 * Pre-computed Map lookups. Zero matching cost at request time.
 * Results are cached by ISR/SSR so the user never waits for matching.
 */

import type { SourceId } from '../types/source.types';

// ─── Static Override Map ─────────────────────────────────────────────────────
// Add entries here when automatic matching fails for a specific comic.
// Key = normalized Komiku slug, Value = { sourceId: sourceSpecificSlug }

export const TITLE_OVERRIDES: Record<string, Partial<Record<SourceId, string>>> = {
  // Examples:
  // 'became-first-prince': {
  //   asura: 'the-first-prince-7df1u23',
  //   kiryuu: 'first-prince',
  // },
};

// ─── Normalization ────────────────────────────────────────────────────────────

/**
 * Normalize a title/slug for comparison.
 * "Solo Leveling!!" → "sololeveling"
 * "solo-leveling-7df1u23" → "sololeveling7df1u23" (slug version)
 */
export function normalizeTitle(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Strip trailing ID suffixes that Asura appends to slugs.
 * "solo-leveling-7df1u23" → "solo-leveling"
 */
export function stripSourceSuffix(slug: string): string {
  // Asura appends 6–8 char hex IDs: "series-name-abc1234"
  return slug.replace(/-[a-f0-9]{6,8}$/, '');
}

// ─── Tier 1: Exact normalized title match ─────────────────────────────────────

/**
 * Build a lookup Map from a list of (title, sourceId, sourceSlug) tuples.
 * Called once per aggregator invocation; result used for O(1) lookups.
 */
export function buildTitleMap(
  entries: Array<{ title: string; sourceId: SourceId; sourceSlug: string }>
): Map<string, Array<{ sourceId: SourceId; sourceSlug: string }>> {
  const map = new Map<string, Array<{ sourceId: SourceId; sourceSlug: string }>>();

  for (const entry of entries) {
    const key = normalizeTitle(entry.title);
    const existing = map.get(key) ?? [];
    existing.push({ sourceId: entry.sourceId, sourceSlug: entry.sourceSlug });
    map.set(key, existing);
  }

  return map;
}

// ─── Tier 2: Slug-based match ─────────────────────────────────────────────────

/**
 * Returns true if sourceSlug "matches" targetSlug, accounting for
 * source-specific suffix patterns (e.g. Asura's trailing hex ID).
 */
export function slugsMatch(targetSlug: string, sourceSlug: string): boolean {
  if (targetSlug === sourceSlug) return true;

  const normTarget = normalizeTitle(stripSourceSuffix(targetSlug));
  const normSource = normalizeTitle(stripSourceSuffix(sourceSlug));

  return normTarget === normSource || normSource.startsWith(normTarget);
}

// ─── Tier 3: Static override lookup ──────────────────────────────────────────

/**
 * Check the static override map for a known slug mismatch.
 * Returns the source-specific slug override or null.
 */
export function getOverrideSlug(komikuSlug: string, sourceId: SourceId): string | null {
  const normKey = normalizeTitle(komikuSlug);
  for (const [key, overrides] of Object.entries(TITLE_OVERRIDES)) {
    if (normalizeTitle(key) === normKey) {
      return overrides[sourceId] ?? null;
    }
  }
  return null;
}

// ─── Chapter Number Normalization ─────────────────────────────────────────────

/**
 * Normalize a chapter number string to a canonical float key.
 *
 * "Chapter 121"  → "121"
 * "Ch. 121.0"   → "121"     (trailing .0 removed)
 * "121.5"       → "121.5"   (meaningful decimal kept)
 * "ch121"       → "121"
 * "episode 3"   → "3"
 */
export function normalizeChapterNum(raw: string): string {
  const stripped = raw
    .trim()
    .replace(/^(chapter|ch\.?|episode|ep\.?)\s*/i, '')
    .trim();

  const parsed = parseFloat(stripped);
  if (!isNaN(parsed)) {
    // Remove trailing ".0" but keep ".5", ".1", etc.
    return parsed % 1 === 0 ? String(Math.floor(parsed)) : String(parsed);
  }
  return stripped.toLowerCase();
}

/**
 * Returns true if two chapter number strings refer to the same chapter.
 * Covers: exact match, trailing-.0 match, and up to 0.09 float delta.
 *
 * Examples that return true:
 *   "121" vs "121.0"
 *   "Ch.121" vs "Chapter 121"
 *   "121" vs "121.05"  ← within delta
 *
 * Examples that return false:
 *   "121" vs "121.5"  ← half chapter, different content
 *   "121" vs "122"
 */
export function chaptersAreSimilar(a: string, b: string): boolean {
  const na = normalizeChapterNum(a);
  const nb = normalizeChapterNum(b);
  if (na === nb) return true;

  const fa = parseFloat(na);
  const fb = parseFloat(nb);
  if (!isNaN(fa) && !isNaN(fb)) {
    return Math.abs(fa - fb) < 0.1; // same chapter, minor version diff
  }
  return false;
}
