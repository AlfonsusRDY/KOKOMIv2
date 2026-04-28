import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TMKOKOMI - Baca Komik Online',
  description: 'Platform membaca komik online dengan kualitas terbaik',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased">
        {/* Navigation Bar */}
        <nav className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="text-2xl font-bold text-blue-600">
                📚 TMKOKOMI
              </a>
              <div className="flex items-center gap-4">
                <a href="/" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition">
                  Beranda
                </a>
                <a
                  href="/search"
                  className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 transition"
                >
                  🔍 Cari Komik
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p>© 2026 TMKOKOMI. All rights reserved.</p>
              <p className="text-sm mt-2">Built with Next.js, React, and Tailwind CSS</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
