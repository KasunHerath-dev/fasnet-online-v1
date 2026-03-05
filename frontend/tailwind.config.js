module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#fa5f15',
        secondary: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        // User Custom Palette (Overriding Slate)
        moccaccino: {
          50: '#fff5ed',
          100: '#ffe9d5',
          200: '#fed0aa',
          300: '#fdae74',
          400: '#fb813c',
          500: '#fa5f15',
          600: '#eb440b',
          700: '#c2310c',
          800: '#9a2812',
          900: '#691e0f',
          950: '#430f07',
        },
        black: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
          950: '#000000',
        },
        slate: {
          50: '#f6f7f9',
          100: '#ebeef3',
          200: '#d4dae3',
          300: '#adbacc',
          400: '#8195af',
          500: '#617796',
          600: '#526684',
          700: '#3f4d65',
          800: '#374355',
          900: '#313a49',
          950: '#212630',
        },
        // Monochrome Design System
        // Semantic Theme Colors
        background: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        'surface-glass': 'var(--bg-surface-glass)',
        highlight: 'var(--bg-highlight)',

        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        'text-inverted': 'var(--text-inverted)',

        'border-base': 'var(--border-color)',
        'border-glass': 'var(--border-glass)',

        primary: 'var(--primary)',
        'primary-glow': 'var(--primary-glow)',

        // Sidebar Specific
        'sidebar-bg': 'var(--sidebar-bg)',
        'sidebar-text': 'var(--sidebar-text)',
        'sidebar-muted': 'var(--sidebar-muted)',
        'sidebar-highlight': 'var(--sidebar-highlight)',
        'sidebar-border': 'var(--sidebar-border)',
        // Stitch Theme Colors
        'stitch-blue': '#1313ec',
        'stitch-pink': '#ec1378',
        'stitch-bg-light': '#f6f6f8',
        'stitch-bg-dark': '#101022',
        'stitch-card-dark': '#1a1a2e',
        'stitch-card-border': '#323267',
        'stitch-success': '#0bda68',
      },
      fontFamily: {
        'sans': ['Lato', 'sans-serif'],
        'display': ['Lato', 'sans-serif'],
      },
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        }
      },
      animation: {
        blob: "blob 7s infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
}
