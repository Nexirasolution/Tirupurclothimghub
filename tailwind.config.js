/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      animation: {
        marquee: 'marquee 22s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      colors: {
        brand: {
          pink: '#E0162F',       // bright red from the card's curved accent shapes
          magenta: '#8B1A3D',    // deep maroon — primary brand color (wordmark, CTAs, prices)
          rose: '#A8395C',       // lighter maroon tint, for hovers/secondary accents
          green: '#3D8B5C',      // lighter green, for subtle highlights
          deepgreen: '#1F6B3B',  // forest green from the logo's leaves
          gold: '#D4AF37',       // gold ring/scroll detailing
          cream: '#FBF6EC',      // warm off-white background
          ink: '#2B1B14'         // dark brown-black text color
        }
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)']
      },
      boxShadow: {
        soft: '0 8px 30px -8px rgba(139,26,61,0.18)'
      },
      borderRadius: {
        xl2: '1.25rem'
      }
    }
  },
  plugins: []
};