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

// Anzeige-Zeilen nach dem Empfang-Vorbild (.vuhr der chef-maske): die
// Hauptzeile traegt den grossen Wert, bei "Datum + Zeit" steht die Zeit
// oben und das Datum als kleine Zeile darunter.
export interface DatumAnzeige {
  haupt: string
  neben?: string
}

export function datumAnzeige(zeigt: unknown, now: Date): DatumAnzeige {
  const display = coerceAnzeige(zeigt)
  if (display === 'time') return { haupt: formatTime(now) }
  if (display === 'date') return { haupt: formatNowDate(now) }
  return { haupt: formatTime(now), neben: formatNowDate(now) }
}
