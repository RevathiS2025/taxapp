/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1B4FD8',
          light: '#EEF2FF',
          hover: '#1640B0',
        },
        success: {
          DEFAULT: '#15803D',
          light: '#DCFCE7',
        },
        warning: '#B45309',
        neutral: {
          900: '#111827',
          600: '#4B5563',
          300: '#D1D5DB',
          100: '#F3F4F6',
        },
      },
      boxShadow: {
        panel: '0 2px 8px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
