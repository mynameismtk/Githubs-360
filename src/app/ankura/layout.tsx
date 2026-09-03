import type { Metadata, Viewport } from 'next'
import { Fraunces, Nunito } from 'next/font/google'

/**
 * Ankura's own nested root. src/app/layout.tsx (Clinic 360's <html>/<body>) still wraps
 * this, so this file only ever adds a scoped wrapper div — see globals.css's `.ankura`
 * token block for why that scoping is what keeps this product visually independent.
 */

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-ankura-sans',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-ankura-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ankura — with you through every day of your cycle',
  description: 'A warm companion for IVF, IUI, FET and egg-freezing — reminders, your day-by-day journey, a jargon decoder and a cost tracker, built for India.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf1e2' },
    { media: '(prefers-color-scheme: dark)', color: '#161a15' },
  ],
}

export default function AnkuraLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`ankura ${nunito.variable} ${fraunces.variable}`}>
      <a href="#ankura-main" className="skip-link">
        Skip to content
      </a>
      {children}
    </div>
  )
}
