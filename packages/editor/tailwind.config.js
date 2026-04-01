/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1a1610',
          dark: '#110f0b',
          border: '#2e2820',
          hover: '#211d16',
        },
        accent: {
          DEFAULT: '#c9a96e',
          hover: '#dbb87a',
        },
        mp: {
          // The palette of a Mayfair private office
          bg: '#110f0b',              // deep walnut shadow
          surface: '#1a1610',         // dark mahogany
          'surface-warm': '#221e17',  // warm panel
          border: '#2e2820',          // aged brass edge
          'border-warm': '#3d352a',   // warm divider

          gold: '#c9a96e',            // aged brass
          'gold-hover': '#dbb87a',    // polished brass
          'gold-dim': '#9a7d4e',      // tarnished brass
          'gold-glow': 'rgba(201, 169, 110, 0.08)', // ambient warmth

          text: '#f5f0e8',            // cream stationery
          'text-warm': '#e8dfd0',     // aged paper
          muted: '#8c7e6a',           // faded ink
          'muted-warm': '#6b5f4e',    // shadow text

          amber: '#d4a574',           // desk lamp glow
          emerald: '#7ab893',         // green banker's lamp
          red: '#c47070',             // burgundy leather
          burgundy: '#8b3a3a',        // deep oxblood

          // Rich accent colours
          navy: '#1e2a3a',            // ink blue
          forest: '#1a2e1e',          // bottle green
          cream: '#f5f0e8',           // writing paper
        },
      },
      fontFamily: {
        'mp-serif': ['"Cormorant Garamond"', '"DM Serif Display"', 'serif'],
        'mp-display': ['"Playfair Display"', '"DM Serif Display"', 'serif'],
        'mp-body': ['"Crimson Pro"', 'serif'],
        'mp-mono': ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'mp-grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
        'mp-warmth': 'radial-gradient(ellipse at 30% 20%, rgba(201, 169, 110, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(212, 165, 116, 0.04) 0%, transparent 50%)',
        'mp-vignette': 'radial-gradient(ellipse at center, transparent 40%, rgba(17, 15, 11, 0.6) 100%)',
      },
      boxShadow: {
        'mp-glow': '0 0 40px rgba(201, 169, 110, 0.06)',
        'mp-inset': 'inset 0 1px 0 rgba(201, 169, 110, 0.05)',
        'mp-panel': '0 4px 24px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
      },
      keyframes: {
        'mp-fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
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
        'mp-draw-line': {
          '0%': { width: '0', opacity: '0.4' },
          '100%': { width: '240px', opacity: '1' },
        },
        'mp-warm-pulse': {
          '0%, 100%': { opacity: '0.03' },
          '50%': { opacity: '0.07' },
        },
      },
      animation: {
        'mp-fade-in': 'mp-fade-in 400ms ease-out',
        'mp-pulse-dot': 'mp-pulse-dot 2s ease-in-out infinite',
        'mp-typing': 'mp-typing 1.4s infinite',
        'mp-draw-line': 'mp-draw-line 1.2s ease-out forwards',
        'mp-warm-pulse': 'mp-warm-pulse 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
