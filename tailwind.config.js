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
          50: '#F1EFFC',
          100: '#E8E4F9',
          500: '#5B47E0',
          600: '#4B38CE',
          700: '#3B2AB7'
        },
        secondary: {
          500: '#8B7FE8',
          600: '#7B6FDB'
        },
        accent: {
          500: '#FFB800',
          600: '#E5A500'
        },
        surface: '#FFFFFF',
        background: '#F8F9FC',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'confetti': 'confetti 0.5s ease-out',
        'scale-up': 'scale-up 0.2s ease-out',
        'fade-out': 'fade-out 0.3s ease-in'
      },
      keyframes: {
        confetti: {
          '0%': { transform: 'scale(0.5) rotate(0deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(180deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(360deg)', opacity: '1' }
        },
        'scale-up': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' }
        },
        'fade-out': {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0.5', transform: 'translateX(8px)' }
        }
      }
    }
  },
  plugins: []
}