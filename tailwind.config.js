/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg-primary)',
        surface: 'var(--bg-surface)',
        'surface-subtle': 'var(--bg-surface-subtle)',
        card: 'var(--bg-card)',
        content: 'var(--text-primary)',
        'content-muted': 'var(--text-secondary)',
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          light: 'var(--accent-light)',
          text: 'var(--accent-text)',
        },
        line: 'var(--border-color)',
        'line-subtle': 'var(--border-subtle)',
      },
      fontFamily: {
        absans: ['var(--font-absans)', 'var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-absans)', 'var(--font-manrope)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-absans)', 'var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '16px',
        md: '12px',
        sm: '8px',
      },
    },
  },
  plugins: [],
};
