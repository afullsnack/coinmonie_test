const UNITS = [
  { value: 1e9, suffix: 'B' },
  { value: 1e6, suffix: 'M' },
] as const

/**
 * Formats an amount with thousands separators, shortening millions to `M`
 * and billions to `B` (e.g. 18_450_000 → "18.45M").
 */
export function formatAmount(amount: number, { decimals = 0 }: { decimals?: number } = {}) {
  const unit = UNITS.find(({ value }) => Math.abs(amount) >= value)
  if (unit) {
    const short = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(
      amount / unit.value,
    )
    return `${short}${unit.suffix}`
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}
