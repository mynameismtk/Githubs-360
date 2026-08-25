'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/ui/states'

/**
 * The patient-surface error boundary.
 *
 * The real error goes to the server log; the patient sees plain language and two ways
 * forward, one of which is a human being (§32). No stack trace, no status code, no
 * "TypeError: undefined is not a function".
 */
export default function PatientError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[patient-surface]', error.digest ?? error.message)
  }, [error])

  return (
    <div className="py-8">
      <ErrorState
        title="We couldn't load this right now"
        body="This is a problem on our side, not yours. Please try again in a moment."
        onRetry={reset}
      />
    </div>
  )
}
