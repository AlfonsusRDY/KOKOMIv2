/**
 * Root Layout untuk Next.js App Router
 * Path: app/layout.tsx
 */

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Komiku - Baca Komik Online',
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
                📚 Komiku
              </a>
              <div className="flex items-center gap-4">
                <a
                  href="/"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition"
                >
                  Home
                </a>
                <a
                  href="/search"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition"
                >
                  Search
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
              <p>© 2026 Komiku. All rights reserved.</p>
              <p className="text-sm mt-2">
                Built with Next.js, React, and Tailwind CSS
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
