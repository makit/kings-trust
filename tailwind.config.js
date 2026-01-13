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
        // Kings Trust Brand Colors
        brand: {
          red: '#cc0033',
          green: '#28d796',
          'red-hover': '#a80029',
          'green-hover': '#20b87a',
        },
        // Primary color system (Kings Trust Red)
        primary: {
          50: '#ffe5ec',
          100: '#ffccd9',
          200: '#ff99b3',
          300: '#ff668c',
          400: '#ff3366',
          500: '#cc0033',
          600: '#a80029',
          700: '#85001f',
          800: '#610015',
          900: '#3d000a',
        },
        // Secondary color (Green for success/positive)
        secondary: {
          50: '#e6faf3',
          100: '#ccf5e7',
          200: '#99ebcf',
          300: '#66e1b7',
          400: '#33d79f',
          500: '#28d796',
          600: '#20b87a',
          700: '#18995e',
          800: '#107a42',
          900: '#085b26',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'bounce-in': 'bounceIn 0.6s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pop': 'pop 0.3s ease-out',
        'confetti': 'confetti 0.8s ease-out',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-100px) rotate(360deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
