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
  title: 'TMKOKOMI - Read Comics Online',
  description: 'Read manga, manhwa, and manhua online for free.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="antialiased font-sans" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <LocaleProvider>
          {/* Navigation */}
          <nav
            className="sticky top-0 z-40 border-b"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center justify-between gap-4">
                <a
                  href="/"
                  className="text-xl font-extrabold tracking-tight transition-opacity hover:opacity-80 flex-shrink-0"
                  style={{ color: 'var(--accent)' }}
                >
                  TMKOKOMI
                </a>
                <div className="flex items-center gap-3">
                  <NavLinks />
                  <LocaleToggle />
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            {children}
          </main>

          {/* Footer */}
          <footer
            className="border-t"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                <p>&copy; 2026 TMKOKOMI. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </LocaleProvider>
      </body>
    </html>
  );
}
