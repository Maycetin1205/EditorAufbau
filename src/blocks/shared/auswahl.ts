import { AUSWAHL_FOLGE_PROP, type AuswahlFolge } from '../../core/data/auswahlFolge'
import { getField } from '../../softengine/data'

export function merkmalVon(zeile: unknown): string {
  if (zeile == null) return ''
  try {
    return JSON.stringify(zeile) ?? ''
  } catch {
    return ''
  }
}

const zustand = new Map<string, { zeile: unknown; merkmal: string }>()
const hoerer = new Set<() => void>()

let meldungLaeuft = false
let nachmeldung = false

function melde(): void {
  if (meldungLaeuft) {
    nachmeldung = true
    return
  }
  meldungLaeuft = true
  try {
    do {
      nachmeldung = false
      hoerer.forEach((cb) => cb())
    } while (nachmeldung)
  } finally {
    meldungLaeuft = false
  }
}

export function aufAuswahlHoeren(cb: () => void): void {
  hoerer.add(cb)
}

export function auswahlFuer(geberId: string): unknown | undefined {
  return zustand.get(geberId)?.zeile
}

export function auswahlMerkmal(geberId: string): string {
  return zustand.get(geberId)?.merkmal ?? ''
}

export function geberIdVon(el: Element): string {
  return el.getAttribute('data-ff-id') ?? ''
}

export function auswahlWiederfinden<T>(
  geberId: string,
  kandidaten: readonly T[],
  zeileVon: (kandidat: T) => unknown,
): number[] {
  if (geberId === '') return []
  const merkmal = auswahlMerkmal(geberId)
  if (merkmal === '') return []
  const treffer: number[] = []
  kandidaten.forEach((kandidat, i) => {
    if (merkmalVon(zeileVon(kandidat)) === merkmal) treffer.push(i)
  })
  if (treffer.length === 0) klareAuswahl(geberId)
  return treffer
}

export function waehleAuswahl(geberId: string, zeile: unknown): void {
  if (geberId === '') return
  const merkmal = merkmalVon(zeile)
  if (merkmal === '') return
  const alt = zustand.get(geberId)
  if (alt && alt.merkmal === merkmal) zustand.delete(geberId)
  else zustand.set(geberId, { zeile, merkmal })
  melde()
}

export function setzeAuswahl(geberId: string, zeile: unknown): void {
  if (geberId === '') return
  const merkmal = merkmalVon(zeile)
  if (merkmal === '') return
  if (zustand.get(geberId)?.merkmal === merkmal) return
  zustand.set(geberId, { zeile, merkmal })
  melde()
}

export function klareAuswahl(geberId: string): void {
  if (!zustand.has(geberId)) return
  zustand.delete(geberId)
  melde()
}

export function setzeAuswahlZurueck(): void {
  zustand.clear()
}

const AUSWAHL_FOLGE_ATTR = AUSWAHL_FOLGE_PROP.toLowerCase()

export function folgenAusAttribut(el: HTMLElement): AuswahlFolge[] {
  const roh = el.getAttribute(AUSWAHL_FOLGE_ATTR) ?? ''
  if (roh === '') return []
  try {
    const parsed: unknown = JSON.parse(roh)
    if (!Array.isArray(parsed)) return []
    const acc: AuswahlFolge[] = []
    for (const e of parsed) {
      if (!e || typeof e !== 'object') continue
      const ee = e as Record<string, unknown>
      if (typeof ee.geberId !== 'string' || ee.geberId === '') continue
      const keyPairs: AuswahlFolge['keyPairs'] = []
      for (const p of Array.isArray(ee.keyPairs) ? ee.keyPairs : []) {
        if (!p || typeof p !== 'object') continue
        const pp = p as Record<string, unknown>
        if (typeof pp.fromField !== 'string' || typeof pp.toField !== 'string') continue
        if (pp.fromField.trim() === '' || pp.toField.trim() === '') continue
        keyPairs.push({ fromField: pp.fromField, toField: pp.toField })
      }
      if (keyPairs.length === 0) continue
      acc.push({ geberId: ee.geberId, keyPairs })
    }
    return acc
  } catch {
    return []
  }
}

export function zeilenNachAuswahl(
  el: HTMLElement,
  rows: unknown[],
): { rows: unknown[]; gefiltert: boolean } {
  let raus = rows
  let gefiltert = false
  for (const folge of folgenAusAttribut(el)) {
    const auswahl = auswahlFuer(folge.geberId)
    if (auswahl === undefined) continue
    gefiltert = true
    raus = raus.filter((row) =>
      folge.keyPairs.every((p) => {
        const soll = getField(auswahl, p.fromField)
        return soll !== '' && soll === getField(row, p.toField)
      }),
    )
  }
  return { rows: raus, gefiltert }
}

export function ersteZeileNachAuswahl(el: HTMLElement, rows: unknown[]): unknown {
  if (folgenAusAttribut(el).length === 0) return rows[0]
  const { rows: passende, gefiltert } = zeilenNachAuswahl(el, rows)
  return gefiltert ? passende[0] : undefined
}
