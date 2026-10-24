'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Field, Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { EmptyState, Skeleton, ErrorState } from '@/components/ui/states'
import { IconSearch } from '@/components/ui/icons'

interface Result {
  id: string
  fullName: string
  mrn: string
  dateOfBirth: string
  phone: string | null
}

export function OpsPatientSearch({ mrnPrefix }: { mrnPrefix: string }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null)
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      setError(false)
      try {
        const res = await fetch(`/api/patients/search?q=${encodeURIComponent(query.trim())}`)
        if (!res.ok) throw new Error()
        setResults((await res.json()).data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="space-y-4">
      <Field label="Find a patient" htmlFor="q" hint="Search by name, patient ID or mobile number.">
        <Input
          id="q"
          value={query}
          autoFocus
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`e.g. Arun Menon, ${mrnPrefix}01001, 9400000001`}
        />
      </Field>

      {loading ? <Skeleton className="h-16 rounded-lg" /> : null}
      {error ? <ErrorState title="Search failed" body="Please try again." /> : null}
      {results && results.length === 0 && !loading ? (
        <EmptyState icon={<IconSearch size={26} />} title="No patients found" body="Check the spelling or try the patient ID." />
      ) : null}

      {results && results.length > 0 ? (
        <Card padded={false}>
          <ul className="divide-y divide-border">
            {results.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/ops/patients/${p.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface-sunken/50"
                >
                  <Avatar name={p.fullName} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-sm font-semibold text-ink">{p.fullName}</span>
                    <span className="block text-caption text-ink-muted tabular">
                      {p.mrn}{p.phone ? ` · ${p.phone}` : ''}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  )
}
