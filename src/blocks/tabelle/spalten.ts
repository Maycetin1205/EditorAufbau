import { ART_TEXT, type Zuordnung } from './spaltenArten'

export interface Spalte {
  titel: string
  feld: string
  art: string

  // Die Quelle, in der die Erfassungszelle dieser Spalte SUCHT — die Kennung
  // einer Verknuepfung des Bausteins. Fehlt sie, wird frei getippt. Am
  // Spaltenkopf gewaehlt, nie abgeleitet (Nutzer 2026-08-19).
  suchtIn?: string

  // Welche Felder der Such-Quelle beim Tippen und im Nachschlage-Fenster
  // erscheinen. Leer = Automatik wie bisher (s. anzeigeSpalteIn).
  // Der Klarname reist MIT: die Laufzeit kennt nur Feldcodes
  // (RuntimeDataSource hat keine Feldliste), und im Fenster soll ein Name
  // stehen, kein `51_60` (Regel 3).
  suchFelder?: SuchFeld[]

  zuordnung?: Zuordnung[]

  felder?: Record<string, string>
}

export const SUCHT_IN_KEY = 'suchtIn'

export interface SuchFeld {
  feld: string
  titel: string
}

export const SUCH_FELDER_KEY = 'suchFelder'

function alsSuchFelder(v: unknown): SuchFeld[] {
  if (!Array.isArray(v)) return []
  return v
    .map((x) => {
      if (typeof x === 'string') return { feld: x.trim(), titel: x.trim() }
      if (!x || typeof x !== 'object') return { feld: '', titel: '' }
      const o = x as Record<string, unknown>
      const feld = typeof o.feld === 'string' ? o.feld.trim() : ''
      const titel = typeof o.titel === 'string' && o.titel.trim() !== '' ? o.titel.trim() : feld
      return { feld, titel }
    })
    .filter((f) => f.feld !== '')
}

// Der Strich, den eine Zelle ohne Wert zeigt: der Editor erfindet nie Daten
// (Regel 7). Eine Stelle, weil Datenzeile und Erfassungszeile denselben
// zeigen muessen.
export const ZELLE_PLATZHALTER = '—'

export const SPALTEN_MIN = 1
// Der Deckel ist kein Fachwert, sondern ein Schutz gegen eine kaputte
// gespeicherte Maske. Er lag bis 2026-08-20 bei 8 — genau der Spaltenzahl der
// Demo, an der der Nutzer damit sofort anstand.
export const SPALTEN_MAX = 16

export const STANDARD_TITEL = 'Spalte {n}'

export function standardTitelFuer(index: number): string {
  return STANDARD_TITEL.replace('{n}', String(index + 1))
}

export function neueSpalte(index: number): Spalte {
  return { titel: standardTitelFuer(index), feld: '', art: ART_TEXT }
}

export function standardSpalten(): Spalte[] {
  return [0, 1, 2].map((i) => neueSpalte(i))
}

function alsZuordnung(v: unknown): Zuordnung[] {
  if (!Array.isArray(v)) return []
  return v
    .filter((z): z is Record<string, unknown> => Boolean(z) && typeof z === 'object')
    .map((z) => ({
      wert: typeof z.wert === 'string' ? z.wert : '',
      name: typeof z.name === 'string' ? z.name : '',
      bedeutung: typeof z.bedeutung === 'string' ? z.bedeutung : '',
    }))
    .filter((z) => z.wert.trim() !== '')
}

function alsFelder(v: unknown): Record<string, string> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {}
  const raus: Record<string, string> = {}
  for (const [k, wert] of Object.entries(v as Record<string, unknown>)) {
    if (typeof wert === 'string' && wert !== '') raus[k] = wert
  }
  return raus
}

function alsSpalte(x: unknown, index: number): Spalte {
  if (x && typeof x === 'object') {
    const o = x as Record<string, unknown>
    const zuordnung = alsZuordnung(o.zuordnung)
    const felder = alsFelder(o.felder)
    const suchtIn = typeof o.suchtIn === 'string' ? o.suchtIn.trim() : ''
    const suchFelder = alsSuchFelder(o.suchFelder)
    return {
      titel: typeof o.titel === 'string' ? o.titel : standardTitelFuer(index),
      feld: typeof o.feld === 'string' ? o.feld : '',
      art: typeof o.art === 'string' ? o.art : ART_TEXT,

      // Leer wird nicht gespeichert: „frei" ist die Abwesenheit der Wahl,
      // sonst traegt jede Spalte im Export ein leeres Feld mit.
      ...(suchtIn !== '' ? { suchtIn } : {}),

      ...(suchFelder.length > 0 ? { suchFelder } : {}),

      ...(zuordnung.length > 0 ? { zuordnung } : {}),

      ...(Object.keys(felder).length > 0 ? { felder } : {}),
    }
  }

  if (typeof x === 'string') return { ...neueSpalte(index), titel: x }
  return neueSpalte(index)
}

export function coerceSpalten(v: unknown): Spalte[] {
  let arr: Spalte[]
  if (Array.isArray(v)) {
    arr = v.map((x, i) => alsSpalte(x, i))
  } else if ((typeof v === 'number' && Number.isFinite(v)) || (typeof v === 'string' && /^\d+$/.test(v))) {
    const n = Math.max(1, Math.floor(Number(v)))
    arr = [...Array(n).keys()].map((i) => neueSpalte(i))
  } else {
    arr = standardSpalten()
  }
  if (arr.length > SPALTEN_MAX) arr = arr.slice(0, SPALTEN_MAX)
  if (arr.length < SPALTEN_MIN) arr = [neueSpalte(0)]
  return arr
}

export function tryCoerceSpalten(v: string): Spalte[] {
  try {
    return coerceSpalten(JSON.parse(v))
  } catch {
    return standardSpalten()
  }
}
