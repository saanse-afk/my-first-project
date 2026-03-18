/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        punjab: {
          bg: '#0a0518',
          depth1: '#120d2e',
          depth2: '#1a1245',
          depth3: '#231860',
          orange: '#f97316',
          'orange-dark': '#ea580c',
          'orange-light': '#fb923c',
          purple: '#a855f7',
          'purple-dark': '#9333ea',
          'purple-light': '#c084fc',
          blue: '#3b82f6',
          green: '#22c55e',
          pink: '#ec4899',
        },
      },
      boxShadow: {
        'glow-orange': '0 0 5px rgba(249,115,22,0.5), 0 0 20px rgba(249,115,22,0.3), 0 0 40px rgba(249,115,22,0.1)',
        'glow-purple': '0 0 5px rgba(168,85,247,0.5), 0 0 20px rgba(168,85,247,0.3), 0 0 40px rgba(168,85,247,0.1)',
        'glow-blue': '0 0 5px rgba(59,130,246,0.5), 0 0 20px rgba(59,130,246,0.3), 0 0 40px rgba(59,130,246,0.1)',
        'glow-green': '0 0 5px rgba(34,197,94,0.5), 0 0 20px rgba(34,197,94,0.3), 0 0 40px rgba(34,197,94,0.1)',
        'glow-pink': '0 0 5px rgba(236,72,153,0.5), 0 0 20px rgba(236,72,153,0.3), 0 0 40px rgba(236,72,153,0.1)',
        'depth': '0 1px 0 rgba(255,255,255,0.05), 0 4px 6px rgba(0,0,0,0.3), 0 10px 15px rgba(0,0,0,0.2), 0 20px 25px rgba(0,0,0,0.15)',
        'depth-hover': '0 1px 0 rgba(255,255,255,0.08), 0 8px 16px rgba(0,0,0,0.4), 0 24px 40px rgba(0,0,0,0.25)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)', opacity: '0.6' },
          '50%': { transform: 'translateY(-12px)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        blink: 'blink 1s step-end infinite',
        'gradient-shift': 'gradientShift 6s ease infinite',
      },
    },
  },
  plugins: [],
};
