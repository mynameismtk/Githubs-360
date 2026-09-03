'use client'

import { useState } from 'react'
import { AnkuraCard } from './ui/card'
import { AnkuraInput, AnkuraField } from './ui/input'
import { decodeEmbryoGrade } from '@/lib/ankura/grade-decoder'
import { ArtBlastocyst } from './ui/illustrations'

export function GradeDecoderTool() {
  const [raw, setRaw] = useState('')
  const result = raw.trim() ? decodeEmbryoGrade(raw) : null

  return (
    <AnkuraCard>
      <div className="mb-4 flex items-center gap-3">
        <ArtBlastocyst size={48} />
        <div>
          <h3 className="font-a-serif text-lg text-a-ink">What does your grade mean?</h3>
          <p className="text-body-sm text-a-ink-muted">Type a blastocyst grade like 4AA or 3BB.</p>
        </div>
      </div>

      <AnkuraField label="Your embryo grade" htmlFor="grade">
        <AnkuraInput
          id="grade"
          value={raw}
          onChange={(e) => setRaw(e.target.value.slice(0, 8))}
          placeholder="e.g. 4AA"
          className="uppercase tabular"
          maxLength={8}
        />
      </AnkuraField>

      {result?.valid ? (
        <div className="mt-4 space-y-2.5 rounded-xl bg-a-brand-wash/50 p-4">
          <p className="text-body-sm text-a-ink"><strong>Expansion {result.expansion}</strong> — {result.expansionText}</p>
          <p className="text-body-sm text-a-ink">{result.icmText}</p>
          <p className="text-body-sm text-a-ink">{result.teText}</p>
          <p className="border-t border-a-border pt-2.5 text-body-sm text-a-ink-muted">{result.reassurance}</p>
        </div>
      ) : result && !result.valid ? (
        <p className="mt-3 text-caption text-a-ink-muted">
          That doesn't look like a blastocyst grade yet — try a number 1–6 followed by two letters A–C, like 4AA.
        </p>
      ) : null}
    </AnkuraCard>
  )
}
