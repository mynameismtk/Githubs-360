import { redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { db } from '@/server/db'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/states'
import { IconShield } from '@/components/ui/icons'
import { formatDateTime } from '@/lib/dates'
import type { Tone } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

const SEVERITY_TONE: Record<string, Tone> = {
  LOW: 'neutral', NORMAL: 'neutral', HIGH: 'caution', CRITICAL: 'critical',
}

/**
 * Audit log (§39). Administrator-only.
 *
 * Note what is NOT shown: the metadata blob is rendered as a compact key list, never as
 * free-form clinical text, because an audit viewer must not become a back door into the
 * record it is auditing. Risk register R-6.
 */
export default async function AuditPage() {
  const actor = await getActor()
  if (!actor) redirect('/login')
  if (actor.role !== 'ADMIN') redirect('/ops')

  const [entries, counts] = await Promise.all([
    db.auditLog.findMany({
      where: { clinicId: actor.clinicId },
      select: {
        id: true, action: true, actorName: true, actorRole: true, severity: true,
        targetType: true, reason: true, createdAt: true, ipAddress: true,
        patient: { select: { fullName: true, mrn: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    db.auditLog.groupBy({
      by: ['severity'],
      where: { clinicId: actor.clinicId },
      _count: true,
    }),
  ])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-title text-ink">Audit log</h1>
        <p className="mt-1 text-body-sm text-ink-muted">
          Every sensitive action, recorded append-only. The 100 most recent entries.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(['CRITICAL', 'HIGH', 'NORMAL', 'LOW'] as const).map((severity) => (
          <Card key={severity}>
            <p className="text-overline uppercase text-ink-muted">{severity.toLowerCase()}</p>
            <p className="mt-1 text-title text-ink tabular">
              {counts.find((c) => c.severity === severity)?._count ?? 0}
            </p>
          </Card>
        ))}
      </div>

      {entries.length === 0 ? (
        <EmptyState icon={<IconShield size={26} />} title="No entries yet" body="Audited actions will appear here." />
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="border-b border-border text-left">
                  <th scope="col" className="px-4 py-2.5 text-overline uppercase text-ink-muted">When</th>
                  <th scope="col" className="px-4 py-2.5 text-overline uppercase text-ink-muted">Who</th>
                  <th scope="col" className="px-4 py-2.5 text-overline uppercase text-ink-muted">Action</th>
                  <th scope="col" className="px-4 py-2.5 text-overline uppercase text-ink-muted">Patient</th>
                  <th scope="col" className="px-4 py-2.5 text-overline uppercase text-ink-muted">Severity</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-0">
                    <td className="whitespace-nowrap px-4 py-2.5 text-caption text-ink-muted tabular">
                      {formatDateTime(e.createdAt)}
                    </td>
                    <td className="px-4 py-2.5 text-body-sm text-ink">
                      {e.actorName ?? 'System'}
                      {e.actorRole ? (
                        <span className="block text-caption text-ink-muted">{e.actorRole.toLowerCase()}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-caption text-ink">{e.action}</span>
                      {e.reason ? (
                        <span className="block text-caption text-ink-muted">{e.reason}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2.5 text-body-sm text-ink-muted">
                      {e.patient ? (
                        <>
                          {e.patient.fullName}
                          <span className="block text-caption tabular">{e.patient.mrn}</span>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={SEVERITY_TONE[e.severity] ?? 'neutral'}>{e.severity.toLowerCase()}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card>
        <p className="flex items-start gap-2 text-caption text-ink-muted">
          <IconShield size={15} className="mt-0.5 shrink-0" />
          <span>
            Audit rows are append-only by design — no application code path updates or deletes them.
            Enforcing that at the database level (revoking UPDATE and DELETE from the application
            role) is a deployment step, documented in the security notes. Until it is applied,
            append-only is a convention rather than a guarantee.
          </span>
        </p>
      </Card>
    </div>
  )
}
