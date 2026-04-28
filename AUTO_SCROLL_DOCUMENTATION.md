# 🎯 Implementasi Auto-Scroll dengan useRef - Dokumentasi Lengkap

## 📌 Overview

File: `components/komik/detail/ChapterList.tsx`

Komponen ini mengimplementasikan fitur **"Baca dari Awal"** yang otomatis melakukan smooth scroll ke chapter pertama (Chapter 1) dengan efek highlight.

---

## 🔧 Cara Kerja Auto-Scroll

### 1. **Setup Refs**

```typescript
// Ref untuk chapter list container
const chapterListRef = useRef<HTMLDivElement>(null);

// Ref untuk chapter pertama (target scroll)
const firstChapterRef = useRef<HTMLDivElement>(null);

// State untuk tracking scroll status
const [isScrolling, setIsScrolling] = useState(false);
```

**Penjelasan:**
- `chapterListRef` → Ref untuk keseluruhan list chapter (opsional, bisa untuk advanced scroll logic)
- `firstChapterRef` → Ref untuk elemen chapter pertama (TARGET untuk scrolling)
- `isScrolling` → State untuk disable button saat sedang scroll

---

### 2. **Function: scrollToFirstChapter**

```typescript
const scrollToFirstChapter = useCallback(() => {
  // 1. Pastikan ref tidak null
  if (!firstChapterRef.current) return;

  // 2. Set state scrolling = true (disable button)
  setIsScrolling(true);

  // 3. Scroll ke elemen dengan smooth behavior
  firstChapterRef.current.scrollIntoView({
    behavior: 'smooth',      // Smooth scroll animation
    block: 'center',         // Position di tengah viewport
  });

  // 4. Add highlight class untuk visual feedback
  firstChapterRef.current.classList.add('highlight-pulse');

  // 5. Remove highlight setelah 2 detik
  setTimeout(() => {
    firstChapterRef.current?.classList.remove('highlight-pulse');
    setIsScrolling(false);
  }, 2000);
}, []);
```

**Breakdown:**
```
┌─────────────────────────────────────────────┐
│ User clicks "Baca dari Awal" button         │
└─────────────────────┬───────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│ scrollToFirstChapter() dipanggil            │
└─────────────────────┬───────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│ firstChapterRef.current.scrollIntoView()    │
│ → Browser scroll ke element secara smooth   │
└─────────────────────┬───────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│ Add highlight-pulse class (animation)       │
│ → Highlight effect selama 2 detik           │
└─────────────────────┬───────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│ setIsScrolling(false) → Button active lagi  │
└─────────────────────────────────────────────┘
```

---

### 3. **HTML Structure dengan Refs**

```typescript
// CONTAINER (tidak perlu ref untuk basic functionality)
<div ref={chapterListRef} className="overflow-y-auto max-h-[600px]">
  
  {/* MAP CHAPTERS */}
  {displayedChapters.map((chapter, index) => {
    
    // FLAG: Check jika chapter ini adalah chapter pertama
    const isFirstChapter = chapter.chapterNumber === chapters[0]?.chapterNumber;

    return (
      // ELEMEN DENGAN REF (jika chapter pertama)
      <div
        key={`${chapter.chapterNumber}-${index}`}
        ref={isFirstChapter ? firstChapterRef : null}  // ⭐ REF ASSIGNMENT
        className="p-4 transition..."
      >
        {/* Content */}
      </div>
    );
  })}
</div>
```

**Penting:**
- Hanya chapter pertama yang mendapat `ref={firstChapterRef}`
- Kondisi: `ref={isFirstChapter ? firstChapterRef : null}`
- Chapter lainnya: `ref={null}`

---

### 4. **CSS Animation untuk Highlight**

