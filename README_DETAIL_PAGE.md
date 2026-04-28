# 📚 Komiku - Web App Baca Komik Online

Aplikasi web modern untuk membaca komik online menggunakan API dari VernSG/Komiku-Rest-Api, built with Next.js, React, TypeScript, dan Tailwind CSS.

## ✨ Features

- 🎨 **Clean & Minimalist Design** - UI yang rapi tanpa animasi berlebihan
- 🌓 **Dark/Light Mode** - Toggle theme dengan smooth transitions
- 📱 **Responsive Design** - Optimal display di mobile, tablet, desktop
- 🚀 **Auto-Scroll dengan useRef** - Tombol "Baca dari Awal" dengan smooth scroll ke Chapter 1
- 💨 **Performance Optimized** - Image lazy loading, code splitting, caching
- 🔍 **Search Functionality** - Cari komik berdasarkan keyword
- 📖 **Pagination** - 15 chapter per halaman dengan navigation
- 🎯 **Type-Safe** - Full TypeScript support
- ✅ **Best Practices** - React Hooks, Next.js App Router, Tailwind CSS

## 🛠️ Tech Stack

- **Frontend Framework:** Next.js 14+ (App Router)
- **UI Library:** React 18+
- **Styling:** Tailwind CSS 3+
- **Language:** TypeScript 5+
- **Package Manager:** npm / yarn
- **API:** VernSG Komiku REST API

## 📋 Prerequisites

- Node.js 18+ 
- npm atau yarn
- Git

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/komiku-app.git
cd komiku-app
```

### 2. Install Dependencies

```bash
npm install
# atau
yarn install
```

### 3. Setup Environment Variables

```bash
# Copy .env.example ke .env.local
cp .env.example .env.local

# Edit .env.local dan sesuaikan API URL
NEXT_PUBLIC_API_URL=https://api.komiku.vercel.app
```

### 4. Run Development Server

```bash
npm run dev
# atau
yarn dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### 5. Build untuk Production

```bash
npm run build
npm run start
```

## 📂 Project Structure

```
komiku-app/
├── app/
│   ├── komik/
│   │   └── [slug]/
│   │       └── page.tsx              # Detail komik page
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Global styles
│   └── page.tsx                      # Home page
│
├── components/
│   └── komik/
│       └── detail/
│           ├── ComicDetailContent.tsx
│           ├── ComicHeader.tsx
│           ├── ComicInfo.tsx
│           ├── ChapterList.tsx       # ⭐ Auto-scroll implementation
│           └── SimilarComics.tsx
│
├── hooks/
│   └── useKomiku.ts                  # Custom React hooks
│
├── services/
│   └── komiku.service.ts             # API service
│
├── types/
│   └── komiku.types.ts               # TypeScript interfaces
│
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── postcss.config.js
├── package.json
└── README.md
```

## 🎯 Key Components

### ComicDetailPage (`app/komik/[slug]/page.tsx`)
- Main entry point untuk halaman detail komik
- Theme toggle (dark/light mode)
- Loading & error states

### ComicHeader (`components/komik/detail/ComicHeader.tsx`)
- Display cover image responsive
- Title, alternative title, synopsis
- Genre tags
- Action buttons (Baca dari Awal, Baca Terbaru)
- Quick stats (total chapter, status, type)

### ChapterList (`components/komik/detail/ChapterList.tsx`) ⭐
- **AUTO-SCROLL IMPLEMENTATION dengan useRef**
- Pagination (15 chapter per halaman)
- "Baca dari Awal" button yang trigger smooth scroll
- Highlight effect pada chapter 1
- Disabled state saat scrolling

### ComicInfo (`components/komik/detail/ComicInfo.tsx`)
- Full description / sinopsis
- Info table (Status, Type, Author, etc.)
- First & latest chapter info

### SimilarComics (`components/komik/detail/SimilarComics.tsx`)
- Grid display komik serupa
- Image hover effects
- Type badge, views counter
- Link ke detail page

## 🔄 Auto-Scroll Implementation

### Konsep Utama

Menggunakan React `useRef` untuk direct DOM manipulation dengan `scrollIntoView()`:

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

### Fitur

✅ Smooth scroll animation  
✅ Highlight pulse effect (2 detik)  
✅ Button disabled saat scroll  
✅ Visual feedback dengan icon & text  
✅ Support dark/light mode  

