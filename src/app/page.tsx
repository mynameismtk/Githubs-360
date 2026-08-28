import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { surfaceForRole } from '@/server/auth/policy'
import { MarketingHome } from '@/components/marketing/marketing-home'

// The public marketing site is the one page in this app meant to be found and indexed —
// every other route is patient data and stays under the root `noindex` in layout.tsx.
export const metadata: Metadata = {
  title: 'Aura Medical Centre — Multi-speciality care in Coimbatore',
  description:
    'Aura Medical Centre is a multi-speciality clinic in Coimbatore offering cardiology, orthopaedics, obstetrics & gynaecology, paediatrics, dermatology, dental, diagnostics and more — book an appointment online.',
  robots: { index: true, follow: true },
}

/**
 * Entry point. A signed-in user goes straight to their surface; everyone else sees the
 * public marketing site, which links into onboarding/booking.
 */
export default async function RootPage() {
  const actor = await getActor()
  if (actor) redirect(surfaceForRole(actor.role))
  return <MarketingHome />
}
