/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'sparfuchs-primary': '#ff6b35',
        'sparfuchs-secondary': '#f4f4f4',
        'sparfuchs-success': '#28a745',
        'sparfuchs-warning': '#ffc107',
        'sparfuchs-error': '#dc3545',
        'sparfuchs-text': '#333333',
        'sparfuchs-text-light': '#666666',
        'sparfuchs-border': '#e0e0e0',
        'sparfuchs-surface': '#ffffff',
      },
    },
  },
  plugins: [],
}

