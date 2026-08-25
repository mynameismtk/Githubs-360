'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { IconLogout } from '@/components/ui/icons'

export function SignOutButton() {
  const [pending, setPending] = useState(false)
  return (
    <Button
      variant="secondary"
      size="lg"
      fullWidth
      loading={pending}
      onClick={async () => {
        setPending(true)
        await fetch('/api/auth/logout', { method: 'POST' })
        // Full navigation so no stale server-rendered patient data survives sign-out.
        window.location.href = '/login'
      }}
    >
      <IconLogout size={18} />
      Sign out
    </Button>
  )
}
