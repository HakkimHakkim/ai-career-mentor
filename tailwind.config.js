/** @type {import('tailwindcss').Config} */

export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        secondary: '#7c3aed',
        accent: '#06b6d4',

        dark: {
          bg: '#080d24',
          card: '#111633',
          border: '#1e2749',
        },

        light: {
          bg: '#e7edf6',
          card: '#f1f5fa',
          border: '#cbd5e1',
          text: '#172033',
          muted: '#5f6d80',
        },
      },

      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },

      boxShadow: {
        'soft-light':
          '0 8px 30px rgba(51,65,85,0.06)',

        'nav-light':
          '0 18px 50px rgba(51,65,85,0.12)',

        'nav-dark':
          '0 20px 70px rgba(0,0,0,0.35)',
      },
    },
  },

  plugins: [],
};