import { OnboardingCarousel } from './carousel'
import { getClinic } from '@/server/services/clinic-service'

export default async function OnboardingPage() {
  const clinic = await getClinic()
  return <OnboardingCarousel clinicName={clinic.name} />
}
