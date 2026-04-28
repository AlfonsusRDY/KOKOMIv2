# 📚 Komiku Web App - Quick Reference Guide

## 📁 File Structure

```
komikv2/
├── API_ANALYSIS.md              # Analisis lengkap API endpoints
├── komiku.types.ts              # TypeScript interfaces untuk API
├── komiku.service.ts            # Service class untuk API calls
├── useKomiku.ts                 # React custom hooks
├── KomikuComponents.tsx          # Contoh React components
└── README.md (this file)        # Quick reference
```

---

## 🚀 Quick Start

### 1. Setup API Configuration

```typescript
import { komiKuService } from './komiku.service'

// Default configuration
// baseUrl: 'https://api.komiku.vercel.app'
// enableCache: true
// cacheExpiration: 1 hour

// Atau customize:
komiKuService.setBaseUrl('https://your-api-host.com')
```

### 2. Gunakan di React Component

```typescript
import { usePopularComics, useComicDetail, useChapterImages } from './useKomiku'

// Get popular comics
const { data: comics, loading, error } = usePopularComics()

// Get comic detail
const { data: detail, loading, error } = useComicDetail('naruto')

// Get chapter images
const { data: chapter, loading, error } = useChapterImages('naruto', '1')
```

---

## 📊 Main Endpoints Overview

| Endpoint | Method | Purpose | Response Type |
|----------|--------|---------|---------------|
| `/komik-populer` | GET | Daftar komik populer | `KomikPopulerResponse` |
| `/detail-komik/:slug` | GET | Detail komik & chapters | `DetailKomikResponse` |
| `/baca-chapter/:slug/:chapter` | GET | Gambar chapter | `BacaChapterResponse` |
| `/search?q=keyword` | GET | Pencarian komik | `SearchResult` |
| `/rekomendasi` | GET | Komik rekomendasi | `KomikPopulerResponse` |
| `/terbaru` | GET | Komik terbaru | `KomikPopulerResponse` |
| `/genre-all` | GET | Semua genre | `GenreAllResponse` |
| `/berwarna` | GET | Komik berwarna | `KomikPopulerResponse` |

---

## 🎯 Common Use Cases

### Use Case 1: Tampilkan Daftar Komik Populer

```typescript
import { usePopularComics } from './useKomiku'

export const PopularList = () => {
  const { data: comics, loading, error } = usePopularComics()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {comics?.manga.items.map(comic => (
        <div key={comic.mangaSlug}>
          <img src={comic.thumbnail} alt={comic.title} />
          <h3>{comic.title}</h3>
          <p>{comic.genre}</p>
        </div>
      ))}
    </div>
  )
}
```

### Use Case 2: Tampilkan Detail Komik dengan Chapter List

```typescript
import { useComicDetail } from './useKomiku'

export const ComicDetail = ({ slug }: { slug: string }) => {
  const { data: detail, loading, error } = useComicDetail(slug)

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <img src={detail?.thumbnail} alt={detail?.title} />
      <h1>{detail?.title}</h1>
      <p>{detail?.sinopsis}</p>

      <div>
        <h2>Chapters ({detail?.chapters.length})</h2>
        {detail?.chapters.map(chapter => (
          <div key={chapter.chapterNumber}>
            {chapter.title}
            <span>{chapter.date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Use Case 3: Image Gallery untuk Chapter

```typescript
import { useChapterImages } from './useKomiku'
import { useState } from 'react'

