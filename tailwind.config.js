/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        arena: {
          bg: '#0b1120',
          surface: '#0f172a',
          panel: '#111827',
          border: '#1e293b',
          attacker: '#ff2244',
          defender: '#00d4ff',
          warn: '#f59e0b',
          success: '#10b981',
          muted: '#475569',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Orbitron"', 'sans-serif'],
        body: ['"Share Tech Mono"', 'monospace'],
      },
      animation: {
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'radar-spin': 'radarSpin 3s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'scanline': 'scanline 8s linear infinite',
        'glow-red': 'glowRed 2s ease-in-out infinite',
        'glow-blue': 'glowBlue 2s ease-in-out infinite',
        'grid-move': 'gridMove 20s linear infinite',
        'terminal-blink': 'blink 1s step-end infinite',
        'counter-up': 'counterUp 0.3s ease-out',
        'slide-in': 'slideIn 0.4s ease-out',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        radarSpin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        flicker: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.85 },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glowRed: {
          '0%, 100%': { boxShadow: '0 0 5px #ff2244, 0 0 20px #ff224440' },
          '50%': { boxShadow: '0 0 10px #ff2244, 0 0 40px #ff224460, 0 0 80px #ff224420' },
        },
        glowBlue: {
          '0%, 100%': { boxShadow: '0 0 5px #00d4ff, 0 0 20px #00d4ff40' },
          '50%': { boxShadow: '0 0 10px #00d4ff, 0 0 40px #00d4ff60, 0 0 80px #00d4ff20' },
        },
        gridMove: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '60px 60px' },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
        counterUp: {
          from: { transform: 'translateY(10px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
        slideIn: {
          from: { transform: 'translateX(-20px)', opacity: 0 },
          to: { transform: 'translateX(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
