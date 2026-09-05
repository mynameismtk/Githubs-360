import { withAnkuraApi } from '@/server/ankura/api'
import { listGlossaryTerms } from '@/server/ankura/services/glossary-service'

export const GET = withAnkuraApi({}, async ({ request }) => {
  const q = new URL(request.url).searchParams.get('q') ?? undefined
  return listGlossaryTerms(q)
})
