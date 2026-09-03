import { listGlossaryTerms } from '@/server/ankura/services/glossary-service'
import { GlossarySearch } from './glossary-search'

export default async function AnkuraGlossaryPage() {
  const terms = await listGlossaryTerms()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-a-serif text-2xl text-a-ink">Jargon decoder</h1>
        <p className="text-body-sm text-a-ink-muted">No more midnight googling — every term, decoded gently, in English or Hindi.</p>
      </div>
      <GlossarySearch initialTerms={terms} />
    </div>
  )
}
