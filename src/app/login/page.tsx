import { redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { surfaceForRole } from '@/server/auth/policy'
import { getClinic } from '@/server/services/clinic-service'
import { LoginForm } from './login-form'

export default async function LoginPage() {
  const actor = await getActor()
  if (actor) redirect(surfaceForRole(actor.role))

  const clinic = await getClinic()
  return (
    <main className="mx-auto flex min-h-dvh max-w-patient flex-col justify-center px-6 py-10">
      <div className="mb-8">
        {clinic.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={clinic.logoUrl} alt={clinic.name} className="mb-5 h-12 w-12 rounded-xl bg-surface object-contain" />
        ) : (
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-ink-inverse">
            <span className="text-heading font-bold">{clinic.name.charAt(0)}</span>
          </div>
        )}
        <h1 className="text-title text-ink">Sign in</h1>
        <p className="mt-1.5 text-body text-ink-muted">
          Enter the mobile number you gave at {clinic.name}.
        </p>
      </div>

      <LoginForm />

      <p className="mt-8 text-center text-caption text-ink-subtle">
        New to {clinic.name}?{' '}
        <a href={`tel:${clinic.supportPhone}`} className="font-semibold text-brand-ink">
          Call the clinic to register
        </a>
      </p>
    </main>
  )
}
