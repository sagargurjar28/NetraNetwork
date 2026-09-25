/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0b1015',
        surface: { 1: '#0a0e12', 2: '#10161c', 3: '#161d24', hover: 'rgba(255,255,255,0.03)' },
        text: { primary: '#e6edf3', secondary: '#8b98a5', muted: '#5a6672' },
        accent: {
          primary: '#dc2626',
          hover: '#ef4444',
          muted: '#991b1b',
          success: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#06b6d4',
        },
        border: 'rgba(255,255,255,0.06)',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], mono: ['JetBrains Mono', 'monospace'] },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
        // Radius scale (tokens): shell 16px, panel 10px, control 6px, chip 4px.
        // rounded-full stays for avatars/pills. See DESIGN_SYSTEM.md "Radius Scale".
        shell: '16px',
        panel: '10px',
        control: '6px',
        chip: '4px',
      },
      boxShadow: { card: '0 4px 24px rgba(0,0,0,0.45)', soft: '0 8px 32px rgba(0,0,0,0.5)' },
    },
  },
  plugins: [],
}
