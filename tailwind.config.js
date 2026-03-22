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
        neutral: {
          300: '#737373', // was #d4d4d4, now maps to default 500
          400: '#525252', // was #a3a3a3, now maps to default 600
        },
        'brand-cyan': '#00d2ff',
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
