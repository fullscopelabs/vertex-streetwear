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
    },
  },
  plugins: [],
} satisfies Config;
