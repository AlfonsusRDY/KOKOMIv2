"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "./localeProvider";

export default function NavLinks() {
  const { t } = useLocale();
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <Link
        href="/"
        className="px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150"
        style={{
          color: isActive("/") ? 'var(--text-primary)' : 'var(--text-secondary)',
          background: isActive("/") ? 'var(--bg-raised)' : 'transparent',
        }}
      >
        {t.navHome || "Home"}
      </Link>
      <Link
        href="/favorites"
        className="px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150"
        style={{
          color: isActive("/favorites") ? 'var(--text-primary)' : 'var(--text-secondary)',
          background: isActive("/favorites") ? 'var(--bg-raised)' : 'transparent',
        }}
      >
        Favorites
      </Link>
      <Link
        href="/history"
        className="px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150"
        style={{
          color: isActive("/history") ? 'var(--text-primary)' : 'var(--text-secondary)',
          background: isActive("/history") ? 'var(--bg-raised)' : 'transparent',
        }}
      >
        History
      </Link>
    </>
  );
}
