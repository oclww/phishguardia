import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#060d18',
        surface: '#0c1526',
        border: '#1a2740',
        cyan: {
          DEFAULT: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
        },
        violet: {
          DEFAULT: '#a78bfa',
          400: '#c4b5fd',
        },
        green: {
          DEFAULT: '#34d399',
          400: '#4ade80',
        },
        red: {
          DEFAULT: '#fb7185',
          400: '#f87171',
        },
        amber: {
          DEFAULT: '#fbbf24',
          400: '#facc15',
        },
        text: '#eaf2fb',
        muted: '#7a96b4',
      },
      fontFamily: {
        space: ['var(--font-space-grotesk)', 'sans-serif'],
        syne: ['var(--font-syne)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        scan: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
      },
    },
  },
  plugins: [],
}

export default config
