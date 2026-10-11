import type { Stats } from './types'

const numbers = new Intl.NumberFormat('en')

export const formatNumber = (n: number) => numbers.format(n)

export const plural = (n: number, one: string, many = `${one}s`) => (n === 1 ? one : many)

/** "2024-03-12" -> a local Date (new Date("2024-03-12") would be UTC midnight). */
export function parseDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDate(iso: string, options: Intl.DateTimeFormatOptions = {}) {
  return parseDate(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

export function formatRange(stats: Stats) {
  if (!stats.firstDate || !stats.lastDate) return ''
  if (stats.firstDate === stats.lastDate) return formatDate(stats.firstDate)
  return `${formatDate(stats.firstDate)} – ${formatDate(stats.lastDate)}`
}

/** 0 -> "12 AM", 14 -> "2 PM" */
export function formatHour(hour: number) {
  const suffix = hour < 12 ? 'AM' : 'PM'
  return `${hour % 12 || 12} ${suffix}`
}

export function formatDuration(minutes: number) {
  if (minutes < 1) return 'under a minute'
  if (minutes < 59.5) {
    const m = Math.round(minutes)
    return `${m} ${plural(m, 'min')}`
  }
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m ? `${h} hr ${m} min` : `${h} hr`
}

/** Font size for a big name: shorter names get bigger text, in container-width units. */
export function nameSize(name: string, max = 20) {
  const length = Math.max([...name].length, 1)
  return `${Math.max(9, Math.min(max, 125 / length))}cqw`
}
