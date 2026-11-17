export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          500: '#3B82F6',
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#0F172A'
        },
        accent: {
          emerald: '#10B981',
          emeraldDark: '#059669',
          amber: '#F59E0B',
          rose: '#F43F5E'
        },
        surface: {
          page: '#F8FAFC',
          card: '#FFFFFF',
          muted: '#F1F5F9',
          border: '#E2E8F0'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      borderRadius: {
        card: '1rem',
        pill: '9999px'
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
        float: '0 16px 40px -8px rgba(30, 64, 175, 0.16)'
      }
    }
  },
  plugins: []
};
