import { formatNowDate } from '../../core/data/relations'

const ANZEIGEN = ['date', 'time', 'datetime'] as const
type Anzeige = (typeof ANZEIGEN)[number]

function coerceAnzeige(value: unknown): Anzeige {
  return ANZEIGEN.includes(value as Anzeige) ? value as Anzeige : 'date'
}

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function currentDateDisplay(zeigt: unknown, now: Date): string {
  const display = coerceAnzeige(zeigt)
  if (display === 'time') return formatTime(now)
  const date = formatNowDate(now)
  return display === 'datetime' ? `${date} ${formatTime(now)}` : date
}
