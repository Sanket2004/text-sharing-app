/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["National Park", "sans-serif"],
        serif: ["Bricolage Grotesque", "serif"],
      },
    },
  },
  plugins: [],
}