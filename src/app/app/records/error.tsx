'use client'

import { ErrorState } from '@/components/ui/states'

export default function RecordsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="py-8">
      <ErrorState
        title="We couldn't load your records."
        body="This is a problem on our side. Please try again."
        onRetry={reset}
      />
    </div>
  )
}
