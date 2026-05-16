// File: tailwind.config.ts
// Purpose: Tailwind theme — cosmic purple palette + dark mode via class strategy
// Step: Step-7 — React UI

import type { Config } from 'tailwindcss'

export default {
  // Class strategy lets us toggle dark mode manually via ThemeToggle
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // ── Cosmic purple colour tokens ──────────────────────────────────────────
      colors: {
        cosmic: {
          50:  '#f0edff',
          100: '#e0d9ff',
          200: '#c4b8ff',
          300: '#a593ff',
          400: '#8b6fff',
          500: '#7c3aed', // primary accent
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#2e1065',
          950: '#1a0840',
        },
        void: {
          // Near-black surface colours for dark mode depth
          900: '#0d0a1a',
          800: '#13102b',
          700: '#1c1838',
          600: '#261f4a',
        },
      },
      // ── Distinctive font pairing ─────────────────────────────────────────────
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      // ── Subtle glow animations ───────────────────────────────────────────────
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px 0px rgba(124,58,237,0.4)' },
          '50%':      { boxShadow: '0 0 20px 4px rgba(124,58,237,0.7)' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        'fade-up':    'fade-up 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
} satisfies Config
