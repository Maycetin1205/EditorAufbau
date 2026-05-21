// Catalog-Typen
// Konsolidiert: alle Datenquellen-Arten in einer Liste mit Typ-Discriminator.
// Export-Logik mappt spaeter auf die jeweilige SEvariablen-Sektion
// (Variable -> VAR, IDB/Beleg/Stamm -> SEFILELOOP, MEMTAB -> MEMTAB).

export interface SoftEngineFeld {
  name: string                // menschlicher Name (z.B. "Vorname")
  field: string               // "POS_LEN" (z.B. "3292_30") — SoftEngine-Identifikator
}

export type SourceType =
  | 'variable'                // VAR-Sektion: Felder aus aktivem Bereich
  | 'idb'                     // SEFILELOOP, IDB-Datei
  | 'beleg'                   // SEFILELOOP, Beleg
  | 'adressstamm'             // SEFILELOOP, Adressstamm
  | 'artikelstamm'            // SEFILELOOP, Artikelstamm
  | 'memtab'                  // MEMTAB-Sektion
  | 'frei'                    // SEFILELOOP, generisch

export interface DataSourceEntry {
  id: string                  // interner Identifikator
  type: SourceType
  alias: string               // Bezeichnung im Catalog (z.B. "Kunde")
  sourceId: string            // SoftEngine-ID je Typ
                              //   variable:    "EINGABE", "POS", ...
                              //   idb:         "IDBID0005"
                              //   beleg:       "BEL"
                              //   adressstamm: "ADR"
                              //   artikelstamm:"ART"
                              //   memtab:      "ID0001"
                              //   frei:        beliebig
  key: string                 // Key-Feld "POS_LEN" (relevant fuer IDB)
  freiselekt: string          // SoftEngine-Selektion (leer = kein Filter)
  freiselektAktiv: boolean    // Checkbox-Zustand: filter benutzen?
  fields: SoftEngineFeld[]
}

// ---------- Relations (Laufzeit, kein SEvariablen-Eintrag) ----------

export type RelationKind = 'GET' | 'PUT' | 'PUTADD'
export type RelationDirection = 'L' | 'R'
export type RelationIndexSource = 'variable' | 'selected'
export type RelationFieldSource = 'variable' | 'field'

export interface RelationSyntaxParam {
  key: string
  label: string
  value: string
  source: 'variable' | 'fixed'
}

export interface RelationDefinition {
  id: string
  name: string                // z.B. "GET_174"
  kind: RelationKind
  relNo: string               // Relations-Nummer (z.B. "174")
  idbAlias: string            // verknuepfte IDB
  idbId: string               // z.B. "IDBID0005"
  sourceNo: string            // Quell-Panel-Nr.
  targetNo: string            // Ziel-Panel-Nr.
  direction: RelationDirection
  indexSource: RelationIndexSource
  indexValue: string
  fieldSource?: RelationFieldSource     // nur PUT/PUTADD
  fieldValue?: string                    // nur PUT/PUTADD
  syntax?: string                        // generierte oder importierte Syntax
  syntaxBased: boolean                   // true wenn aus Syntax importiert
  syntaxParams: RelationSyntaxParam[]    // Platzhalter aus Syntax
  allowExtraParams: boolean              // "..." in Syntax
  description: string
}

// ---------- Gesamtmodell ----------

export interface CatalogState {
  entries: DataSourceEntry[]
  relations: RelationDefinition[]
}
