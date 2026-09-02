/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#0F1117',
          900: '#12141C',
          800: '#1A1D29',
          700: '#242836',
          600: '#333849',
        },
        paper: {
          50: '#F3F5F7',
          100: '#FFFFFF',
          200: '#E4E7EC',
        },
        amber: {
          DEFAULT: '#E8A33D',
          light: '#F0B85F',
          dark: '#C4832A',
        },
        teal: {
          DEFAULT: '#5EC8C0',
          light: '#7FD6CF',
        },
      },
      maxWidth: {
        content: '72rem',
      },
    },
  },
  plugins: [],
}
