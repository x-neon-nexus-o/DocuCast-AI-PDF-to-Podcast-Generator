/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070b16',
          900: '#0b1120',
          850: '#0e1525',
          800: '#111a2e',
          700: '#16223a',
          600: '#1b2a48',
          500: '#243352',
          400: '#2e3f63',
          300: '#3a4d75',
        },
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#b3d6ff',
          300: '#7ab8ff',
          400: '#3d96ff',
          500: '#1b7bf6',
          600: '#0b5fd6',
          700: '#0a4aae',
          800: '#0d3d8a',
          900: '#0e3570',
        },
        cyan: {
          glow: '#4cd9e8',
          400: '#22c8e0',
          500: '#06b3d4',
          600: '#0893b0',
        },
        good: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        warn: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        bad: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(7, 11, 22, 0.25)',
        card: '0 6px 24px rgba(7, 11, 22, 0.35)',
        glow: '0 0 0 1px rgba(59, 150, 255, 0.18), 0 8px 30px rgba(27, 123, 246, 0.12)',
        inset: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-fast': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'wave': {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'progress-glow': {
          '0%, 100%': { opacity: '0.5', transform: 'scaleX(1)' },
          '50%': { opacity: '1', transform: 'scaleX(1.02)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'fade-in-fast': 'fade-in-fast 0.2s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin-slow 1.2s linear infinite',
      },
    },
  },
  plugins: [],
};
