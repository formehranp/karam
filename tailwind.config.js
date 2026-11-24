/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        m3: {
          primary: 'rgb(var(--m3-primary) / <alpha-value>)',
          'on-primary': 'rgb(var(--m3-on-primary) / <alpha-value>)',
          'primary-container': 'rgb(var(--m3-primary-container) / <alpha-value>)',
          'on-primary-container': 'rgb(var(--m3-on-primary-container) / <alpha-value>)',
          
          secondary: 'rgb(var(--m3-secondary) / <alpha-value>)',
          'on-secondary': 'rgb(var(--m3-on-secondary) / <alpha-value>)',
          'secondary-container': 'rgb(var(--m3-secondary-container) / <alpha-value>)',
          'on-secondary-container': 'rgb(var(--m3-on-secondary-container) / <alpha-value>)',
          
          tertiary: 'rgb(var(--m3-tertiary) / <alpha-value>)',
          'on-tertiary': 'rgb(var(--m3-on-tertiary) / <alpha-value>)',
          'tertiary-container': 'rgb(var(--m3-tertiary-container) / <alpha-value>)',
          'on-tertiary-container': 'rgb(var(--m3-on-tertiary-container) / <alpha-value>)',

          surface: 'rgb(var(--m3-surface) / <alpha-value>)',
          'on-surface': 'rgb(var(--m3-on-surface) / <alpha-value>)',
          'surface-variant': 'rgb(var(--m3-surface-variant) / <alpha-value>)',
          'on-surface-variant': 'rgb(var(--m3-on-surface-variant) / <alpha-value>)',

          'surface-container-lowest': 'rgb(var(--m3-surface-container-lowest) / <alpha-value>)',
          'surface-container-low': 'rgb(var(--m3-surface-container-low) / <alpha-value>)',
          'surface-container': 'rgb(var(--m3-surface-container) / <alpha-value>)',
          'surface-container-high': 'rgb(var(--m3-surface-container-high) / <alpha-value>)',
          'surface-container-highest': 'rgb(var(--m3-surface-container-highest) / <alpha-value>)',

          outline: 'rgb(var(--m3-outline) / <alpha-value>)',
          'outline-variant': 'rgb(var(--m3-outline-variant) / <alpha-value>)',

          error: 'rgb(var(--m3-error) / <alpha-value>)',
          'on-error': 'rgb(var(--m3-on-error) / <alpha-value>)',
          'error-container': 'rgb(var(--m3-error-container) / <alpha-value>)',
          'on-error-container': 'rgb(var(--m3-on-error-container) / <alpha-value>)',
        }
      },
      fontFamily: {
        sans: [
          'Vazirmatn',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ]
      },
      boxShadow: {
        'm3-1': '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
        'm3-2': '0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
        'm3-3': '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.30)',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '28px',
        '4xl': '32px',
      }
    },
  },
  plugins: [],
};
