// Display formatters for dates and counts.

const DATE_FORMAT = new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric' })
const DATE_WITH_YEAR_FORMAT = new Intl.DateTimeFormat('en-CA', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const MONTH_YEAR_FORMAT = new Intl.DateTimeFormat('en-CA', { month: 'long', year: 'numeric' })

// A date-only string parses as UTC midnight, which lands on the previous day west of Greenwich.
// Anchoring it to local midnight keeps calendar dates showing the day that was written down.
function parseDate(iso: string): Date {
  return new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00` : iso)
}

export function formatDate(iso: string): string {
  return DATE_WITH_YEAR_FORMAT.format(parseDate(iso))
}

/** Renders a sprint window as "Oct 5 - Oct 23, 2026". */
export function formatDateRange(startIso: string, endIso: string): string {
  return `${DATE_FORMAT.format(parseDate(startIso))} - ${formatDate(endIso)}`
}

/** Renders a sprint season label as "October 2026". */
export function formatMonthYear(iso: string): string {
  return MONTH_YEAR_FORMAT.format(parseDate(iso))
}

export function formatCount(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}

const RELATIVE_FORMAT = new Intl.RelativeTimeFormat('en-CA', { numeric: 'auto' })
const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 60 * 60 * 1000],
  ['month', 30 * 24 * 60 * 60 * 1000],
  ['day', 24 * 60 * 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['minute', 60 * 1000],
]

/** Renders a timestamp as "2 hours ago". Falls back to "just now" under a minute. */
export function formatRelativeTime(iso: string): string {
  const elapsed = Date.now() - new Date(iso).getTime()

  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(elapsed) >= size) return RELATIVE_FORMAT.format(-Math.round(elapsed / size), unit)
  }
  return 'just now'
}
