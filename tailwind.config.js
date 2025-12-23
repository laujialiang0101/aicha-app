/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'aicha-red': '#E31837',
        'aicha-yellow': '#FFD700',
        'aicha-cream': '#FFF8E7',
      },
    },
  },
  plugins: [],
}
