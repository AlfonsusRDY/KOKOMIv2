/**
 * Asura Scans — Integrated Scraper API Route
 *
 * Ported from shafat-96/asura (TypeScript Cheerio parser).
 * Runs server-side only. Supports proxy fallback for 403s.
 *
 * Endpoints (via query params):
 *   GET /api/asura?action=search&q=<query>&page=1
 *   GET /api/asura?action=latest&page=1
 *   GET /api/asura?action=detail&id=<mangaId>
 *   GET /api/asura?action=chapter&id=<chapterId>
 *   GET /api/asura?action=health
 */

import { NextRequest, NextResponse } from 'next/server';
import { load } from 'cheerio';

const BASE_URL = 'https://asuracomic.net';
const PROXY_URL = process.env.ASURA_PROXY_URL ?? 'https://goodproxy.goodproxy.workers.dev/fetch?url=';

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  Referer: 'https://asuracomic.net/',
};

// ─── HTTP with proxy fallback ─────────────────────────────────────────────────

async function asuraFetch(path: string): Promise<string> {
  const directUrl = `${BASE_URL}/${path}`;

  // Try direct first
  try {
    const res = await fetch(directUrl, {
      headers: BROWSER_HEADERS,
      next: { revalidate: 120 },
    });
    if (res.ok) return res.text();
    if (res.status !== 403 && res.status !== 429) {
      throw new Error(`Asura HTTP ${res.status}`);
    }
  } catch (err: any) {
    if (!err.message?.includes('403') && !err.message?.includes('429')) throw err;
  }

  // Proxy fallback
  const proxied = await fetch(`${PROXY_URL}${encodeURIComponent(directUrl)}`, {
    headers: BROWSER_HEADERS,
    next: { revalidate: 120 },
  });
  if (!proxied.ok) throw new Error(`Asura proxy HTTP ${proxied.status}`);
  return proxied.text();
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

async function search(query: string, page = 1) {
  const html = await asuraFetch(
    `series?page=${page}&name=${encodeURIComponent(query.toLowerCase())}`
  );
  const $ = load(html);

  const results = $('.grid.grid-cols-2.gap-3.p-4 > a')
    .map((_, el) => {
      const href = $(el).attr('href') ?? '';
      const id = href.replace('/series/', '');
      return {
        id,
        title: $(el).find('div > div > div:nth-child(2) > span:nth-child(1)').text().trim(),
        image: $(el).find('div > div > div:nth-child(1) > img').attr('src') ?? '',
        status: $(el).find('div > div > div:nth-child(1) > span').text().trim(),
        latestChapter: $(el).find('div > div > div:nth-child(2) > span:nth-child(2)').text().trim(),
      };
    })
    .get()
    .filter((r) => r.id && r.title);

  return { results, page };
}

async function latest(page = 1) {
  const html = await asuraFetch(`page/${page}`);
  const $ = load(html);

  const results = $('.text-white.mb-1')
    .find('.w-full.p-1.pt-1.pb-3')
    .map((_, el) => {
      const titleLink = $(el).find('.text-\\[15px\\].font-medium a');
      const href = titleLink.attr('href') ?? '';
      const id = href.split('/series/')[1] ?? '';
      const chapters: Array<{ id: string; title: string; releaseDate: string }> = [];

      $(el).find('.flex.flex-col.gap-y-1\\.5.list-disc .flex-1').each((_, chEl) => {
        const chHref = $(chEl).find('a').first().attr('href') ?? '';
        if (!chHref.includes('/chapter/')) return;
        const text =
          $(chEl).find('.hidden.sm\\:flex p').text().trim() ||
          $(chEl).find('p.w-\\[80px\\]').text().trim();
        const time = $(chEl).find('.text-\\[12px\\]').text().trim();
        if (text) {
          const num = text.replace('Chapter ', '').split(' - ')[0];
          chapters.push({ id: num, title: text, releaseDate: time });
        }
      });

      return {
        id,
        title: titleLink.text().trim(),
        image: $(el).find('img.rounded-md').attr('src') ?? '',
        chapters,
        latestChapter: chapters[0]?.id ?? '',
      };
    })
    .get()
    .filter((r) => r.id && r.title);

  return { results, page };
}

async function detail(mangaId: string) {
  const formattedId = mangaId.startsWith('series/') ? mangaId : `series/${mangaId}`;
  const html = await asuraFetch(formattedId);
  const $ = load(html);

  const title = $('.text-xl.font-bold:nth-child(1)').text().trim();
  const image = $('.relative.col-span-12 img').attr('src') ?? '';
  const description = $('span.font-medium.text-sm').text().trim();
  const status = $('.grid.grid-cols-1.gap-5.mt-8 > div:nth-child(1) > h3:nth-child(2)').text().trim();
  const genres = $('.space-y-1.pt-4 > div > button')
    .map((_, el) => $(el).text().trim())
    .get();

  // Parse chapters from embedded JSON
  const chapMatch = html
    .replace(/\n/g, '')
    .replace(/\\/g, '')
    .match(/"chapters".*:(\[\{.*?}\]),/);

  const chapters: Array<{ id: string; title: string; releaseDate: string }> = [];
  if (chapMatch) {
    try {
      const raw: Array<{ name: string; title: string; published_at: string }> = JSON.parse(
        chapMatch[1]
      );
      raw.forEach((ch) =>
        chapters.push({
          id: ch.name,
          title: ch.title || `Chapter ${ch.name}`,
          releaseDate: ch.published_at,
        })
      );
    } catch {
      // ignore parse error
    }
  }

  return { id: mangaId, title, image, description, status, genres, chapters };
}

async function chapterPages(chapterId: string) {
  const formattedId = chapterId.startsWith('series/') ? chapterId : `series/${chapterId}`;
  const html = await asuraFetch(formattedId);

  const chapMatch = html.replace(/\\/g, '').match(/pages.*:(\[{['"]order["'].*?}])/);
  if (!chapMatch) throw new Error('Asura: could not parse chapter pages');

  const pages: Array<{ order: string; url: string }> = JSON.parse(chapMatch[1]);
  return pages.map((p, i) => ({ page: i + 1, src: p.url, alt: `Page ${i + 1}` }));
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'search': {
        const q = searchParams.get('q') ?? '';
        const page = parseInt(searchParams.get('page') ?? '1', 10);
        if (!q) return NextResponse.json({ error: 'Missing q' }, { status: 400 });
        return NextResponse.json(await search(q, page));
      }
      case 'latest': {
        const page = parseInt(searchParams.get('page') ?? '1', 10);
        return NextResponse.json(await latest(page));
      }
      case 'detail': {
        const id = searchParams.get('id') ?? '';
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        return NextResponse.json(await detail(id));
      }
      case 'chapter': {
        const id = searchParams.get('id') ?? '';
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        return NextResponse.json(await chapterPages(id));
      }
      case 'health': {
        const html = await asuraFetch('');
        return NextResponse.json({ ok: html.length > 100 });
      }
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err: any) {
    console.error('[Asura route]', err?.message);
    return NextResponse.json({ error: err?.message ?? 'Asura fetch failed' }, { status: 502 });
  }
}
