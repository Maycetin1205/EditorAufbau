// Feld-Vorschlaege pro Quellen-Typ
// Werden NUR beim Anlegen einer neuen Datenquelle als Default-Felder eingefuettert.
// Sind keine Wahrheit: jede SoftEngine-Installation kann eigene/erweiterte
// Adressstamm- oder Artikelstamm-Felder haben. User kann Liste editieren.

import type { SoftEngineFeld, SourceType } from './types'

const ADRESSSTAMM_VORSCHLAEGE: SoftEngineFeld[] = []

const ARTIKELSTAMM_VORSCHLAEGE: SoftEngineFeld[] = []

const VORSCHLAEGE: Record<SourceType, SoftEngineFeld[]> = {
  variable: [],
  idb: [],
  beleg: [],
  adressstamm: ADRESSSTAMM_VORSCHLAEGE,
  artikelstamm: ARTIKELSTAMM_VORSCHLAEGE,
  memtab: [],
  frei: [],
}

export function getFeldVorschlaege(type: SourceType): SoftEngineFeld[] {
  return VORSCHLAEGE[type].map((f) => ({ ...f }))
}

export function getDefaultSourceId(type: SourceType): string {
  // SoftEngine-uebliche Praefixe je Typ. User kann ueberschreiben.
  switch (type) {
    case 'variable': return 'EINGABE'
    case 'idb': return ''
    case 'beleg': return 'BEL'
    case 'adressstamm': return 'ADR'
    case 'artikelstamm': return 'ART'
    case 'memtab': return ''
    case 'frei': return ''
  }
}

export function getAliasPrefix(type: SourceType): string {
  switch (type) {
    case 'variable': return 'Var_'
    case 'idb': return 'IDB_'
    case 'beleg': return 'Beleg_'
    case 'adressstamm': return 'Adr_'
    case 'artikelstamm': return 'Art_'
    case 'memtab': return 'MEM_'
    case 'frei': return 'Quelle_'
  }
}

export function getTypeLabel(type: SourceType): string {
  switch (type) {
    case 'variable': return 'Variable'
    case 'idb': return 'IDB'
    case 'beleg': return 'Beleg'
    case 'adressstamm': return 'Adressstamm'
    case 'artikelstamm': return 'Artikelstamm'
    case 'memtab': return 'MEMTAB'
    case 'frei': return 'Frei'
  }
}

export function getTypeShortBadge(type: SourceType): string {
  switch (type) {
    case 'variable': return 'VAR'
    case 'idb': return 'IDB'
    case 'beleg': return 'Bel'
    case 'adressstamm': return 'Adr'
    case 'artikelstamm': return 'Art'
    case 'memtab': return 'MEM'
    case 'frei': return 'Frei'
  }
}

export function getSourceIdLabel(type: SourceType): string {
  switch (type) {
    case 'variable': return 'Variable-ID'
    case 'idb': return 'IDB-ID'
    case 'beleg': return 'Beleg-ID'
    case 'adressstamm': return 'Adressstamm-ID'
    case 'artikelstamm': return 'Artikelstamm-ID'
    case 'memtab': return 'MEMTAB-ID'
    case 'frei': return 'ID'
  }
}

// Typen die Freiselekt-Filter unterstuetzen.
// Variablen liefern Felder aus aktuellem Kontext, kein Filter.
export function supportsFreiselekt(type: SourceType): boolean {
  return type !== 'variable'
}

// Typen die ein Key-Feld haben (Primaerindex).
export function supportsKey(type: SourceType): boolean {
  return type === 'idb'
}

export const ALL_SOURCE_TYPES: SourceType[] = [
  'variable',
  'idb',
  'beleg',
  'adressstamm',
  'artikelstamm',
  'memtab',
  'frei',
]
