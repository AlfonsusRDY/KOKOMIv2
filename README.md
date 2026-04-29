# TMKOKOMI

A manga reading platform built with Next.js 14, React 18, Tailwind CSS 3, and TypeScript 5. Supports reading manga, manhwa, and manhua. Data is sourced from the Komiku REST API.

## Tech Stack

- Next.js 14 (App Router, ISR)
- React 18 (Suspense streaming)
- Tailwind CSS 3
- TypeScript 5

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Installation

```bash
git clone <repo-url>
cd KOKOMIv2
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the Komiku REST API | `https://mangaverse-api.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | App name shown in UI | `TMKOKOMI` |
| `NEXT_PUBLIC_APP_VERSION` | App version | `1.0.0` |

### Running Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

### Build

```bash
npm run build
npm run start
```

## Project Structure

```
app/
  layout.tsx              Root layout, nav, footer, locale provider
  page.tsx                Homepage (latest + popular comics)
  globals.css             Global styles, CSS custom properties
  components/
    searchBar.tsx          Search input with router push
    localeProvider.tsx     React Context for en/id locale
    localeToggle.tsx       Navbar EN/ID toggle button
  komik/[slug]/
    page.tsx              Comic detail page (ISR, 10 min)
    loading.tsx           Streaming skeleton
    components/
      comicHeader.tsx     Cover, title, badges, synopsis
      chapterList.tsx     Paginated, searchable chapter list
    chapter/[number]/
      page.tsx            Chapter reader page
      components/
        chapterImages.tsx  Lazy-loaded manga pages (IntersectionObserver)
  search/
    page.tsx              Search results page
lib/
  api.ts                  Thin fetch wrapper for Komiku REST API
  data.ts                 Static mock data for local development
  i18n/
    locales.ts            Locale type and defaultLocale constant
    en.ts                 English translations
    id.ts                 Indonesian translations
    index.ts              getTranslations() helper and barrel export
hooks/
  useKomiku.ts            Client-side hooks (usePopularComics, etc.)
services/
  komiku.service.ts       Class-based API service with retry and cache
types/
  komiku.types.ts         Full TypeScript interface definitions
```

## API Endpoints

Base URL: `https://mangaverse-api.vercel.app`

| Endpoint | Description | Cache |
|---|---|---|
| `GET /komik-populer` | Popular manga/manhwa/manhua | 5 min |
| `GET /terbaru-2` | Latest updates | 1 min |
| `GET /detail-komik/:slug` | Comic detail + chapter list | 10 min |
| `GET /baca-chapter/:slug/:n` | Chapter images | 1 hr |
| `GET /search?q=keyword` | Search results | 2 min |

## Key Features

- ISR (Incremental Static Regeneration) per route with per-page revalidate timers
- Suspense streaming so each data section loads independently
- IntersectionObserver-based lazy loading for manga page images with 800px preload margin
- Client-side chapter list: range-tab pagination, search filter, scroll-to-start
- en/id language toggle in navbar, persisted to localStorage
- Mobile-first responsive design

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run type-check   # tsc --noEmit
```

## Deployment

Works out-of-the-box on Vercel. Set the environment variables in the Vercel project settings.

For other hosts, run `npm run build` and serve the `.next` directory.
