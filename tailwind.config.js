/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#FFF4EE',
          100: '#FFE4D0',
          400: '#F49B65',
          500: '#F07A3A',
          600: '#D4621E',
          700: '#B04E16',
        },
        secondary: {
          50:  '#EBF7FD',
          100: '#C9ECFA',
          400: '#5FC4EE',
          500: '#3AABDF',
          600: '#1F8DC0',
          700: '#1570A0',
        },
        accent: {
          green:  '#5BB043',
          yellow: '#F5D800',
        },
        surface: '#F8FAFC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
