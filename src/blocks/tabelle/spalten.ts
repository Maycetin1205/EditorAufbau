import { ART_TEXT, type Zuordnung } from './spaltenArten'

export interface Spalte {
  titel: string
  feld: string
  art: string

  zuordnung?: Zuordnung[]

  felder?: Record<string, string>
}

// Der Strich, den eine Zelle ohne Wert zeigt: der Editor erfindet nie Daten
// (Regel 7). Eine Stelle, weil Datenzeile und Erfassungszeile denselben
// zeigen muessen.
export const ZELLE_PLATZHALTER = '—'

export const SPALTEN_MIN = 1
export const SPALTEN_MAX = 8

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
    return {
      titel: typeof o.titel === 'string' ? o.titel : standardTitelFuer(index),
      feld: typeof o.feld === 'string' ? o.feld : '',
      art: typeof o.art === 'string' ? o.art : ART_TEXT,

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
