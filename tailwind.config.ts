import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        henko: {
          turquoise: '#1f8f9b',
          'turquoise-light': '#2aa8b5',
          greenblue: '#addbd2',
          yellow: '#eddc88',
          purple: '#958cba',
          white: '#f9f3ef',
          coral: '#d69494',
          orange: '#efb252',
          // Superficies editoriales (PRP-015)
          paper: '#f9f3ef',
          'paper-deep': '#f2e9e2',
          card: '#fffdfb',
          ink: '#2b3338',
          'ink-soft': '#5c6a70',
          hairline: 'rgba(43, 51, 56, 0.14)',
        },
      },
      fontFamily: {
        gotcha: ['Hey Gotcha', 'sans-serif'],
        roxborough: ['Roxborough CF', 'Georgia', 'serif'],
        raleway: ['var(--font-raleway)', 'Raleway', 'sans-serif'],
      },
      fontSize: {
        // Escala display fluida para titulares serif (PRP-015)
        'display-2xl': ['clamp(2.75rem, 6vw, 5.25rem)', { lineHeight: '1.04', letterSpacing: '-0.02em' }],
        'display-xl': ['clamp(2.25rem, 4.5vw, 3.75rem)', { lineHeight: '1.08', letterSpacing: '-0.015em' }],
        'display-lg': ['clamp(1.75rem, 3vw, 2.75rem)', { lineHeight: '1.12', letterSpacing: '-0.01em' }],
        overline: ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0.18em' }],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(43, 51, 56, 0.04), 0 8px 24px rgba(43, 51, 56, 0.06)',
        lift: '0 2px 4px rgba(43, 51, 56, 0.05), 0 18px 44px rgba(43, 51, 56, 0.10)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [typography],
}

export default config
