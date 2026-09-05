import { redirect } from 'next/navigation'
import { getAnkuraActor } from '@/server/ankura/session'
import { db } from '@/server/db'
import { ArtSprout } from '@/components/ankura/ui/illustrations'
import { AnkuraOnboardingForm } from './onboarding-form'

export default async function AnkuraOnboardingPage() {
  const actor = await getAnkuraActor()
  if (!actor) redirect('/ankura/login')
  if (actor.onboardedAt) redirect('/ankura/home')

  const clinics = await db.ankuraClinic.findMany({ select: { slug: true, name: true, city: true }, orderBy: { name: 'asc' } })

  return (
    <div className="mx-auto flex min-h-dvh max-w-patient flex-col px-6 py-8">
      <div className="mb-6 flex items-center gap-2">
        <ArtSprout size={30} />
        <span className="font-a-serif text-lg text-a-ink">Ankura</span>
      </div>
      <h1 className="mb-1.5 font-a-serif text-2xl text-a-ink">Tell us where you are</h1>
      <p className="mb-7 text-body text-a-ink-muted">
        This just shapes what we show you first — nothing here is shared without your say-so, and you can change it any time.
      </p>
      <AnkuraOnboardingForm clinics={clinics} />
    </div>
  )
}
