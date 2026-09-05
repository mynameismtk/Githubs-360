import { redirect } from 'next/navigation'
import { getAnkuraActor } from '@/server/ankura/session'
import { AnkuraBottomNav } from '@/components/ankura/ui/bottom-nav'
import { AnkuraTopBar } from '@/components/ankura/ui/top-bar'

export default async function AnkuraAppLayout({ children }: { children: React.ReactNode }) {
  const actor = await getAnkuraActor()
  if (!actor) redirect('/ankura/login')
  if (!actor.onboardedAt) redirect('/ankura/onboarding')

  return (
    <div className="mx-auto flex min-h-dvh max-w-patient flex-col">
      <AnkuraTopBar fullName={actor.fullName} />
      <main id="ankura-main" className="flex-1 px-4 pb-28 pt-4">
        {children}
      </main>
      <AnkuraBottomNav />
    </div>
  )
}
