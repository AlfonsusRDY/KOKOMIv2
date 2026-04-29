"use client";

import Link from "next/link";
import { useLocale } from "./localeProvider";

export default function NavLinks() {
  const { t } = useLocale();
  return (
    <>
      <Link
        href="/"
        className="text-sm font-medium transition-colors hover:opacity-80"
        style={{ color: 'var(--text-secondary)' }}
      >
        {t.navHome}
      </Link>
      <Link
        href="/search"
        className="text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
        style={{
          backgroundColor: 'var(--bg-raised)',
          color: 'var(--text-secondary)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.color = 'var(--accent)';
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
          (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
        }}
      >
        {t.navSearch}
      </Link>
    </>
  );
}
