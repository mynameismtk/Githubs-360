import Link from 'next/link'
import { ArtSprout } from '@/components/ankura/ui/illustrations'
import { AnkuraLoginForm } from './login-form'

export default function AnkuraLoginPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-patient flex-col justify-center px-6 py-10">
      <Link href="/ankura" className="mb-8 flex items-center gap-2 self-start">
        <ArtSprout size={30} />
        <span className="font-a-serif text-lg text-a-ink">Ankura</span>
      </Link>
      <h1 className="mb-1.5 font-a-serif text-2xl text-a-ink">Welcome back</h1>
      <p className="mb-8 text-body text-a-ink-muted">
        Sign in with your mobile number — we'll text you a 6-digit code.
      </p>
      <AnkuraLoginForm />
    </div>
  )
}
