/**
 * Money is always an integer number of paise. Never a float. docs/02 TD-8.
 * ₹1,850.00 → 185000
 */

export type Paise = number

/** Indian digit grouping (1,85,000 style) via Intl — not naive 3-digit grouping. */
export function formatMoney(paise: Paise, opts: { showPaise?: boolean } = {}): string {
  const rupees = paise / 100
  const showPaise = opts.showPaise ?? paise % 100 !== 0
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showPaise ? 2 : 0,
    maximumFractionDigits: showPaise ? 2 : 0,
  }).format(rupees)
}

/** For inputs and compact displays where the ₹ symbol is already present. */
export function formatAmount(paise: Paise): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(paise / 100)
}

export function rupeesToPaise(rupees: number): Paise {
  return Math.round(rupees * 100)
}
