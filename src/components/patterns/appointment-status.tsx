import { Badge } from '@/components/ui/badge'
import { IconCheck, IconClock, IconClose, IconAlert, IconStethoscope } from '@/components/ui/icons'
import type { AppointmentStatus } from '@prisma/client'

/**
 * Appointment status as a word plus an icon plus a tone — never colour alone (§24).
 * Shared by the patient list, the detail screen and the staff day boards so the same
 * state always reads the same way.
 */
export function StatusBadge({ status }: { status: AppointmentStatus }) {
  switch (status) {
    case 'SCHEDULED':
    case 'CONFIRMED':
      return <Badge tone="brand" icon={<IconClock size={12} />}>Confirmed</Badge>
    case 'CHECKED_IN':
      return <Badge tone="positive" icon={<IconCheck size={12} />}>Checked in</Badge>
    case 'IN_CONSULTATION':
      return <Badge tone="positive" icon={<IconStethoscope size={12} />}>With the doctor</Badge>
    case 'COMPLETED':
      return <Badge tone="neutral" icon={<IconCheck size={12} />}>Completed</Badge>
    case 'CANCELLED':
      return <Badge tone="critical" icon={<IconClose size={12} />}>Cancelled</Badge>
    case 'NO_SHOW':
      return <Badge tone="caution" icon={<IconAlert size={12} />}>Missed</Badge>
  }
}
