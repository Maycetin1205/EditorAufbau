import { QUELLEN_TRENNER, zerlegeBindung } from '../blocks/BlockDefinition'
import type { EintragProblem } from './ladeProblem'
import { POS_LEN, pruefeLadeRelation, type LadeRelation } from './ladeRelation'
import {
  artFuer,
  DATA_SOURCE_KINDS,
  QUELLEN_ARTEN,
  type DataSourceKind,
} from './quellenArten'

export { artFuer, DATA_SOURCE_KINDS, QUELLEN_ARTEN, type DataSourceKind }
export {
  felderHinterSchnitt,
  LADE_RELATION_STANDARD,
  ladeRelationFor,
  relationNrFromInput,
  type LadeRelation,
} from './ladeRelation'
export {
  feldVorsatzFromInput,
  fieldCode,
  kennungAnzeige,
  kennungFromInput,
  kopfsatzFromInput,
  quellenKennung,
  spaltenNameFromInput,
} from './quellenEingabe'

export interface DataSourceField {
  code: string

  label: string
}

export interface DataSource {
  id: string

  name: string

  kind: DataSourceKind

  idbId?: string

  indexField?: string

  kopfsatzIndex?: string

  lieferung?: 'liste' | 'offenerSatz'

  ladeRelation?: LadeRelation

  feldVorsatz?: string

  fields: readonly DataSourceField[]
}

export function feldKlarname(
  bindung: string,
  eigeneQuelleId: string,
  sources: readonly DataSource[],
): string {
  const { quelleId, code } = zerlegeBindung(bindung)
  const gesucht = quelleId === '' ? eigeneQuelleId : quelleId
  if (gesucht === '' || code === '') return ''
  const quelle = sources.find((s) => s.id === gesucht)
  return quelle?.fields.find((f) => f.code === code)?.label ?? ''
}

export function istOffenerSatz(source: DataSource): boolean {
  return artFuer(source.kind).varMoeglich && source.lieferung === 'offenerSatz'
}

export function tableIdFor(source: DataSource): string {
  const feste = artFuer(source.kind).tabellenId
  return feste === '' ? (source.idbId ?? '') : feste
}

export function felderFor(
  source: DataSource,
  benutzt?: ReadonlySet<string>,
  holSchluessel: readonly string[] = [],
): string {
  const mitSchluesseln = (codes: string[]): string[] => {
    for (const code of holSchluessel) {
      if (!codes.includes(code)) codes.push(code)
    }
    return codes
  }
  if (artFuer(source.kind).felderEinzeln) {
    return mitSchluesseln(source.fields.map((f) => f.code)).join(',')
  }

  if (!benutzt || benutzt.size === 0) return '*'

  const index = (source.indexField ?? '').trim()
  const codes = index === '' ? [] : [index]

  for (const f of source.fields) {
    if (benutzt.has(f.code) && !codes.includes(f.code)) codes.push(f.code)
  }
  for (const code of benutzt) {
    if (!codes.includes(code)) codes.push(code)
  }

  mitSchluesseln(codes)

  return codes.every((code) => POS_LEN.test(code)) ? codes.join(',') : '*'
}

export function loopReihenfolge(sources: readonly DataSource[]): DataSource[] {
  const alleinstehend: DataSource[] = []
  const unterKopfsatz: DataSource[] = []
  for (const source of sources) {
    if (artFuer(source.kind).kopfsatzMoeglich) unterKopfsatz.push(source)
    else alleinstehend.push(source)
  }
  return [...alleinstehend, ...unterKopfsatz]
}

export function kopfsatzFor(source: DataSource): string {
  if (!artFuer(source.kind).kopfsatzMoeglich) return ''
  return (source.kopfsatzIndex ?? '').trim()
}

export function varAusKopfsaetzen(
  sources: readonly DataSource[],
): { ID: string; FELDER: string }[] {
  const proId = new Map<string, string[]>()
  for (const s of sources) {
    const kopfsatz = kopfsatzFor(s)
    if (kopfsatz === '') continue

    const teile = /^([A-Za-z][A-Za-z0-9]*)_(\d+_\d+)$/.exec(kopfsatz)
    if (!teile) continue
    const felder = proId.get(teile[1]) ?? []
    if (!felder.includes(teile[2])) felder.push(teile[2])
    proId.set(teile[1], felder)
  }
  return [...proId].map(([ID, felder]) => ({ ID, FELDER: felder.join(',') }))
}

