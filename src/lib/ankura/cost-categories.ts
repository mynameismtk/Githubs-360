/** Client-safe labels for AnkuraCostCategory — see src/lib/ankura/common-drugs.ts for why
 *  this lives outside the `server-only` service file. */
export const COST_CATEGORY_LABELS = {
  CONSULTATION: 'Consultation',
  MEDICATION: 'Medication',
  MONITORING: 'Monitoring & scans',
  RETRIEVAL: 'Egg retrieval',
  ICSI: 'ICSI',
  FREEZING: 'Embryo freezing',
  STORAGE: 'Storage',
  FET: 'Frozen embryo transfer',
  TRAVEL: 'Travel & stay',
  OTHER: 'Other',
} as const
