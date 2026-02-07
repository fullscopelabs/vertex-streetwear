import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: '#2D2D2D',
        bone: '#F5F5F0',
        forest: '#1A3A2E',
        rust: '#C1440E',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.05em',
        wider: '0.1em',
        widest: '0.2em',
      },
      keyframes: {
        'fade-in': {
          '0%': {opacity: '0', transform: 'translateY(8px)'},
          '100%': {opacity: '1', transform: 'translateY(0)'},
        },
        'cart-bounce': {
          '0%, 100%': {transform: 'scale(1)'},
          '50%': {transform: 'scale(1.3)'},
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'cart-bounce': 'cart-bounce 0.3s ease-in-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
