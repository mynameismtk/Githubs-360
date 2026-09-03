import 'server-only'
import { db } from '@/server/db'

/** Jargon decoder (brief §3.3) — English + Hindi for MVP. */

export async function listGlossaryTerms(query?: string) {
  const q = query?.trim()
  if (!q) {
    return db.ankuraGlossaryTerm.findMany({ orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }] })
  }
  const needle = q.toLowerCase()
  const all = await db.ankuraGlossaryTerm.findMany({ orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }] })
  return all.filter(
    (t) =>
      t.termEn.toLowerCase().includes(needle) ||
      t.termHi?.toLowerCase().includes(needle) ||
      t.definitionEn.toLowerCase().includes(needle) ||
      t.aliases.some((a) => a.toLowerCase().includes(needle)),
  )
}
