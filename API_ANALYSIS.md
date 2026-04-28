# Analisis API Komiku - VernSG/Komiku-Rest-Api

## 📋 Ringkasan
Repository **VernSG/Komiku-Rest-Api** adalah REST API yang melakukan scraping data komik dari Komiku.id menggunakan Cheerio dan Express.js. API ini menyediakan endpoint untuk mendapatkan daftar komik, detail komik, dan gambar chapter.

---

## 🔗 Endpoint Utama

### 1️⃣ Mendapatkan Daftar Komik

#### Endpoint: `/komik-populer`
**Method:** `GET`

**Deskripsi:** Mengambil data komik populer yang dibagi berdasarkan tipe (Manga, Manhwa, Manhua)

**Response Structure:**
```json
{
  "manga": {
    "title": "Manga Hot",
    "items": [
      {
        "title": "Nama Komik",
        "originalLink": "https://komiku.id/manga/slug-komik/",
        "apiDetailLink": "/detail-komik/slug-komik",
        "thumbnail": "https://cdn.komiku.org/upload/...",
        "genre": "Action, Adventure",
        "readers": "1.3jt pembaca",
        "latestChapter": "Chapter 150",
        "originalChapterLink": "https://komiku.id/slug-komik-chapter-150/",
        "apiChapterLink": "/baca-chapter/slug-komik/150",
        "mangaSlug": "slug-komik",
        "chapterNumber": "150"
      },
      // ... lebih banyak item
    ]
  },
  "manhwa": {
    "title": "Manhwa Hot",
    "items": [ /* struktur sama seperti manga */ ]
  },
  "manhua": {
    "title": "Manhua Hot",
    "items": [ /* struktur sama seperti manga */ ]
  }
}
```

#### Endpoint Alternatif: `/rekomendasi`, `/terbaru`, `/pustaka`
- `/rekomendasi` - Komik yang direkomendasikan
- `/terbaru` - Komik terbaru
- `/pustaka` - Komik di perpustakaan

---

### 2️⃣ Mendapatkan Detail Komik & List Chapter

#### Endpoint: `/detail-komik/:slug`
**Method:** `GET`

**Parameter:**
- `slug` (string, required) - Identifier komik (contoh: `naruto` dari URL `komiku.id/manga/naruto/`)

**Contoh Request:**
```
GET /detail-komik/naruto
```

**Response Structure:**
```json
{
  "title": "Naruto",
  "alternativeTitle": "Naruto - Alternate Title",
  "description": "Deskripsi singkat komik",
  "sinopsis": "Naruto adalah cerita tentang...",
  "thumbnail": "https://cdn.komiku.org/upload/cover/...",
  "info": {
    "Status": "Completed",
    "Tipe": "Manga",
    "Berwarna": "No",
    "Author": "Masashi Kishimoto"
  },
  "genres": ["Action", "Adventure", "Shounen"],
  "slug": "naruto",
  "firstChapter": {
    "title": "Chapter 1",
    "originalLink": "https://komiku.id/naruto-chapter-1/",
    "apiLink": "/baca-chapter/naruto/1",
    "chapterNumber": "1"
  },
  "latestChapter": {
    "title": "Chapter 700",
    "originalLink": "https://komiku.id/naruto-chapter-700/",
    "apiLink": "/baca-chapter/naruto/700",
    "chapterNumber": "700"
  },
  "chapters": [
    {
      "title": "Chapter 1 - Title",
      "originalLink": "https://komiku.id/naruto-chapter-1/",
      "apiLink": "/baca-chapter/naruto/1",
      "views": "1.2jt pembaca",
      "date": "2009-10-20",
      "chapterNumber": "1"
    },
    {
      "title": "Chapter 2 - Title",
      "originalLink": "https://komiku.id/naruto-chapter-2/",
      "apiLink": "/baca-chapter/naruto/2",
      "views": "900k pembaca",
      "date": "2009-10-27",
      "chapterNumber": "2"
    }
    // ... lebih banyak chapter
  ],
  "similarKomik": [
    {
      "title": "Bleach",
      "originalLink": "https://komiku.id/manga/bleach/",
      "apiLink": "/detail-komik/bleach",
      "thumbnail": "https://cdn.komiku.org/upload/cover/...",
      "type": "Manga",
      "genres": "Action, Supernatural",
      "synopsis": "Cerita tentang Bleach...",
      "views": "2.5jt pembaca",
      "slug": "bleach"
    }
    // ... lebih banyak komik serupa
  ]
}
```

