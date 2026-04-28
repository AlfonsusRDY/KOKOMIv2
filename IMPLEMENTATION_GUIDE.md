# 🎨 Komiku Detail Page - Next.js App Router & Tailwind CSS

## 📂 Project Structure

```
komiku-app/
├── app/
│   ├── layout.tsx                    # Root layout dengan navbar & footer
│   ├── globals.css                   # Global styles & CSS variables
│   ├── komik/
│   │   └── [slug]/
│   │       └── page.tsx              # Detail komik page (Main entry point)
│   └── page.tsx                      # Home page
│
├── components/
│   ├── komik/
│   │   └── detail/
│   │       ├── ComicDetailContent.tsx     # Main content wrapper
│   │       ├── ComicHeader.tsx            # Header dengan cover & info
│   │       ├── ComicInfo.tsx              # Tabel informasi komik
│   │       ├── ChapterList.tsx            # ⭐ List chapter + AUTO-SCROLL
│   │       └── SimilarComics.tsx          # Komik serupa
│   └── ...
│
├── hooks/
│   └── useKomiku.ts                  # Custom React hooks untuk API
│
├── services/
│   └── komiku.service.ts             # API service
│
├── types/
│   └── komiku.types.ts               # TypeScript interfaces
│
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript config
├── next.config.js                    # Next.js config
└── package.json
```

---

## 🚀 Quick Start

### 1. Setup Project

```bash
# Create Next.js project
npx create-next-app@latest komiku-app --typescript --tailwind --app

cd komiku-app
```

### 2. Install Dependencies

```bash
npm install
# atau
yarn add
```

### 3. Copy Files

Copy semua file dari dokumentasi ini ke folder yang sesuai:

```bash
# Copy types
cp komiku.types.ts src/types/

# Copy service
cp komiku.service.ts src/services/

# Copy hooks
cp useKomiku.ts src/hooks/

# Copy components
cp ComicDetailContent.tsx src/components/komik/detail/
cp ComicHeader.tsx src/components/komik/detail/
cp ComicInfo.tsx src/components/komik/detail/
cp ChapterList.tsx src/components/komik/detail/
cp SimilarComics.tsx src/components/komik/detail/

# Copy layouts & styles
cp app-layout.tsx app/layout.tsx
cp globals.css app/globals.css
cp app-detail-page.tsx app/komik/[slug]/page.tsx
cp tailwind.config.ts .
```

### 4. Update Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.komiku.vercel.app
# atau untuk local development:
# NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 5. Run Development Server

```bash
npm run dev
# atau
yarn dev
```