```typescript
<style jsx>{`
  @keyframes highlight-pulse {
    0% {
      background-color: ${isDarkMode 
        ? 'rgba(34, 197, 94, 0.2)'      // Dark: green semi-transparent
        : 'rgba(34, 197, 94, 0.1)'      // Light: green lighter
      };
    }
    50% {
      background-color: ${isDarkMode 
        ? 'rgba(34, 197, 94, 0.4)'
        : 'rgba(34, 197, 94, 0.2)'
      };
    }
    100% {
      background-color: transparent;
    }
  }

  :global(.highlight-pulse) {
    animation: highlight-pulse 2s ease-in-out;
  }
`}</style>
```

**Efek:**
- Animasi 2 detik
- Pulse dari semi-transparent green → opaque → transparent
- Memberikan visual feedback bahwa scroll berhasil

---

## 🎨 Button Implementation

### Tombol "Baca dari Awal"

```typescript
<button
  onClick={scrollToFirstChapter}                    // ⭐ Trigger auto-scroll
  disabled={isScrolling}                             // Disable saat scroll
  className={`px-4 py-2 rounded-lg font-semibold transition ${
    isScrolling
      ? isDarkMode
        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : isDarkMode
      ? 'bg-green-600 hover:bg-green-700 text-white'
      : 'bg-green-500 hover:bg-green-600 text-white'
  }`}
>
  <span>
    {isScrolling ? '⏳' : '📖'}
  </span>
  <span>
    {isScrolling ? 'Scrolling...' : 'Baca dari Awal'}
  </span>
</button>
```

**Fitur:**
- Icon berubah: 📖 → ⏳ saat scroll
- Text berubah: "Baca dari Awal" → "Scrolling..."
- Disabled state: Button tidak bisa diklik saat scroll
- Color feedback: Visual cue untuk disabled state

---

## 📊 Diagram Alur Lengkap

```
┌──────────────────────────────────────────────────────────────┐
│                      CHAPTER LIST PAGE                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              TOMBOL "BACA DARI AWAL" ✓                   │ │
│  │  (onClick → scrollToFirstChapter)                        │ │
│  └──────────────────────┬──────────────────────────────────┘ │
│                         │                                      │
│  ┌──────────────────────▼──────────────────────────────────┐ │
│  │         CHAPTER LIST CONTAINER (max-h: 600px)          │ │
│  │  ┌─────────────────────────────────────────────────┐   │ │
│  │  │ Chapter 700                                      │   │ │
│  │  └─────────────────────────────────────────────────┘   │ │
│  │  ┌─────────────────────────────────────────────────┐   │ │
│  │  │ Chapter 699                                      │   │ │
│  │  └─────────────────────────────────────────────────┘   │ │
│  │  ┌─────────────────────────────────────────────────┐   │ │
│  │  │ ...                                              │   │ │
│  │  └─────────────────────────────────────────────────┘   │ │
│  │  ┌─────────────────────────────────────────────────┐   │ │
│  │  │ Chapter 2                                        │   │ │
│  │  └─────────────────────────────────────────────────┘   │ │
│  │  ┌─────────────────────────────────────────────────┐   │ │
│  │  │ Chapter 1 ⭐ (ref=firstChapterRef)         ◄────┼───┼─┤ AUTO-SCROLL TUJUAN
│  │  └─────────────────────────────────────────────────┘   │ │
│  └──────────────────────────────────────────────────────┐ │
│  │          Pagination Controls                        │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

scrollIntoView({
  behavior: 'smooth',  ← Animasi scroll yang halus
  block: 'center'      ← Chapter 1 berada di tengah layar
})
```

---

## 🚀 Usage Example dalam Next.js

### File: `app/komik/[slug]/page.tsx`

```typescript
'use client';

import ComicDetailContent from '@/components/komik/detail/ComicDetailContent';
import { useComicDetail } from '@/hooks/useKomiku';

export default function ComicDetailPage({ params }) {
  const { data: detail, loading, error } = useComicDetail(params.slug);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;

  return <ComicDetailContent detail={detail} isDarkMode={true} />;
}
```

### File: `components/komik/detail/ComicDetailContent.tsx`

