import type { Config } from 'tailwindcss'

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
        },
      },
      fontFamily: {
        gotcha: ['Hey Gotcha', 'sans-serif'],
        roxborough: ['Roxborough CF', 'Georgia', 'serif'],
        raleway: ['var(--font-raleway)', 'Raleway', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
