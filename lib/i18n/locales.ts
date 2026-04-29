export type Locale = "en" | "id";
export const defaultLocale: Locale = "en";
export const availableLocales: Locale[] = ["en", "id"];

/** Shape of a translations dictionary — values are strings or string-returning functions */
export type TranslationDict = {
  // Nav
  navBrand: string;
  navHome: string;
  navSearch: string;
  // Hero
  heroBadge: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  // Home
  latestUpdates: string;
  latestFirst: string;
  popularComics: string;
  topTen: string;
  failedToLoad: string;
  // Search
  back: string;
  searchResults: string;
  results: string;
  searchComics: string;
  searchPlaceholder: string;
  searchPrompt: string;
  noResults: string;
  search: string;
  // Comic detail
  home: string;
  author: string;
  readers: string;
  chapterLabel: string;
  // Chapter list
  chapterListTitle: string;
  readFromStart: string;
  searchChapterPlaceholder: string;
  chapterNotFound: string;
  read: string;
  chapterCount: string;
  pageLabel: string;
  // Chapter reader
  prev: string;
  next: string;
  backToList: string;
  pageFailed: (n: number) => string;
  chapterImagesUnavailable: string;
  // Footer
  footerRights: string;
};
