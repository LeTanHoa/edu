/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Sky blue main theme
          600: '#0284c7',
          700: '#0369a1',
        },
        sunny: {
          100: '#fef9c3',
          400: '#facc15',
          500: '#eab308', // Warm learning gold
        },
        forest: {
          100: '#dcfce7',
          500: '#22c55e', // Emerald success green
        },
        coral: {
          100: '#ffe4e6',
          500: '#f43f5e', // Fun bright rose/coral
        },
        playful: {
          purple: '#a855f7',
          orange: '#f97316',
          pink: '#ec4899',
        }
      },
      fontFamily: {
        comic: ['"Comic Neue"', 'Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
