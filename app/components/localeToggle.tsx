"use client";

import { useLocale } from "./localeProvider";
import type { Locale } from "@/lib/i18n";

const locales: Locale[] = ["en", "id"];

export default function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center rounded-lg border border-[#2E3446] overflow-hidden text-xs font-semibold">
      {locales.map((l, i) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          aria-label={`Switch to ${l.toUpperCase()}`}
          className={`px-2.5 py-1.5 transition-colors ${
            locale === l
              ? "bg-[#2D9CDB] text-white"
              : "bg-transparent text-[#8B8FA3] hover:text-[#E8E9ED]"
          } ${i < locales.length - 1 ? "border-r border-[#2E3446]" : ""}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
