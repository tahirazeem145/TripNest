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
          50:  '#f0f6f4',
          100: '#dbece7',
          200: '#b8d6cd',
          300: '#8ab4a7',
          450: '#2A7F73', // Secondary accent
          500: '#164A41', // Primary Brand / Main Accent (#164A41)
          600: '#0f3630',
          700: '#0b2622',
          800: '#071b18',
          900: '#04100e',
          orange: '#E8894A' // Highlight CTA Accent
        },
        surface: {
          DEFAULT: '#FFFFFF',
          hover:   '#EEF3F0',
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
