import type { Config } from 'tailwindcss'

/**
 * Clinic 360 design tokens.
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
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-sunken': 'var(--surface-sunken)',
        'surface-raised': 'var(--surface-raised)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        ink: 'var(--ink)',
        'ink-muted': 'var(--ink-muted)',
        'ink-subtle': 'var(--ink-subtle)',
        'ink-inverse': 'var(--ink-inverse)',
        brand: 'var(--brand)',
        'brand-ink': 'var(--brand-ink)',
        'brand-wash': 'var(--brand-wash)',
        'brand-hover': 'var(--brand-hover)',
        accent: 'var(--accent)',
        'accent-wash': 'var(--accent-wash)',
        positive: 'var(--positive)',
        'positive-wash': 'var(--positive-wash)',
        caution: 'var(--caution)',
        'caution-wash': 'var(--caution-wash)',
        critical: 'var(--critical)',
        'critical-wash': 'var(--critical-wash)',
        emergency: 'var(--emergency)',

        // Ankura — additive, only ever used within elements nested under `.ankura`.
        // See docs/06-design-system.md's Clinic 360 note; Ankura keeps its own token
        // set (src/app/globals.css) rather than reusing Clinic 360's brand tokens.
        'a-bg': 'var(--a-bg)',
        'a-surface': 'var(--a-surface)',
        'a-surface-sunken': 'var(--a-surface-sunken)',
        'a-border': 'var(--a-border)',
        'a-border-strong': 'var(--a-border-strong)',
        'a-ink': 'var(--a-ink)',
        'a-ink-muted': 'var(--a-ink-muted)',
        'a-ink-subtle': 'var(--a-ink-subtle)',
        'a-ink-inverse': 'var(--a-ink-inverse)',
        'a-brand': 'var(--a-brand)',
        'a-brand-hover': 'var(--a-brand-hover)',
        'a-brand-ink': 'var(--a-brand-ink)',
        'a-brand-wash': 'var(--a-brand-wash)',
        'a-accent': 'var(--a-accent)',
        'a-accent-hover': 'var(--a-accent-hover)',
        'a-accent-wash': 'var(--a-accent-wash)',
        'a-rose': 'var(--a-rose)',
        'a-rose-wash': 'var(--a-rose-wash)',
        'a-positive': 'var(--a-positive)',
        'a-positive-wash': 'var(--a-positive-wash)',
        'a-caution': 'var(--a-caution)',
        'a-caution-wash': 'var(--a-caution-wash)',
        'a-critical': 'var(--a-critical)',
        'a-critical-wash': 'var(--a-critical-wash)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'a-sans': ['var(--a-font-sans)'],
        'a-serif': ['var(--a-font-serif)'],
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
        'a-raised': '0 1px 3px rgba(47,42,34,.06), 0 2px 10px rgba(47,42,34,.05)',
        'a-overlay': '0 12px 32px rgba(47,42,34,.14), 0 3px 8px rgba(47,42,34,.06)',
        'a-focus': '0 0 0 2px var(--a-bg), 0 0 0 4px var(--a-brand)',
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
