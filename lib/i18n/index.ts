import en from "./en";
import id from "./id";
import { defaultLocale } from "./locales";
import type { Locale, TranslationDict } from "./locales";

const translations: Record<Locale, TranslationDict> = { en, id };

export function getTranslations(locale: Locale): TranslationDict {
  return translations[locale] ?? translations[defaultLocale];
}

export type { Locale, TranslationDict };
export { defaultLocale, availableLocales } from "./locales";
