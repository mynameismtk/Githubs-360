import { ComingNext } from '@/components/patterns/coming-next'

export default function ImagingPage() {
  return (
    <ComingNext
      title="Imaging &amp; scans"
      phase="Arriving in the next release"
      description="Your X-rays, ultrasounds and scan reports will appear here once the clinic's imaging system is connected. Until then, please collect scan films from the imaging desk."
      backHref="/app/records"
      backLabel="Records"
      alternative={{ label: 'View your records', href: '/app/records' }}
    />
  )
}
