/**
 * Blastocyst grade decoder (brief §3.2).
 *
 * Patients frequently spiral over grades that are actually perfectly normal — the
 * framing here is deliberate: explain what the letters/numbers mean, then immediately
 * say what they do and don't predict. This needs clinical review before the copy ships
 * (see docs/ankura content review note); it is written to be reviewed, not to replace
 * that review.
 */

export interface DecodedGrade {
  valid: boolean
  input: string
  expansion?: number
  icm?: 'A' | 'B' | 'C'
  trophectoderm?: 'A' | 'B' | 'C'
  expansionText?: string
  icmText?: string
  teText?: string
  reassurance: string
}

const EXPANSION_TEXT: Record<number, string> = {
  1: 'Early blastocyst — the fluid-filled cavity is just beginning to form.',
  2: 'The cavity is more than half the embryo\'s volume.',
  3: 'Full blastocyst — the cavity completely fills the embryo. A common, healthy stage to be at.',
  4: 'Expanded blastocyst — the cavity is larger than the early embryo, and the shell is thinning.',
  5: 'Hatching — the embryo is beginning to emerge from its outer shell, a sign of active development.',
  6: 'Fully hatched — the embryo has completely emerged from its shell.',
}

const GRADE_TEXT: Record<'A' | 'B' | 'C', string> = {
  A: 'Many cells, tightly and evenly packed — the top of a descriptive scale, not a pass/fail mark.',
  B: 'A good, functional number of cells — the single most common grade lab teams report, and it leads to healthy pregnancies every day.',
  C: 'Fewer or less tightly packed cells by this description. On its own this is one observation among several your embryologist weighs — not a verdict.',
}

const GRADE_RE = /^\s*([1-6])\s*([ABCabc])\s*([ABCabc])\s*$/

export function decodeEmbryoGrade(raw: string): DecodedGrade {
  const match = raw.match(GRADE_RE)
  const reassurance =
    'A grade is a snapshot for the embryology team to compare embryos to each other on transfer day — it is descriptive, not predictive. Plenty of healthy pregnancies begin from embryos graded B or C, and plenty of A-graded embryos don\'t implant. Your clinical team is looking at your whole picture, not this letter alone.'

  if (!match) {
    return { valid: false, input: raw, reassurance }
  }

  const expansion = Number(match[1])
  const icm = match[2]!.toUpperCase() as 'A' | 'B' | 'C'
  const trophectoderm = match[3]!.toUpperCase() as 'A' | 'B' | 'C'

  return {
    valid: true,
    input: raw,
    expansion,
    icm,
    trophectoderm,
    expansionText: EXPANSION_TEXT[expansion],
    icmText: `Inner cell mass (becomes the baby): ${GRADE_TEXT[icm]}`,
    teText: `Trophectoderm (becomes the placenta): ${GRADE_TEXT[trophectoderm]}`,
    reassurance,
  }
}
