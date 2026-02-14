/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: "#0a0a0f",
          800: "#12121a",
          700: "#1a1a2e",
          600: "#1a1a2e",
        },
        accent: {
          blue: "#4f8cff",
          green: "#34d399",
          red: "#f87171",
          yellow: "#fbbf24",
          purple: "#a78bfa",
        },
      },
    },
  },
  plugins: [],
};