---

### 3️⃣ Mendapatkan List URL Gambar dari Chapter

#### Endpoint: `/baca-chapter/:slug/:chapter`
**Method:** `GET`

**Parameter:**
- `slug` (string, required) - Identifier komik
- `chapter` (string, required) - Nomor chapter (contoh: `1`, `150.5`)

**Contoh Request:**
```
GET /baca-chapter/naruto/1
```

**Response Structure:**
```json
{
  "title": "Chapter 1 - The Boy Ninja",
  "mangaInfo": {
    "title": "Naruto",
    "originalLink": "https://komiku.id/manga/naruto/",
    "apiLink": "/detail-komik/naruto",
    "slug": "naruto"
  },
  "description": "Deskripsi chapter...",
  "chapterInfo": {
    "Status": "Published",
    "Type": "Chapter"
  },
  "images": [
    {
      "src": "https://cdn.komiku.org/upload/chapter/naruto/1/1.jpg",
      "alt": "Page 1",
      "id": "page-1",
      "fallbackSrc": "https://img.komiku.id/upload/chapter/naruto/1/1.jpg"
    },
    {
      "src": "https://cdn.komiku.org/upload/chapter/naruto/1/2.jpg",
      "alt": "Page 2",
      "id": "page-2",
      "fallbackSrc": "https://img.komiku.id/upload/chapter/naruto/1/2.jpg"
    }
    // ... lebih banyak gambar
  ],
  "meta": {
    "chapterNumber": "1",
    "totalImages": 23,
    "publishDate": "2009-10-03",
    "viewAnalyticsUrl": "analytics-url-jika-ada"
  },
  "navigation": {
    "prevChapter": null,  // null jika tidak ada chapter sebelumnya
    "nextChapter": {
      "originalLink": "https://komiku.id/naruto-chapter-2/",
      "apiLink": "/baca-chapter/naruto/2",
      "slug": "naruto",
      "chapter": "2"
    },
    "allChapters": "/detail-komik/naruto"
  },
  "additionalDescription": "Catatan tambahan tentang chapter..."
}
```

---

## 📝 TypeScript Interfaces

Berikut adalah TypeScript interfaces yang dapat Anda gunakan untuk project web app Anda:

### Interface untuk Daftar Komik

```typescript
// Tipe untuk item komik dalam daftar
interface KomikItem {
  title: string;
  originalLink: string;
  apiDetailLink: string | null;
  thumbnail: string;
  genre: string;
  readers: string;
  latestChapter: string;
  originalChapterLink: string | null;
  apiChapterLink: string | null;
  mangaSlug: string;
  chapterNumber: string;
}

// Tipe untuk section (Manga, Manhwa, Manhua)
interface KomikSection {
  title: string;
  items: KomikItem[];
}

// Tipe untuk response /komik-populer
interface KomikPopulerResponse {
  manga: KomikSection;
  manhwa: KomikSection;
  manhua: KomikSection;
}
```

### Interface untuk Detail Komik

