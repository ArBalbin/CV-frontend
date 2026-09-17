/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        paper: '#F6F5F1',
        ink: {
          DEFAULT: '#181B20',
          soft: '#4B515C',
          faint: '#8A909B',
        },
        line: '#DEDCD3',
        signal: {
          DEFAULT: '#0E7C86',
          soft: '#E4F1F1',
          strong: '#0A5F67',
        },
        amber: {
          signal: '#B8791B',
          soft: '#F5EBD8',
        },
        brick: {
          signal: '#AD3E31',
          soft: '#F5E2DE',
        },
        moss: {
          signal: '#2F7A4F',
          soft: '#E1EFE5',
        },
      },
      borderRadius: {
        sm: '3px',
        DEFAULT: '4px',
        md: '6px',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
