/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        dark: {
          50:  '#18181b',
          100: '#27272a',
          200: '#3f3f46',
          300: '#52525b',
          400: '#71717a',
        }
      },
      animation: {
        'slide-in': 'slideIn 0.2s ease-out',
        'fade-in':  'fadeIn 0.15s ease-out',
      },
      keyframes: {
        slideIn: { from: { transform: 'translateX(-10px)', opacity: 0 }, to: { transform: 'translateX(0)', opacity: 1 } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
      }
    },
  },
  plugins: [],
}