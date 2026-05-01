"use client";

import { useLocale } from "./localeProvider";
import type { Locale } from "@/lib/i18n";

const locales: Locale[] = ["en", "id"];

export default function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className="flex items-center rounded-lg overflow-hidden text-xs font-semibold"
      style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-strong)' }}
    >
      {locales.map((l, i) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          aria-label={`Switch to ${l.toUpperCase()}`}
          className="px-2.5 py-1.5 transition-all duration-150"
          style={{
            background: locale === l ? 'var(--accent)' : 'transparent',
            color: locale === l ? '#fff' : 'var(--text-tertiary)',
            borderRight: i < locales.length - 1 ? '1px solid var(--border-strong)' : 'none',
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
