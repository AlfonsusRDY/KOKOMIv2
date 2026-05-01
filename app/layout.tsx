import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { LocaleProvider } from './components/localeProvider';
import LocaleToggle from './components/localeToggle';
import NavLinks from './components/navLinks';

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
          <nav className="sticky top-0 z-40 glass border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-14 gap-6">
                {/* Logo */}
                <a
                  href="/"
                  className="flex items-center flex-shrink-0 group"
                >
                  <span
                    className="text-sm font-bold tracking-tight transition-opacity group-hover:opacity-70"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    TMKOKOMI
                  </span>
                </a>

                {/* Nav items */}
                <div className="flex items-center gap-1">
                  <NavLinks />
                  <div
                    className="w-px h-4 mx-1 flex-shrink-0"
                    style={{ backgroundColor: 'var(--border-strong)' }}
                  />
                  <LocaleToggle />
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
                  &copy; {new Date().getFullYear()} TMKOKOMI. Free to read, built for fun.
                </p>
              </div>
            </div>
          </footer>
        </LocaleProvider>
      </body>
    </html>
  );
}
