/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { 
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        }
      },
      animation: {
        'gradient-shift': 'gradient-shift 3s ease infinite'
      },
      rotate: {
        'y-90': 'rotateY(90deg)',
      },
      perspective: {
        '1000': '1000px',
      },
      transitionDuration: {
        '600': '600ms',
      },
    },
  },
  plugins: [],
} 