Lihat [AUTO_SCROLL_DOCUMENTATION.md](AUTO_SCROLL_DOCUMENTATION.md) untuk detail lengkap.

## 🎨 Design Principles

### Color Scheme

**Light Mode:**
- Background: White (#ffffff)
- Text: Dark Gray (#111827)
- Accent: Blue (#3b82f6)

**Dark Mode:**
- Background: Very Dark Gray (#111827)
- Text: Off White (#f9fafb)
- Accent: Light Blue (#60a5fa)

### Responsive Breakpoints

```
Mobile    : < 640px
Tablet    : 640px - 1024px
Desktop   : > 1024px
```

### Minimal Animations

- Fade in/out transitions (0.3s)
- Slide animations (0.3s)
- Smooth scroll
- Pulse effect untuk highlight

## 🔌 API Integration

### Base URL

```typescript
https://api.komiku.vercel.app
// atau untuk local development:
// http://localhost:3001
```

### Main Endpoints

```
GET /komik-populer           - Popular comics
GET /detail-komik/:slug      - Comic detail + chapters
GET /baca-chapter/:slug/:ch  - Chapter images
GET /search?q=keyword        - Search comics
GET /rekomendasi             - Recommended comics
GET /terbaru                 - Latest comics
```

## 📊 Data Flow

```
Page → useComicDetail hook → API Service
                              ↓
                         API Response
                              ↓
                    DetailKomikResponse
                              ↓
                      Components Render
```

## 🧪 Testing

### Manual Testing

```bash
# Test dark mode toggle
# Test auto-scroll button
# Test pagination
# Test responsive design (F12 → Responsive mode)
# Test error handling (wrong slug)
```

### Unit Tests (Optional)

```bash
npm run test
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Deploy to Railway / Render

1. Push code ke GitHub
2. Connect repository ke platform
3. Set environment variables
4. Deploy

### Build & Run Locally

```bash
npm run build
npm run start
```

## 📝 Environment Variables

```env
# .env.local

# API Configuration
NEXT_PUBLIC_API_URL=https://api.komiku.vercel.app

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_COMMENTS=false

# App Settings
NEXT_PUBLIC_APP_NAME=Komiku
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 🐛 Troubleshooting

### Problem: Scroll tidak bekerja

**Solution:**
- Pastikan ref ter-assign dengan benar
- Check browser console untuk errors
- Verify chapter 1 element rendered

### Problem: Dark mode tidak berubah

**Solution:**
- Pastikan isDarkMode state updated
- Check className conditional logic
- Verify CSS classes applied

### Problem: Images tidak load

**Solution:**
- Check image URLs valid
- Verify fallback image exists
- Check CORS settings di API

### Problem: API connection error

**Solution:**
- Verify NEXT_PUBLIC_API_URL correct
- Check network connection
- Try alternative API URL

## 📚 Documentation

- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Setup & implementation guide
- [AUTO_SCROLL_DOCUMENTATION.md](AUTO_SCROLL_DOCUMENTATION.md) - Auto-scroll detailed docs
- [API_ANALYSIS.md](API_ANALYSIS.md) - API endpoints analysis
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick reference guide

## 🎓 Learning Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)

## ✅ Implementation Checklist

- [x] Setup Next.js dengan App Router
- [x] Setup Tailwind CSS
- [x] Create TypeScript interfaces
- [x] Create API service & hooks
- [x] Create components
- [x] Implement auto-scroll dengan useRef
- [x] Add dark/light mode
- [x] Add pagination
- [x] Add responsive design
- [x] Test functionality
- [ ] Deploy to production
- [ ] Monitor performance

## 🤝 Contributing

Kontribusi sangat diterima! Silakan fork repository dan buat pull request.

## 📄 License

MIT License - Silakan gunakan project ini untuk keperluan apapun.

## 🙏 Credits

- **API:** [VernSG/Komiku-Rest-Api](https://github.com/VernSG/Komiku-Rest-Api)
- **Source:** [Komiku.id](https://komiku.id)
- **Framework:** [Next.js](https://nextjs.org)
- **UI:** [Tailwind CSS](https://tailwindcss.com)

## 📞 Support

Ada pertanyaan atau issue? 
- Check dokumentasi di folder ini
- Review GitHub issues
- Create new issue dengan detail lengkap

## 🎉 Get Started Now!

```bash
git clone <your-repo>
cd komiku-app
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) dan mulai membaca komik! 📖

---

**Happy Reading! 🚀**

Last Updated: April 2026