```typescript
// Info tentang chapter
interface ChapterInfo {
  title: string;
  originalLink: string;
  apiLink: string | null;
  chapterNumber: string;
}

// Info chapter dengan view dan date
interface ChapterDetailInfo extends ChapterInfo {
  views: string;
  date: string;
}

// Komik serupa
interface SimilarKomik {
  title: string;
  originalLink: string;
  apiLink: string | null;
  thumbnail: string;
  type: string;
  genres: string;
  synopsis: string;
  views: string;
  slug: string;
}

// Info manga di detail
interface MangaInfo {
  title: string;
  originalLink: string | null;
  apiLink: string | null;
  slug: string;
}

// Response untuk /detail-komik/:slug
interface DetailKomikResponse {
  title: string;
  alternativeTitle: string;
  description: string;
  sinopsis: string;
  thumbnail: string;
  info: Record<string, string>;
  genres: string[];
  slug: string;
  firstChapter: ChapterInfo;
  latestChapter: ChapterInfo;
  chapters: ChapterDetailInfo[];
  similarKomik: SimilarKomik[];
}
```

### Interface untuk Images dari Chapter

```typescript
// Gambar dalam chapter
interface ChapterImage {
  src: string;
  alt: string;
  id: string;
  fallbackSrc: string;
}

// Metadata chapter
interface ChapterMeta {
  chapterNumber: string;
  totalImages: number;
  publishDate: string;
  viewAnalyticsUrl: string;
}

// Info navigasi chapter
interface ChapterNavigation {
  prevChapter: ChapterInfo | null;
  nextChapter: ChapterInfo | null;
  allChapters: string | null;
}

// Response untuk /baca-chapter/:slug/:chapter
interface BacaChapterResponse {
  title: string;
  mangaInfo: MangaInfo;
  description: string;
  chapterInfo: Record<string, string>;
  images: ChapterImage[];
  meta: ChapterMeta;
  navigation: ChapterNavigation;
  additionalDescription: string;
}
```

---

## 🚀 Endpoint Lainnya

### Search Komik
```
GET /search?q=keyword
```
- Parameter: `q` (query string untuk pencarian)
- Return: Daftar komik yang sesuai dengan pencarian

### Genre
```
GET /genre-all              # Semua genre
GET /genre-detail/:slug     # Komik berdasarkan genre tertentu
GET /genre-rekomendasi      # Genre yang direkomendasikan
```

### Komik Berwarna
```
GET /berwarna               # Daftar komik berwarna
```

---

## 💡 Contoh Implementasi API Call

### Menggunakan Fetch API (JavaScript/TypeScript)

```typescript
// 1. Mendapatkan daftar komik populer
async function getPopularComics(): Promise<KomikPopulerResponse> {
  const response = await fetch('https://api.example.com/komik-populer');
  return response.json();
}

// 2. Mendapatkan detail komik dan daftar chapter
async function getComicDetails(slug: string): Promise<DetailKomikResponse> {
  const response = await fetch(`https://api.example.com/detail-komik/${slug}`);
  return response.json();
}

// 3. Mendapatkan gambar chapter
async function getChapterImages(
  slug: string,
  chapter: string
): Promise<BacaChapterResponse> {
  const response = await fetch(
    `https://api.example.com/baca-chapter/${slug}/${chapter}`
  );
  return response.json();
}
```

---

## ⚠️ Catatan Penting

1. **Rate Limiting**: API memiliki rate limiter (200 requests per window)
2. **User-Agent**: Beberapa request memerlukan User-Agent yang valid
3. **CORS**: API memungkinkan akses dari origin apapun (`*`)
4. **Image Fallback**: Gambar memiliki fallback URL untuk redundansi CDN
5. **URL Base**: API menggunakan `https://komiku.org/` sebagai source

---

## 📍 API Host

Repository ini biasanya di-host di:
- **Vercel**: https://mangaphase.me/ (berdasarkan dokumentasi)
- **Localhost Development**: http://localhost:3001

Untuk production, Anda perlu:
1. Fork atau clone repository
2. Deploy ke Vercel/Railway/Render/Heroku
3. Atau jalankan instance lokal sendiri

---

## 🔧 Setup Lokal API

```bash
# Clone repository
git clone https://github.com/VernSG/Komiku-Rest-Api.git
cd Komiku-Rest-Api

# Install dependencies
npm install

# Jalankan server
npm start

# Server akan berjalan di http://localhost:3001
```

Setelah itu, Anda dapat mengakses endpoint di `http://localhost:3001/endpoint-name`