export function sanitizeDataSources(raw: unknown): DataSource[] {
  return pruefeDatenquellen(raw).liste
}

export function pruefeDatenquellen(
  raw: unknown,
): { liste: DataSource[]; probleme: EintragProblem[] } {
  const probleme: EintragProblem[] = []
  if (!Array.isArray(raw)) return { liste: [], probleme }
  const acc: DataSource[] = []
  const seen = new Set<string>()
  let nr = 0
  for (const entry of raw) {
    nr++

    const stelle = entry && typeof entry === 'object'
      && typeof (entry as Record<string, unknown>).id === 'string'
      && (entry as Record<string, unknown>).id !== ''
      ? (entry as Record<string, unknown>).id as string
      : `Eintrag ${nr}`
    const weg = (grund: string): void => { probleme.push({ stelle, grund }) }
    if (!entry || typeof entry !== 'object') {
      weg('die Datenquelle ist unlesbar')
      continue
    }
    const e = entry as Record<string, unknown>
    if (typeof e.id !== 'string' || e.id === '') {
      weg('der Datenquelle fehlt ihre Kennung')
      continue
    }
    if (seen.has(e.id)) {
      weg('diese Kennung kommt zweimal vor')
      continue
    }

    if (e.id.includes(QUELLEN_TRENNER)) {
      weg(`die Kennung enthält „${QUELLEN_TRENNER}" und wäre damit mehrdeutig`)
      continue
    }
    if (typeof e.name !== 'string' || e.name.trim() === '') {
      weg('der Klarname fehlt')
      continue
    }
    if (typeof e.kind !== 'string' || !DATA_SOURCE_KINDS.includes(e.kind as DataSourceKind)) {
      weg('die Art der Datenquelle fehlt oder ist unbekannt')
      continue
    }
    const fields: DataSourceField[] = []
    let feldNr = 0
    for (const f of Array.isArray(e.fields) ? e.fields : []) {
      feldNr++
      const feldWeg = (grund: string): void => {
        probleme.push({ stelle: `${stelle} · Feld ${feldNr}`, grund })
      }
      if (!f || typeof f !== 'object') {
        feldWeg('das Feld ist unlesbar')
        continue
      }
      const ff = f as Record<string, unknown>
      if (typeof ff.code !== 'string' || ff.code === '') {
        feldWeg('dem Feld fehlt sein Feldcode')
        continue
      }

      if (ff.code.includes(QUELLEN_TRENNER)) {
        feldWeg(`der Feldcode enthält „${QUELLEN_TRENNER}" und wäre damit mehrdeutig`)
        continue
      }
      if (typeof ff.label !== 'string' || ff.label === '') {
        feldWeg('dem Feld fehlt sein Klarname')
        continue
      }

      fields.push({ code: ff.code, label: ff.label })
    }

    const ladeRelation = e.ladeRelation === undefined ? null : pruefeLadeRelation(e.ladeRelation)
    if (e.ladeRelation !== undefined && ladeRelation === null) {
      probleme.push({ stelle, grund: 'die Hol-Relation ist unvollständig und wurde verworfen' })
    }
    seen.add(e.id)
    acc.push({
      id: e.id,
      name: e.name,
      kind: e.kind as DataSourceKind,
      ...(typeof e.idbId === 'string' && e.idbId !== '' ? { idbId: e.idbId } : {}),
      ...(typeof e.indexField === 'string' && e.indexField !== '' ? { indexField: e.indexField } : {}),
      ...(typeof e.kopfsatzIndex === 'string' && e.kopfsatzIndex !== ''
        ? { kopfsatzIndex: e.kopfsatzIndex }
        : {}),
      ...(e.lieferung === 'offenerSatz' ? { lieferung: 'offenerSatz' as const } : {}),
      ...(typeof e.feldVorsatz === 'string' && e.feldVorsatz !== ''
        ? { feldVorsatz: e.feldVorsatz }
        : {}),
      ...(ladeRelation ? { ladeRelation } : {}),
      fields,
    })
  }
  return { liste: acc, probleme }
}