export const ChapterReader = ({ 
  slug, 
  chapter 
}: { 
  slug: string
  chapter: string 
}) => {
  const [currentPage, setCurrentPage] = useState(0)
  const { data: images, loading, error } = useChapterImages(slug, chapter)

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const current = images?.images[currentPage]

  return (
    <div>
      {current && (
        <img 
          src={current.src} 
          alt={current.alt}
          onError={(e) => {
            (e.target as HTMLImageElement).src = current.fallbackSrc
          }}
        />
      )}

      <button 
        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
        disabled={currentPage === 0}
      >
        Previous
      </button>

      <span>{currentPage + 1} / {images?.images.length}</span>

      <button 
        onClick={() => setCurrentPage(prev => 
          Math.min(prev + 1, (images?.images.length || 1) - 1)
        )}
        disabled={currentPage === (images?.images.length || 1) - 1}
      >
        Next
      </button>
    </div>
  )
}
```

### Use Case 4: Search Komik

```typescript
import { useSearchComics } from './useKomiku'
import { useState } from 'react'

export const SearchPage = () => {
  const [query, setQuery] = useState('')
  const { data: results, loading, search } = useSearchComics()

  const handleSearch = async (q: string) => {
    setQuery(q)
    await search(q)
  }

  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari komik..."
      />
      <button onClick={() => handleSearch(query)}>Search</button>

      {loading && <div>Searching...</div>}

      {results?.items.map(comic => (
        <div key={comic.mangaSlug}>
          <img src={comic.thumbnail} alt={comic.title} />
          <h4>{comic.title}</h4>
        </div>
      ))}
    </div>
  )
}
```

---

## 🔄 API Response Structures

### Komik Item dalam Daftar
```typescript
interface KomikItem {
  title: string                    // "Naruto"
  originalLink: string             // URL asli di komiku.id
  apiDetailLink: string | null     // "/detail-komik/naruto"
  thumbnail: string                // URL gambar cover
  genre: string                    // "Action, Adventure"
  readers: string                  // "1.3jt pembaca"
  latestChapter: string            // "Chapter 700"
  originalChapterLink: string | null
  apiChapterLink: string | null    // "/baca-chapter/naruto/700"
  mangaSlug: string                // "naruto"
  chapterNumber: string            // "700"
}
```

### Chapter dengan Gambar
```typescript
interface ChapterImage {
  src: string                      // URL gambar
  alt: string                      // Deskripsi gambar
  id: string                       // "page-1"
  fallbackSrc: string              // URL backup jika CDN utama down
}
```

### Navigasi Chapter
```typescript
interface ChapterNavigation {
  prevChapter: ChapterInfo | null  // Chapter sebelumnya atau null
  nextChapter: ChapterInfo | null  // Chapter berikutnya atau null
  allChapters: string | null       // Link ke halaman detail komik
}
```

---

## 🛠️ Helper Utilities

### Pagination Hook
```typescript
const { 
  currentPage, 
  paginate, 
  goToNextPage, 
  goToPreviousPage,
  goToPage,
  totalPages 
} = usePagination(items, pageSize)

// paginate() mengembalikan items untuk halaman saat ini
const paginatedItems = paginate()
```

### Service Methods
```typescript
// Get popular comics
await komiKuService.getPopularComics()

// Get comic detail
await komiKuService.getComicDetail('naruto')

// Get chapter images
await komiKuService.getChapterImages('naruto', '1')

// Search
await komiKuService.searchComics('naruto')

// Get by genre
await komiKuService.getComicsByGenre('action')

// Clear cache
komiKuService.clearCache()

// Update base URL
komiKuService.setBaseUrl('https://api.example.com')
```

---

## ⚙️ Configuration Options

```typescript
interface KomikuApiConfig {
  baseUrl: string              // Default: 'https://api.komiku.vercel.app'
  timeout?: number             // Default: 10000ms
  enableCache?: boolean        // Default: true
  cacheExpiration?: number     // Default: 3600000ms (1 hour)
  retryAttempts?: number       // Default: 3
  retryDelay?: number          // Default: 1000ms
}
```

---

## 🔍 Data Mapping Guide

### Dari API Response ke UI

```
1. List Screen
   └─ /komik-populer response
      └─ map to KomikCard component
         └─ display thumbnail, title, genre, latest chapter

