import { redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { surfaceForRole } from '@/server/auth/policy'

/**
 * Entry point. A signed-in user goes straight to their surface; everyone else starts at
 * onboarding. There is no marketing page to sit between a patient and their records.
 */
export default async function RootPage() {
  const actor = await getActor()
  if (actor) redirect(surfaceForRole(actor.role))
  redirect('/onboarding')
}
