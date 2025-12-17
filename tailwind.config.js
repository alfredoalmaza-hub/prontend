/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#021526',
        secondary: '#03346E',
        accent: '#6EACDA',
        light: '#E2E2B6',
      },
    },
  },
  plugins: [],
}
