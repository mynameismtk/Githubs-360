import { redirect } from 'next/navigation'
import { getAnkuraActor } from '@/server/ankura/session'
import { ArtSprout } from '@/components/ankura/ui/illustrations'
import { ClinicSignOut } from './sign-out'

export default async function AnkuraClinicLayout({ children }: { children: React.ReactNode }) {
  const actor = await getAnkuraActor()
  if (!actor) redirect('/ankura/login')
  if (actor.role !== 'CLINIC_STAFF') redirect('/ankura/home')

  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-5 py-6">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArtSprout size={30} />
          <div>
            <p className="font-a-serif text-lg leading-tight text-a-ink">Ankura for clinics</p>
            <p className="text-caption text-a-ink-subtle">Staff portal</p>
          </div>
        </div>
        <ClinicSignOut />
      </header>
      {children}
    </div>
  )
}
