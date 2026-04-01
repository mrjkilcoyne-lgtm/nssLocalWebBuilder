/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#141414',
          dark: '#0a0a0a',
          border: '#262626',
          hover: '#1a1a1a',
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
        },
        mp: {
          bg: '#0a0a0a',
          surface: '#141414',
          border: '#262626',
          gold: '#c9a96e',
          'gold-hover': '#dbb87a',
          text: '#fafafa',
          muted: '#737373',
          amber: '#d4a574',
          emerald: '#34d399',
          red: '#f87171',
        },
      },
      fontFamily: {
        'mp-serif': ['"DM Serif Display"', 'serif'],
        'mp-body': ['"Crimson Pro"', 'serif'],
        'mp-mono': ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        'mp-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'mp-pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'mp-typing': {
          '0%': { opacity: '0.2' },
          '20%': { opacity: '1' },
          '100%': { opacity: '0.2' },
        },
      },
      animation: {
        'mp-fade-in': 'mp-fade-in 200ms ease-out',
        'mp-pulse-dot': 'mp-pulse-dot 2s ease-in-out infinite',
        'mp-typing': 'mp-typing 1.4s infinite',
      },
    },
  },
  plugins: [],
}
