'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

/**
 * Check-in. Optimistic feedback is deliberately NOT used here: the receptionist is
 * standing in front of the patient, and a check-in that silently failed would send the
 * patient to a queue they are not actually in.
 */
export function CheckInButton({ appointmentId, patientName }: { appointmentId: string; patientName: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <Button
        size="sm"
        loading={pending}
        onClick={async () => {
          setPending(true)
          setError(null)
          try {
            const res = await fetch(`/api/appointments/${appointmentId}`, {
              method: 'PATCH',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ action: 'check-in' }),
            })
            const json = await res.json()
            if (!res.ok) {
              setError(json.error?.message ?? 'Check-in failed.')
              return
            }
            router.refresh()
          } catch {
            setError('Could not reach the server.')
          } finally {
            setPending(false)
          }
        }}
      >
        Check in
      </Button>
      {error ? (
        <span role="alert" className="text-caption text-[var(--critical)]">
          {error}
        </span>
      ) : null}
      <span className="sr-only">Check in {patientName}</span>
    </div>
  )
}
