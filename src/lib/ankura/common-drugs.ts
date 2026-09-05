/**
 * Common Indian-market protocol drugs, for auto-fill (brief §3.1). The dose is always
 * the patient's own prescription — the app never suggests a dose, only the drug name
 * and its typical route. Client-safe (no `server-only`), so both the reminders service
 * and the add-reminder form can import it without duplicating the list.
 */
export const COMMON_DRUGS: Array<{ name: string; route: 'SUBCUTANEOUS' | 'INTRAMUSCULAR' | 'ORAL' | 'VAGINAL'; isTrigger?: boolean }> = [
  { name: 'Gonal-F', route: 'SUBCUTANEOUS' },
  { name: 'Hucog', route: 'SUBCUTANEOUS' },
  { name: 'Ovidrel', route: 'SUBCUTANEOUS', isTrigger: true },
  { name: 'Cetrotide', route: 'SUBCUTANEOUS' },
  { name: 'Susten', route: 'VAGINAL' },
  { name: 'Duphaston', route: 'ORAL' },
  { name: 'Folliculin', route: 'INTRAMUSCULAR' },
  { name: 'Lupride', route: 'SUBCUTANEOUS' },
]
