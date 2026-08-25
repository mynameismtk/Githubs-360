import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { resolveActivePatientId } from '@/server/auth/policy'
import { getFamilyForActor, getPatientForActor } from '@/server/services/patient-service'
import { getClinic } from '@/server/services/clinic-service'
import { Card, SectionHeader } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { SignOutButton } from './sign-out'
import { IconChevronRight, IconPlus, IconAlert, IconShield, IconPhone } from '@/components/ui/icons'
import { formatDate, ageLabel } from '@/lib/dates'
import { LOCALE_LABELS } from '@/i18n'

export const dynamic = 'force-dynamic'

const RELATIONSHIP_LABEL: Record<string, string> = {
  SELF: 'You', SPOUSE: 'Spouse', CHILD: 'Child', PARENT: 'Parent',
  SIBLING: 'Sibling', GRANDPARENT: 'Grandparent', GUARDIAN: 'Guardian', OTHER: 'Family',
}

const BLOOD_LABEL: Record<string, string> = {
  A_POS: 'A+', A_NEG: 'A−', B_POS: 'B+', B_NEG: 'B−',
  AB_POS: 'AB+', AB_NEG: 'AB−', O_POS: 'O+', O_NEG: 'O−', UNKNOWN: 'Not recorded',
}

export default async function ProfilePage() {
  const actor = await getActor()
  if (!actor) redirect('/login')
  const patientId = await resolveActivePatientId(actor)
  if (!patientId) redirect('/login')

  const [patient, family, clinic] = await Promise.all([
    getPatientForActor(actor, patientId),
    getFamilyForActor(actor),
    getClinic(),
  ])

  return (
    <div className="space-y-8">
      <h1 className="text-title text-ink">Profile</h1>

      <Card>
        <div className="flex items-center gap-4">
          <Avatar name={patient.fullName} src={patient.avatarUrl} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-heading text-ink">{patient.fullName}</p>
            <p className="text-body-sm text-ink-muted">
              {ageLabel(patient.dateOfBirth)} · MRN {patient.mrn}
            </p>
          </div>
        </div>
        <dl className="mt-5 space-y-3 border-t border-border pt-4">
          <Row label="Date of birth" value={formatDate(patient.dateOfBirth)} />
          <Row label="Blood group" value={BLOOD_LABEL[patient.bloodGroup] ?? 'Not recorded'} />
          <Row label="Mobile" value={patient.phone ?? 'Not recorded'} />
          <Row
            label="Address"
            value={
              patient.addressLine1
                ? `${patient.addressLine1}, ${patient.city ?? ''} ${patient.pincode ?? ''}`.trim()
                : 'Not recorded'
            }
          />
          <Row
            label="Emergency contact"
            value={
              patient.emergencyContactName
                ? `${patient.emergencyContactName} (${patient.emergencyContactPhone ?? '—'})`
                : 'Not recorded'
            }
          />
        </dl>
        <p className="mt-4 text-caption text-ink-subtle">
          To correct any of these details, please speak to the clinic at reception.
        </p>
      </Card>

      {/* Allergies are safety-critical, so they get their own prominent block rather
          than a line in a list. */}
      <section>
        <SectionHeader title="Allergies" />
        {patient.allergies.length === 0 ? (
          <Card>
            <p className="text-body-sm text-ink-muted">
              No allergies recorded. If you have any, please tell the clinic so we can add them.
            </p>
          </Card>
        ) : (
          <ul className="space-y-2">
            {patient.allergies.map((a) => (
              <li key={a.id}>
                <Card className="border-[var(--critical)]/25 bg-[var(--critical-wash)]">
                  <div className="flex items-start gap-2.5">
                    <IconAlert size={18} className="mt-0.5 shrink-0 text-[var(--critical)]" />
                    <div>
                      <p className="text-body font-semibold text-ink">{a.substance}</p>
                      {a.reaction ? <p className="text-body-sm text-ink-muted">{a.reaction}</p> : null}
                      <p className="mt-1 text-caption font-semibold text-[var(--critical)]">
                        {a.severity === 'SEVERE' ? 'Severe' : a.severity === 'MILD' ? 'Mild' : 'Moderate'}
                      </p>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionHeader title="My family" />
        <ul className="space-y-2">
          {family.map((m) => (
            <li key={m.grantId}>
              <Card padded={false}>
                <div className="flex items-center gap-3 p-4">
                  <Avatar name={m.patient.fullName} src={m.patient.avatarUrl} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body font-semibold text-ink">{m.patient.fullName}</p>
                    <p className="text-caption text-ink-muted">
                      {RELATIONSHIP_LABEL[m.relationship] ?? 'Family'} · {ageLabel(m.patient.dateOfBirth)} ·{' '}
                      {m.patient.mrn}
                    </p>
                  </div>
                  {m.level === 'VIEW_ONLY' ? <Badge tone="neutral">View only</Badge> : null}
                </div>
              </Card>
            </li>
          ))}
        </ul>
        <Link
          href="/app/profile/family/add"
          className="mt-2.5 flex items-center justify-between rounded-lg border border-dashed border-border-strong p-4"
        >
          <span className="flex items-center gap-2 text-body font-semibold text-brand-ink">
            <IconPlus size={18} />
            Add a family member
          </span>
          <IconChevronRight size={18} className="text-ink-subtle" />
        </Link>
      </section>

      <section>
        <SectionHeader title="Insurance" />
        {patient.insurancePolicies.length === 0 ? (
          <Card>
            <p className="text-body-sm text-ink-muted">
              No insurance policy on file. Bring your policy card to reception and we&apos;ll add it.
            </p>
          </Card>
        ) : (
          <ul className="space-y-2">
            {patient.insurancePolicies.map((p) => (
              <li key={p.id}>
                <Card>
                  <p className="text-body font-semibold text-ink">{p.insurerName}</p>
                  <p className="text-body-sm text-ink-muted tabular">{p.policyNumber}</p>
                  {p.validTo ? (
                    <p className="mt-1 text-caption text-ink-subtle">Valid until {formatDate(p.validTo)}</p>
                  ) : null}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionHeader title="Preferences" />
        <Card padded={false}>
          <div className="flex items-center justify-between p-4">
            <span className="text-body text-ink">Language</span>
            <span className="text-body-sm font-semibold text-ink-muted">
              {LOCALE_LABELS[actor.locale as keyof typeof LOCALE_LABELS] ?? 'English'}
            </span>
          </div>
          <div className="border-t border-border p-4">
            <p className="flex items-start gap-2 text-caption text-ink-muted">
              <IconShield size={15} className="mt-0.5 shrink-0" />
              <span>
                Malayalam, Tamil, Hindi, Kannada and Telugu are coming soon. The app is already built to
                support them.
              </span>
            </p>
          </div>
        </Card>
      </section>

      <section>
        <SectionHeader title={clinic.name} />
        <Card padded={false}>
          <a href={`tel:${clinic.supportPhone}`} className="flex items-center gap-3 p-4">
            <IconPhone size={18} className="text-brand" />
            <span className="flex-1 text-body text-ink">Call the clinic</span>
            <span className="text-body-sm text-ink-muted tabular">{clinic.supportPhone}</span>
          </a>
          <a
            href={`tel:${clinic.emergencyPhone}`}
            className="flex items-center gap-3 border-t border-border p-4"
          >
            <IconAlert size={18} className="text-[var(--emergency)]" />
            <span className="flex-1 text-body text-ink">Emergency</span>
            <span className="text-body-sm font-semibold text-ink tabular">{clinic.emergencyPhone}</span>
          </a>
        </Card>
      </section>

      <SignOutButton />

      <p className="pb-4 text-center text-caption text-ink-subtle">
        Signed in as {actor.phone}
      </p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-body-sm text-ink-muted">{label}</dt>
      <dd className="text-right text-body-sm font-semibold text-ink">{value}</dd>
    </div>
  )
}
