/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        gold: '#D4AF37',
        gold2: '#FFD700',
        dark: '#080808',
        dark2: '#111111',
        dark3: '#1a1a1a',
      },
      fontFamily: {
        bebas: ['var(--font-bebas)'],
        syne: ['var(--font-syne)'],
      },
    },
  },
  plugins: [],
}
