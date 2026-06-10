/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#E8EAF6',
          100: '#C5CAE9',
          200: '#9FA8DA',
          300: '#7986CB',
          400: '#5C6BC0',
          500: '#1A237E',
          600: '#172069',
          700: '#131B57',
          800: '#0F1645',
          900: '#0A0F2E',
        },
        gold: {
          50:  '#FFFDE7',
          100: '#FFF9C4',
          200: '#FFF590',
          300: '#FFF176',
          400: '#FFEE58',
          500: '#FFD700',
          600: '#F9C700',
          700: '#F0B400',
          800: '#E6A000',
          900: '#CC8800',
        },
        brand: {
          blue:  '#1A237E',
          gold:  '#FFD700',
          white: '#FFFFFF',
          dark:  '#0D0D0D',
        }
      },
      fontFamily: {
        heading:   ['"Playfair Display"', 'Georgia', 'serif'],
        body:      ['"Inter"', 'system-ui', 'sans-serif'],
        scripture: ['"Lora"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}