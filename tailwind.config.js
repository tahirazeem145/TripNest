/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          50:  '#f5f5f7',
          100: '#e5e5e7',
          200: '#d1d1d6',
          300: '#a1a1a6',
          400: '#ffffff',
          500: '#ffffff',
          600: '#e5e5e7',
          700: '#d1d1d6',
          800: '#2c2c2e',
          900: '#1c1c1e',
        },
        slate: {
          50:  '#f5f5f7',
          100: '#e5e5e7',
          200: '#d1d1d6',
          300: '#a1a1a6',
          400: '#8e8e93',
          500: '#636366',
          600: '#48484a',
          700: '#2c2c2e',
          800: '#1c1c1e',
          900: '#0a0a0a',
          950: '#000000',
        },
        surface: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          hover:   'rgba(255,255,255,0.12)',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
