import { EmptyState } from '@/components/ui/states'
import { IconSearch } from '@/components/ui/icons'

export default function PatientNotFound() {
  return (
    <div className="py-10">
      <EmptyState
        icon={<IconSearch size={28} />}
        title="We couldn't find that"
        body="The page you were looking for may have moved, or you may not have access to it."
        action={{ label: 'Go to home', href: '/app' }}
      />
    </div>
  )
}
