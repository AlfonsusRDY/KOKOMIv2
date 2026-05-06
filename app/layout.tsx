import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { LocaleProvider } from './components/localeProvider';
import NotificationBell from './components/notificationBell';
import SearchBar from './components/searchBar';
import ThemeSwitcher from './components/themeSwitcher';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TMKOKOMI - Free comics online',
  description: 'Read manga, manhwa, and manhua for free. No account needed.',

};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="antialiased font-sans">
        <LocaleProvider>
          {/* ── Navigation ─────────────────────────────── */}
          <nav className="sticky top-0 z-40 border-b" style={{ borderColor: 'var(--border)', background: 'var(--nav-bg)' }}>
            <div className="max-w-[1728px] mx-auto px-4 sm:px-8 lg:px-12">
              <div className="grid grid-cols-[auto_1fr_auto] items-center h-20 gap-5 lg:gap-8">
                {/* Logo */}
                <a
                  href="/"
                  className="flex items-center gap-2.5 flex-shrink-0 group"
                >
                  <span
                    className="relative flex h-8 w-8 items-center justify-center rounded-md border text-lg font-black leading-none transition-opacity group-hover:opacity-80"
                    style={{ borderColor: 'var(--border-strong)', color: 'var(--accent)' }}
                  >
                    X
                  </span>
                  <span
                    className="hidden sm:inline text-xl font-black tracking-tight transition-opacity group-hover:opacity-70"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    TMKOKOMI
                  </span>
                </a>

                <div className="hidden md:block max-w-2xl w-full mx-auto">
                  <SearchBar compact autoFocus={false} />
                </div>

                {/* Nav items */}
                <div className="flex items-center justify-end gap-2">
                  <ThemeSwitcher />
                  <NotificationBell />
                  <div
                    className="hidden h-10 w-10 items-center justify-center overflow-hidden rounded-full border sm:flex"
                    style={{ background: 'var(--bg-raised)', borderColor: 'var(--border-strong)' }}
                    aria-label="Profile"
                  >
                    <span className="text-lg font-black" style={{ color: 'var(--accent)' }}>TM</span>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* ── Main Content ───────────────────────────── */}
          <main className="min-h-screen">
            {children}
          </main>

          {/* ── Footer ────────────────────────────────── */}
          <footer className="border-t mt-16" style={{ borderColor: 'var(--border)' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    TMKOKOMI
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  &copy; {new Date().getFullYear()} TMKOKOMI. TM dedicated manga reading app.
                </p>
              </div>
            </div>
          </footer>
        </LocaleProvider>
      </body>
    </html>
  );
}
