/**
 * Tailwind CSS Configuration — Apple × Anthropic Monochrome
 */
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Apple dark system fills */
        surface: {
          DEFAULT: '#1C1C1E',
          raised:  '#2C2C2E',
          elevated:'#3A3A3C',
        },
        border: 'rgba(255,255,255,0.08)',
        /* Claude orange */
        accent: {
          DEFAULT: '#DA7756',
          hover:   '#E8976E',
          subtle:  'rgba(218,119,86,0.12)',
        },
        /* Semantic */
        success:  '#30D158',
        danger:   '#FF453A',
        warning:  '#FF9F0A',
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', '-apple-system', 'BlinkMacSystemFont',
               'SF Pro Text', 'Helvetica Neue', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'fade-in':   'fadeIn 0.3s ease',
        'slide-up':  'slideInUp 0.35s cubic-bezier(0.16,1,0.3,1)',
        'shimmer':   'shimmer 1.6s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInUp: {
          '0%':   { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
      },
      boxShadow: {
        'card':  '0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.25)',
        'lifted':'0 8px 32px rgba(0,0,0,0.5)',
        'float': '0 20px 60px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
  darkMode: 'media',
};

export default config;