2. Detail Screen
   └─ /detail-komik/:slug response
      └─ display cover, sinopsis, info table
      └─ display chapters list (paginated)
      └─ display similar comics

3. Reader Screen
   └─ /baca-chapter/:slug/:chapter response
      └─ display images gallery
      └─ handle image fallback (fallbackSrc)
      └─ navigate between pages
      └─ show prev/next chapter buttons
```

---

## 🌐 API Base URLs (untuk deployment)

Kamu perlu setup salah satu dari:

1. **Vercel (recommended):**
   ```
   https://mangaphase.me/
   ```

2. **Lokal development:**
   ```
   http://localhost:3001
   ```

3. **Railway/Render/Custom Host:**
   ```
   Sesuaikan dengan deployment mu
   ```

Setup API Host:
```bash
# Clone repo
git clone https://github.com/VernSG/Komiku-Rest-Api.git
cd Komiku-Rest-Api

# Install & run
npm install
npm start

# API akan di http://localhost:3001
```

---

## 📝 Type Safety Tips

### Selalu gunakan interfaces untuk type safety:

```typescript
// ❌ Hindari
const getComics = async () => {
  const res = await fetch('/api/komik-populer')
  return res.json() // type: any
}

// ✅ Baik
import { KomikPopulerResponse } from './komiku.types'

const getComics = async (): Promise<KomikPopulerResponse> => {
  const res = await fetch('/api/komik-populer')
  return res.json() as KomikPopulerResponse
}
```

### Gunakan Discriminated Union untuk error handling:

```typescript
// Response API selalu success: true/false
type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: ApiErrorResponse }

// Handling:
const result = await komiKuService.getPopularComics()
if (result.success) {
  console.log(result.data)
} else {
  console.error(result.error.error)
}
```

---

## 🚨 Error Handling

```typescript
try {
  const { data, error } = await useComicDetail('invalid-slug')
  
  if (error) {
    console.error('API Error:', error.error)
    console.error('Details:', error.detail)
  }
} catch (err) {
  console.error('Unexpected error:', err)
}
```

---

## 📱 Performance Tips

1. **Enable Caching** (default: true)
   - Automatik cache API responses selama 1 jam

2. **Pagination**
   - Gunakan `usePagination` untuk large lists

3. **Lazy Loading**
   - Load chapter detail hanya saat dibutuhkan

4. **Image Optimization**
   - Selalu gunakan `fallbackSrc` untuk image resilience
   - Compress images di client jika perlu

5. **Conditional Fetching**
   ```typescript
   // Hanya fetch jika ada slug
   const { data } = useComicDetail(slug || null)
   ```

---

## 📞 Support & Resources

- **API Repository:** https://github.com/VernSG/Komiku-Rest-Api
- **Source Website:** https://komiku.id/
- **TypeScript Docs:** https://www.typescriptlang.org/docs/
- **React Docs:** https://react.dev/

---

## 📄 License & Attribution

- **API:** VernSG/Komiku-Rest-Api (Built from Komiku.id)
- **Gunakan sesuai dengan Terms of Service Komiku.id**

---

## ✅ Checklist Implementasi

- [ ] Install dependencies
- [ ] Setup API configuration
- [ ] Create TypeScript interfaces
- [ ] Setup API service
- [ ] Create custom hooks
- [ ] Build React components
- [ ] Implement error handling
- [ ] Add caching strategy
- [ ] Test API calls
- [ ] Optimize performance
- [ ] Deploy API
- [ ] Deploy web app

---

## 🎉 Ready to Build!

Sekarang Anda sudah punya semua yang dibutuhkan untuk membuat web app komik. 

Mulai dari:
1. **API Analysis** → Pahami struktur API
2. **TypeScript Types** → Type-safe development
3. **API Service** → Centralized API calls
4. **React Hooks** → Easy component integration
5. **Components** → Production-ready UI

Happy coding! 🚀
