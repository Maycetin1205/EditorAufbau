import { Boxes, Database, FileText, Users } from '@/ui/zeichen'
import type { BlockNode } from '../../core/blocks/BlockData'
import { bausteinName } from '../../core/blocks/bausteinName'
import type { PropertySelectOption } from '../../core/blocks/PropertyDescription'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { auswahlQuelleIdVon } from '../../core/blocks/treeQuery'
import type { DataSource, DataSourceField, DataSourceKind } from '../../core/data/dataSources'
import type { RelationTemplate } from '../../core/data/relations'

const KIND_ICONS: Partial<Record<DataSourceKind, typeof Database>> = {
  idb: Database,
  adressstamm: Users,
  artikelstamm: Boxes,
  beleg: FileText,
}

export function ikonFuer(kind: DataSourceKind): typeof Database {
  return KIND_ICONS[kind] ?? Database
}

export const VERB_KURZ: Record<RelationTemplate['verb'], string> = {
  GET_RELATION: 'GET',
  PUT_RELATION: 'PUT',
  PUTADD_RELATION: 'PUTADD',
}

export function bestaetigeLoeschen(
  art: string,
  name: string,
  benutzt: boolean,
  folge: string,
): boolean {
  return window.confirm(
    benutzt
      ? `„${name}“ wird in der Maske BENUTZT. Trotzdem löschen? ${folge}`
      : `${art} „${name}“ löschen?`,
  )
}

export const RELATION_GRUPPEN: PropertySelectOption[] = [
  { value: 'lesen', label: 'Lesen' },
  { value: 'schreiben', label: 'Schreiben' },
]

export const PLATZHALTER_KLARTEXT: Record<string, string> = {
  FELD_POS: 'Feld-Position (aus dem gebundenen Feld)',
  FELD_LEN: 'Feld-Länge (aus dem gebundenen Feld)',
  PINDEX: 'Nummer des Datensatzes',
  SELKEY: 'Schlüssel der gewählten Zeile',
  DROP_PINDEX: 'Nummer des Ziel-Datensatzes beim Ablegen',
  RELID: 'Tabellen-ID der Datenquelle (ohne IDB-Präfix)',
  VALUE: 'Neuer Wert (z. B. Titel der Zielspalte)',
  ZIMMER: 'Titel des Ziel-Zimmers beim Ablegen (leer ohne Zimmer)',
  NOW_DATE: 'Heutiges Datum',
}

export function parameterBedeutung(param: string): string {
  if (param === '') return 'Leerer Parameter (Position bleibt erhalten)'
  const gefunden = [...param.matchAll(/\{([^}]+)\}/g)].map((m) => m[1])
  if (gefunden.length === 0) return 'Fester Wert'
  return gefunden
    .map((name) => PLATZHALTER_KLARTEXT[name] ?? `Eigener Platzhalter {${name}}`)
    .join(' · ')
}

export interface BlockValueOption {
  key: string
  blockId: string
  prop: string
  label: string
}

export function blockValueKey(blockId: string, prop: string): string {
  return `${encodeURIComponent(blockId)}:${encodeURIComponent(prop)}`
}

export interface AuswahlGeberOption {
  blockId: string
  label: string
  felder: readonly DataSourceField[]
}

// Eine Tabelle mit eingeschalteter Erfassungszeile, deren Zellen eine Kette
// als „Wert aus Erfassungszelle" lesen kann (G4). Die Spalten kommen generisch
// aus der Listen-Bindung des Bausteins — kein Bausteintyp-Sondercode.
export interface ErfassungsOption {
  blockId: string
  label: string
  spalten: readonly { index: number; titel: string }[]
}

export function erfassungsOptionen(
  traeger: readonly BlockNode[],
  sources: readonly DataSource[],
): ErfassungsOption[] {
  return traeger.map((node) => {
    const bindung = getBlockDefinition(node.type)?.listenBindung
    const roh = bindung ? node.props[bindung.prop] : undefined
    const spalten = bindung && Array.isArray(roh)
      ? roh.map((eintrag, index) => {
          const titel = (eintrag as Record<string, unknown>)[bindung.titelKey]
          return {
            index,
            titel: typeof titel === 'string' && titel !== '' ? titel : bindung.standardTitel,
          }
        })
      : []
    return { blockId: node.id, label: bausteinName(node, sources), spalten }
  })
}

export function auswahlGeberOptionen(
  geber: readonly BlockNode[],
  sources: readonly DataSource[],
): AuswahlGeberOption[] {
  return geber.map((node) => {
    const quelle = sources.find((s) => s.id === auswahlQuelleIdVon(node))
    return {
      blockId: node.id,
      label: quelle
        ? `${bausteinName(node, sources)} (${quelle.name})`
        : bausteinName(node, sources),
      felder: quelle?.fields ?? [],
    }
  })
}