```typescript
export default function ComicDetailContent({ detail, isDarkMode }) {
  return (
    <main>
      <ComicHeader detail={detail} isDarkMode={isDarkMode} />
      
      {/* ChapterList component dengan auto-scroll functionality */}
      <ChapterList
        chapters={detail.chapters}
        komikSlug={detail.slug}
        isDarkMode={isDarkMode}
      />
    </main>
  );
}
```

---

## 🔄 useCallback vs useEffect

### Mengapa menggunakan `useCallback`?

```typescript
// ✅ BAIK - dengan useCallback
const scrollToFirstChapter = useCallback(() => {
  // ...
}, []);

// ❌ HINDARI - function tanpa memoization
const scrollToFirstChapter = () => {
  // ...
}
```

**Alasan:**
1. Function baru dibuat setiap render
2. Dengan `useCallback`, function hanya dibuat sekali
3. Mencegah unnecessary re-renders di child components
4. Lebih optimal untuk performance

---

## 🎨 Customization

### Ubah Durasi Highlight (saat ini 2 detik)

```typescript
// Di ChapterList.tsx

// Ubah timeout dari 2000ms ke nilai lain
setTimeout(() => {
  firstChapterRef.current?.classList.remove('highlight-pulse');
  setIsScrolling(false);
}, 2000);  // ← Ubah value ini (dalam milliseconds)
```

### Ubah Warna Highlight

```typescript
// Di <style jsx>
@keyframes highlight-pulse {
  0% {
    background-color: rgba(59, 130, 246, 0.2);  // ← Ubah RGB value
  }
  50% {
    background-color: rgba(59, 130, 246, 0.4);
  }
  100% {
    background-color: transparent;
  }
}
```

### Ubah Scroll Position

```typescript
// Ubah 'center' ke posisi lain
firstChapterRef.current.scrollIntoView({
  behavior: 'smooth',
  block: 'start',    // Top of viewport
  // block: 'center', // Middle of viewport (default)
  // block: 'end',    // Bottom of viewport
});
```

---

## ⚡ Performance Optimization Tips

1. **Memoization:**
   ```typescript
   // Gunakan useCallback untuk functions
   const scrollToFirstChapter = useCallback(() => {
     // ...
   }, []);
   ```

2. **Lazy Loading Chapters:**
   ```typescript
   // Hanya load chapters yang visible (virtual scrolling)
   // Gunakan library seperti react-window atau react-virtualized
   ```

3. **Debouncing Scroll:**
   ```typescript
   // Jika ada multiple scroll events
   const handleScroll = useMemo(
     () => debounce(scrollToFirstChapter, 300),
     []
   );
   ```

---

## 🐛 Debugging

### Cek apakah ref ter-assign dengan benar

```typescript
useEffect(() => {
  console.log('firstChapterRef:', firstChapterRef.current);
}, []);
```

### Test scrollIntoView di browser console

```javascript
// Cari elemen chapter pertama
const firstChapter = document.querySelector('[data-chapter-number="1"]');

// Scroll ke sana
firstChapter?.scrollIntoView({ behavior: 'smooth', block: 'center' });
```

---

## ✅ Checklist Implementasi

- [x] Setup `useRef` untuk firstChapter
- [x] Create `scrollToFirstChapter` function dengan `useCallback`
- [x] Assign ref ke chapter pertama dengan conditional
- [x] Call function dari button onClick
- [x] Add highlight animation
- [x] Test scroll behavior
- [x] Test dark/light mode
- [x] Test disabled state saat scrolling
- [x] Optimize dengan useCallback
- [x] Add CSS animations

---

## 📚 Resources

- [MDN - scrollIntoView](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView)
- [React Hooks - useRef](https://react.dev/reference/react/useRef)
- [React Hooks - useCallback](https://react.dev/reference/react/useCallback)
- [CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/animation)

---

## 🎉 Selesai!

Auto-scroll implementation siap digunakan. Tombol "Baca dari Awal" akan:
1. ✅ Smooth scroll ke chapter 1
2. ✅ Highlight chapter 1 dengan efek pulse
3. ✅ Disable button selama scroll
4. ✅ Support dark/light mode
5. ✅ Optimized dengan useCallback

Happy scrolling! 🚀
