/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          main: '#111315',
          sidebar: '#151719',
          surface: '#191C1F',
          surfaceAlt: '#202428',
          hover: '#262A2F',
        },
        border: {
          subtle: '#262A2E',
          neutral: '#30353A',
          focus: '#7AA7FF',
        },
        content: {
          main: '#E8EAED',
          muted: '#A0A6AD',
          faint: '#6E7681',
        },
        accent: {
          DEFAULT: '#7AA7FF',
          hover: '#6896EE',
          dim: 'rgba(122, 167, 255, 0.12)',
        },
        status: {
          success: '#34D399',
          successDim: 'rgba(52, 211, 153, 0.12)',
          warning: '#FBBF24',
          warningDim: 'rgba(251, 191, 36, 0.12)',
          error: '#F87171',
          errorDim: 'rgba(248, 113, 113, 0.12)',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          '"Cascadia Code"',
          '"Roboto Mono"',
          'Consolas',
          'monospace'
        ]
      },
      boxShadow: {
        none: 'none',
      }
    },
  },
  plugins: [],
}
