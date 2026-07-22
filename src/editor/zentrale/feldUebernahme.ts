// feldUebernahme — „Feld übernehmen" am Schreib-Schritt (Fahrplan 3b).
// Reine Editor-Hilfe: aus einem gewählten Datenquellen-Feld werden die
// festen PUT-Parameter Position/Länge/Tabelle abgeleitet und in die
// Bindungen eingesetzt (entschärft die „Dreier-Regel-Falle"). Kein
// Laufzeit-/Export-Eingriff — diese Datei wird NICHT vom Runtime-Bündel
// importiert (nur StepForm nutzt sie). Position/Länge stecken im Feldcode
// (splitFieldCode), die Tabelle in der Quelle (tableIdFor → relIdFromIdbId).
// Nur IDB-Quellen (Stamm-PUT ist im SE-Kontrakt nicht belegt, Regel 5).

import type { ActionParamBinding } from '../../core/data/aktionen'
import { defaultRelationParams } from '../../core/data/aktionen'
import { tableIdFor, type DataSource } from '../../core/data/dataSources'
import {
  relIdFromIdbId,
  splitFieldCode,
  type RelationTemplate,
} from '../../core/data/relations'

export interface UebernahmeFeld {
  sourceId: string
  sourceName: string
  code: string
  label: string
}

export interface UebernahmeQuelle {
  sourceId: string
  sourceName: string
}

export interface UebernahmeTreffer {
  art: 'pos' | 'len' | 'relid'
  wert: string
}

export interface FeldUebernahmeResult {
  params: ActionParamBinding[]
  gesetzt: UebernahmeTreffer[]
}

export type FeldUebernahmeParameterArt = 'pos' | 'len' | 'relid'
export type FeldUebernahmeZiel = 'feld' | 'idb'

// V2 erkennt je Syntaxzeile genau einen bekannten Zielnamen. Die optionale
// Klammer ist Teil der Ganz-String-Regel: "POSx" und "{POS}x" bleiben fremd.
export function feldUebernahmeArt(raw: string): FeldUebernahmeParameterArt | null {
  const match = /^(?:([A-Za-z_]+)|\{([A-Za-z_]+)\})$/.exec(raw)
  const name = (match?.[1] ?? match?.[2])?.toUpperCase()
  if (name === 'POS' || name === 'FELD_POS') return 'pos'
  if (name === 'LEN' || name === 'FELD_LEN') return 'len'
  if (name === 'IDBID' || name === 'RELID') return 'relid'
  return null
}

export function uebernahmeQuellen(
  dataSources: readonly DataSource[],
): UebernahmeFeld[] {
  const felder: UebernahmeFeld[] = []
  for (const source of dataSources) {
    if (source.kind !== 'idb') continue
    for (const field of source.fields) {
      if (!splitFieldCode(field.code)) continue
      felder.push({
        sourceId: source.id,
        sourceName: source.name,
        code: field.code,
        label: field.label,
      })
    }
  }
  return felder
}

export function uebernahmeIdbQuellen(
  dataSources: readonly DataSource[],
): UebernahmeQuelle[] {
  return dataSources
    .filter((source) => source.kind === 'idb')
    .map((source) => ({ sourceId: source.id, sourceName: source.name }))
}

export function feldUebernehmen(
  params: readonly ActionParamBinding[],
  relation: RelationTemplate,
  source: DataSource,
  code: string,
  ziel: FeldUebernahmeZiel,
): FeldUebernahmeResult {
  const defaults = defaultRelationParams(relation)
  const next = relation.params.map((_, index) => ({
    ...(params[index] ?? defaults[index]),
  }))
  const gesetzt: UebernahmeTreffer[] = []

  relation.params.forEach((param, index) => {
    const art = feldUebernahmeArt(param)
    if (ziel === 'idb' && art === 'relid') {
      const relId = relIdFromIdbId(tableIdFor(source))
      next[index] = { source: 'fixed', value: relId }
      gesetzt.push({ art, wert: relId })
      return
    }
    if (ziel !== 'feld') return
    const posLen = splitFieldCode(code)
    if (!posLen) return
    if (art === 'pos') {
      next[index] = { source: 'fixed', value: posLen.pos }
      gesetzt.push({ art, wert: posLen.pos })
    } else if (art === 'len') {
      next[index] = { source: 'fixed', value: posLen.len }
      gesetzt.push({ art, wert: posLen.len })
    }
  })

  return { params: next, gesetzt }
}
