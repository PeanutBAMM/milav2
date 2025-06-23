/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bolt-green': '#34D186',
        'bolt-green-dark': '#2BB673',
        'bolt-black': '#2E3333',
        'bolt-gray-dark': '#6C7072',
        'bolt-gray-light': '#EBEDF0',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
