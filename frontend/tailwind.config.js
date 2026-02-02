module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
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
      },
    },
  },
  plugins: [],
}
