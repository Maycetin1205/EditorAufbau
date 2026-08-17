import { artFuer, type DataSourceKind } from './quellenArten'

export interface LadeRelation {
  nr: string

  geberQuelleId: string

  belegartFeld: string
  belegnummerFeld: string

  jahrFeld: string
  archivFeld: string

  endeFelder: readonly string[]
}

export const LADE_RELATION_STANDARD = {
  nr: '69',
  belegartFeld: '2_1',
  belegnummerFeld: '3_8',
  jahrFeld: '0_1',
  archivFeld: '1_1',
  endeFelder: ['11_6', '18_25'] as readonly string[],
}

export const POS_LEN = /^\d+_\d+$/
const NUR_ZIFFERN = /^\d+$/

export const LADE_SCHNITT_LEN = 255

export function felderHinterSchnitt(benutzt: ReadonlySet<string> | undefined): string[] {
  const raus: string[] = []
  for (const code of benutzt ?? []) {
    const m = /^(\d+)_(\d+)$/.exec(code)
    if (!m) continue
    if (Number(m[1]) + Number(m[2]) > LADE_SCHNITT_LEN) raus.push(code)
  }
  return raus.sort((a, b) => {
    const [posA = 0, lenA = 0] = a.split('_').map(Number)
    const [posB = 0, lenB = 0] = b.split('_').map(Number)
    return posA - posB || lenA - lenB
  })
}

export function relationNrFromInput(raw: string): string {
  const t = raw.trim()
  return NUR_ZIFFERN.test(t) ? t : ''
}

export function ladeRelationFor(
  source: { kind: DataSourceKind; ladeRelation?: LadeRelation },
): LadeRelation | null {
  if (!artFuer(source.kind).relationLadenMoeglich) return null
  return source.ladeRelation ?? null
}

export function pruefeLadeRelation(raw: unknown): LadeRelation | null {
  if (!raw || typeof raw !== 'object') return null
  const e = raw as Record<string, unknown>
  const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')
  const nr = text(e.nr)
  const geberQuelleId = text(e.geberQuelleId)
  const belegartFeld = text(e.belegartFeld)
  const belegnummerFeld = text(e.belegnummerFeld)
  const jahrFeld = text(e.jahrFeld)
  const archivFeld = text(e.archivFeld)
  const endeFelder = Array.isArray(e.endeFelder)
    ? e.endeFelder.filter((f): f is string => typeof f === 'string' && POS_LEN.test(f))
    : []
  if (!NUR_ZIFFERN.test(nr)) return null
  if (geberQuelleId === '') return null
  if (!POS_LEN.test(belegartFeld) || !POS_LEN.test(belegnummerFeld)) return null
  if (jahrFeld !== '' && !POS_LEN.test(jahrFeld)) return null
  if (archivFeld !== '' && !POS_LEN.test(archivFeld)) return null
  if (endeFelder.length === 0) return null
  return { nr, geberQuelleId, belegartFeld, belegnummerFeld, jahrFeld, archivFeld, endeFelder }
}
