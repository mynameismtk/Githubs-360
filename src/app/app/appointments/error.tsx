'use client'

import { ErrorState } from '@/components/ui/states'

export default function AppointmentsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="py-8">
      <ErrorState
        title="We couldn't load your appointments."
        body="This is a problem on our side. Please try again."
        onRetry={reset}
      />
    </div>
  )
}
