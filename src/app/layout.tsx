import type { Metadata, Viewport } from 'next'
import { getClinic } from '@/server/services/clinic-service'
import { clinicThemeStyle } from '@/lib/theme'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const clinic = await getClinic()
  return {
    title: clinic.name,
    description: 'Your clinic, your records, your care — in one place.',
    icons: clinic.logoUrl ? { icon: clinic.logoUrl } : undefined,
    // Patient-facing health data must never be indexed or previewed by a crawler.
    robots: { index: false, follow: false },
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Deliberately NOT maximum-scale=1: pinch-zoom is an accessibility necessity for
  // older patients, and disabling it is a common and avoidable mistake.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9f7' },
    { media: '(prefers-color-scheme: dark)', color: '#101614' },
  ],
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const clinic = await getClinic()
  return (
    <html lang="en" style={clinicThemeStyle(clinic)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
