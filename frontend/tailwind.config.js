/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        storm: {
          900: '#384959',
          500: '#6A89A7',
          300: '#88BDF2',
          100: '#BDDDFC',
        }
      }
    },
  },
  plugins: [],
}