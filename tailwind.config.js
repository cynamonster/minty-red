/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#08090d',
          card: '#10141f',
          border: '#1f293d',
          neonCyan: '#00f3ff',
          neonPink: '#ff0055',
          neonGreen: '#39ff14',
          neonAmber: '#ffb800',
          neonPurple: '#bd00ff',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        display: ['Orbitron', 'Rajdhani', 'sans-serif'],
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.9, filter: 'drop-shadow(0 0 8px rgba(0,243,255,0.6))' },
          '50%': { opacity: 0.5, filter: 'drop-shadow(0 0 2px rgba(0,243,255,0.2))' },
        },
        shake: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '20%': { transform: 'translate(-4px, 3px)' },
          '40%': { transform: 'translate(4px, -3px)' },
          '60%': { transform: 'translate(-3px, -2px)' },
          '80%': { transform: 'translate(3px, 2px)' },
        },
        slash: {
          '0%': { transform: 'scale(0.8) rotate(-25deg)', opacity: '0' },
          '50%': { transform: 'scale(1.1) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(1.3) rotate(25deg)', opacity: '0' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0) scale(0.9)', opacity: '1' },
          '100%': { transform: 'translateY(-35px) scale(1.1)', opacity: '0' },
        }
      },
      animation: {
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
        shake: 'shake 0.3s cubic-bezier(.36,.07,.19,.97) both',
        slash: 'slash 0.25s ease-out forwards',
        floatUp: 'floatUp 0.85s ease-out forwards',
      }
    },
  },
  plugins: [],
};
