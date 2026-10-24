import type { Config } from 'tailwindcss'

/**
 * Design tokens.
 *
 * Colours resolve to CSS custom properties rather than literal hex values so that a
 * clinic's brand (Clinic.brandPrimary / brandAccent) can re-skin the entire product at
 * runtime from the database, and so dark mode is a token swap rather than a refactor.
 * See docs/06-design-system.md.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg-rgb) / <alpha-value>)',
        surface: 'rgb(var(--surface-rgb) / <alpha-value>)',
        'surface-sunken': 'rgb(var(--surface-sunken-rgb) / <alpha-value>)',
        'surface-raised': 'rgb(var(--surface-raised-rgb) / <alpha-value>)',
        border: 'rgb(var(--border-rgb) / <alpha-value>)',
        'border-strong': 'rgb(var(--border-strong-rgb) / <alpha-value>)',
        ink: 'rgb(var(--ink-rgb) / <alpha-value>)',
        'ink-muted': 'rgb(var(--ink-muted-rgb) / <alpha-value>)',
        'ink-subtle': 'rgb(var(--ink-subtle-rgb) / <alpha-value>)',
        'ink-inverse': 'rgb(var(--ink-inverse-rgb) / <alpha-value>)',
        brand: 'rgb(var(--brand-rgb) / <alpha-value>)',
        'brand-ink': 'rgb(var(--brand-ink-rgb) / <alpha-value>)',
        'brand-wash': 'rgb(var(--brand-wash-rgb) / <alpha-value>)',
        'brand-hover': 'rgb(var(--brand-hover-rgb) / <alpha-value>)',
        accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
        'accent-wash': 'rgb(var(--accent-wash-rgb) / <alpha-value>)',
        positive: 'rgb(var(--positive-rgb) / <alpha-value>)',
        'positive-wash': 'rgb(var(--positive-wash-rgb) / <alpha-value>)',
        caution: 'rgb(var(--caution-rgb) / <alpha-value>)',
        'caution-wash': 'rgb(var(--caution-wash-rgb) / <alpha-value>)',
        critical: 'rgb(var(--critical-rgb) / <alpha-value>)',
        'critical-wash': 'rgb(var(--critical-wash-rgb) / <alpha-value>)',
        emergency: 'rgb(var(--emergency-rgb) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['rgb(var(--font-sans-rgb) / <alpha-value>)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        overline: ['0.6875rem', { lineHeight: '0.875rem', letterSpacing: '0.08em', fontWeight: '600' }],
        caption: ['0.8125rem', { lineHeight: '1.125rem', fontWeight: '500' }],
        'body-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        body: ['1rem', { lineHeight: '1.5rem' }],
        subheading: ['1rem', { lineHeight: '1.375rem', fontWeight: '600' }],
        heading: ['1.1875rem', { lineHeight: '1.625rem', fontWeight: '600' }],
        title: ['1.5rem', { lineHeight: '1.875rem', fontWeight: '600', letterSpacing: '-0.01em' }],
        display: ['2rem', { lineHeight: '2.375rem', fontWeight: '600', letterSpacing: '-0.02em' }],
      },
      borderRadius: { sm: '0.5rem', md: '0.75rem', lg: '1rem', xl: '1.25rem', '2xl': '1.5rem' },
      boxShadow: {
        raised: '0 1px 2px rgba(22,33,31,.05), 0 1px 3px rgba(22,33,31,.04)',
        overlay: '0 8px 24px rgba(22,33,31,.10), 0 2px 6px rgba(22,33,31,.05)',
        focus: '0 0 0 2px var(--bg), 0 0 0 4px var(--brand)',
      },
      transitionTimingFunction: { smooth: 'cubic-bezier(.2,.7,.3,1)' },
      transitionDuration: { fast: '120ms', base: '180ms', slow: '260ms' },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        'sheet-in': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-in': 'fade-in 180ms cubic-bezier(.2,.7,.3,1)',
        'slide-up': 'slide-up 180ms cubic-bezier(.2,.7,.3,1)',
        'sheet-in': 'sheet-in 260ms cubic-bezier(.2,.7,.3,1)',
      },
      maxWidth: { patient: '30rem' },
    },
  },
  plugins: [],
}

export default config