Buka [http://localhost:3000/komik/naruto](http://localhost:3000/komik/naruto)

---

## 🎯 Key Features

### ✅ Clean & Minimalist Design
- Neutral colors (white, gray, dark gray)
- No excessive animations
- Focus on readability

### ✅ Dark Mode / Light Mode Support
- Toggle button di top-right
- Automatic color switching
- Smooth transitions

### ✅ Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg
- Touch-friendly buttons

### ✅ Auto-Scroll Functionality
- **Tombol "Baca dari Awal"** 
- Smooth scroll ke Chapter 1
- Highlight effect dengan animation
- Button disabled saat scrolling

### ✅ Collapsible Sections
- Info Section (collapse/expand)
- Chapters Section (collapse/expand)
- Similar Comics Section (collapse/expand)

### ✅ Pagination untuk Chapter List
- 15 chapter per halaman
- Navigation buttons
- Page indicator

---

## 📖 Component Details

### 1. **ComicDetailContent.tsx**
Wrapper utama yang manage semua sections

**Props:**
- `detail: DetailKomikResponse` - Data komik dari API
- `isDarkMode: boolean` - Dark mode flag

**State:**
- `expandedSections` - Track which sections are expanded

**Features:**
- Expandable sections
- Section toggle buttons

---

### 2. **ComicHeader.tsx**
Header dengan cover image dan info dasar

**Features:**
- Large cover image (responsive)
- Title & alternative title
- Genre tags
- Sinopsis preview
- Action buttons (Baca dari Awal, Baca Terbaru)
- Quick stats (Total chapters, Status, Type)

**Styling:**
- Responsive flex layout (stack on mobile)
- Image with fallback
- Badge styling untuk genres

---

### 3. **ChapterList.tsx** ⭐
**MOST IMPORTANT** - List chapter dengan AUTO-SCROLL

**Key Implementation:**
```typescript
// Setup refs
const chapterListRef = useRef<HTMLDivElement>(null);
const firstChapterRef = useRef<HTMLDivElement>(null);

// Auto-scroll function
const scrollToFirstChapter = useCallback(() => {
  if (!firstChapterRef.current) return;
  
  setIsScrolling(true);
  
  // Smooth scroll ke chapter 1
  firstChapterRef.current.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
  
  // Highlight effect
  firstChapterRef.current.classList.add('highlight-pulse');
  
  // Clear highlight setelah 2 detik
  setTimeout(() => {
    firstChapterRef.current?.classList.remove('highlight-pulse');
    setIsScrolling(false);
  }, 2000);
}, []);
```

**Features:**
- Pagination (15 items per page)
- Chapter items dengan link
- Smooth scroll animation
- Highlight pulse effect
- Disabled state button saat scrolling
- Reverse order display (newest first)

---

### 4. **ComicInfo.tsx**
Tabel informasi komik

**Content:**
- Full sinopsis
- Info table (Status, Type, Author, dll)
- First chapter info
- Latest chapter info

---

### 5. **SimilarComics.tsx**
Grid komik serupa

**Features:**
- 6 komik serupa (max)
- Image hover scale effect
- Type badge
- Views counter
- Genres & synopsis preview
- Link ke detail page

---

## 🎨 Styling Approach

### Tailwind CSS Classes

```typescript
// Dark mode support
className={`
  ${isDarkMode 
    ? 'bg-gray-800 text-gray-100' 
    : 'bg-white text-gray-900'
  }
`}

// Responsive
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Transitions
className="transition hover:shadow-lg"

// Pseudo-elements
className="hover:bg-gray-700"
```

### CSS Variables (Global)

```css
:root {
  --color-bg-primary: #ffffff;
  --color-text-primary: #111827;
  --color-accent: #3b82f6;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #111827;
    --color-text-primary: #f9fafb;
  }
}
```

---

## 🔄 Data Flow

```
Next.js Page ([slug])
  ↓
useComicDetail(slug) hook
  ↓
API Call: GET /detail-komik/naruto
  ↓
DetailKomikResponse
  ↓
ComicDetailContent
  ├─ ComicHeader
  ├─ ComicInfo
  ├─ ChapterList ⭐ (with auto-scroll)
  └─ SimilarComics
```

---

## 🎯 Auto-Scroll Flow

```
User Click "Baca dari Awal" Button
  ↓
onClick → scrollToFirstChapter()
  ↓
1. Set isScrolling = true
2. firstChapterRef.current.scrollIntoView()
3. Add 'highlight-pulse' class
  ↓
CSS Animation: highlight-pulse (2s)
  ↓
setTimeout(2000ms):
  - Remove highlight class
  - Set isScrolling = false
  ↓
Button Active Again ✓
```

---

## 📱 Responsive Breakpoints

```
Mobile (< 640px)
  ├─ Single column layout
  ├─ Stacked buttons
  └─ Smaller fonts

Tablet (640px - 1024px)
  ├─ Two column grid
  ├─ Flexible spacing
  └─ Side-by-side sections

Desktop (> 1024px)
  ├─ Full-width content
  ├─ Three column grid
  └─ Large images
```

---

## 🌓 Dark Mode Implementation

### 1. Manual Toggle (Current)
```typescript
const [isDarkMode, setIsDarkMode] = useState(true);

<button onClick={() => setIsDarkMode(!isDarkMode)}>
  {isDarkMode ? '☀️' : '🌙'}
</button>
```

### 2. System Preference (Alternative)
```typescript
const [isDarkMode, setIsDarkMode] = useState(
  window.matchMedia('(prefers-color-scheme: dark)').matches
);
```

### 3. Persistent Storage (Advanced)
```typescript
const [isDarkMode, setIsDarkMode] = useState(() => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('darkMode') === 'true';
});

useEffect(() => {
  localStorage.setItem('darkMode', String(isDarkMode));
}, [isDarkMode]);
```

---

## ⚡ Performance Optimizations

### 1. Image Optimization
```typescript
// Next.js Image component
<Image
  src={url}
  alt="description"
  fill
  className="object-cover"
  priority  // For above-the-fold
  onError={(e) => {
    e.currentTarget.src = '/fallback.png';
  }}
/>
```

### 2. Memoization
```typescript
// useCallback untuk auto-scroll function
const scrollToFirstChapter = useCallback(() => {
  // ...
}, []);
```

### 3. Lazy Loading
```typescript
// Collapsible sections
{expandedSections.similar && (
  <SimilarComics comics={...} />
)}
```

### 4. CSS-in-JS Optimization
```typescript
// Scoped CSS dengan <style jsx>
<style jsx>{`
  @keyframes highlight-pulse {
    // ...
  }
`}</style>
```

---

## 🧪 Testing Ideas

### Unit Tests
```typescript
// Test auto-scroll function
test('scrollToFirstChapter should call scrollIntoView', () => {
  // Mock useRef
  // Assert scrollIntoView called
});

// Test pagination
test('usePagination should paginate correctly', () => {
  // Test page navigation
});
```

### E2E Tests (Playwright/Cypress)
```typescript
// Test click "Baca dari Awal" button
test('should scroll to first chapter', async ({ page }) => {
  await page.click('button:has-text("Baca dari Awal")');
  await page.waitForTimeout(1000);
  // Assert chapter 1 is visible
});
```

---

## 📦 Build & Deploy

### Build for Production
```bash
npm run build
npm run start
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy ke Railway/Render
1. Push code ke GitHub
2. Connect repository
3. Set environment variables
4. Deploy

---

## 🐛 Troubleshooting

### Scroll tidak bekerja
- Pastikan ref ter-assign dengan benar
- Check browser console untuk errors
- Verify scrollIntoView support

### Dark mode tidak berubah
- Pastikan isDarkMode state updated
- Check className conditional logic
- Verify CSS dark mode classes

### Images tidak load
- Check image URLs valid
- Verify fallback image exists
- Check CORS settings

---

## ✨ Future Enhancements

1. **Advanced Search**
   - Filter by genre, status, type
   - Search suggestions

2. **Reading History**
   - Save last read chapter
   - Continue reading button
   - History page

3. **Bookmarks**
   - Save favorite chapters
   - Bookmark collections

4. **Comments & Ratings**
   - User comments on chapters
   - Star ratings
   - Discussion threads

5. **Download Offline**
   - Download chapters locally
   - Read offline

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Hooks](https://react.dev/reference/react)
- [MDN Web Docs](https://developer.mozilla.org/)

---

## ✅ Implementasi Checklist

- [x] Setup Next.js dengan App Router
- [x] Setup Tailwind CSS
- [x] Create TypeScript interfaces
- [x] Create API service & hooks
- [x] Create main page & layout
- [x] Create detail components
- [x] Implement auto-scroll dengan useRef
- [x] Add dark/light mode toggle
- [x] Add pagination
- [x] Add responsive design
- [x] Add animations & transitions
- [x] Test on mobile & desktop
- [ ] Deploy to production
- [ ] Monitor performance
- [ ] Gather user feedback

---

## 🎉 Selesai!

Sekarang Anda punya halaman Detail Komik yang:
- ✅ Clean & minimalist
- ✅ Dark/Light mode support
- ✅ Responsive design
- ✅ Auto-scroll dengan useRef
- ✅ Smooth animations
- ✅ Type-safe dengan TypeScript
- ✅ Production-ready

Happy coding! 🚀
