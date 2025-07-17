/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'anton': ['Anton', 'sans-serif'],
        'bebas': ['Bebas Neue', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'roboto-condensed': ['Roboto Condensed', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
