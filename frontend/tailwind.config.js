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
        'display': ['Lexend', 'sans-serif'],
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
