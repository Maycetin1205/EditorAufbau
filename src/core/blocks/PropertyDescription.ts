// PropertyDescription
// Beschreibt eine editierbare Property eines Blocks fuer den Inspector.
// `kind` waehlt das Control im Inspector. Ohne `kind` fallback per typeof.
// `options` nur fuer kind 'select' relevant (key/value Paare).
// `field` (Kap. 5.3): Auswahl eines Felds der Datenquelle in Reichweite
// (Editor.dataSourceFor) — der Bediener sieht Klarnamen, gespeichert wird
// der Feldcode (Technikwert). Ohne Quelle in Reichweite unsichtbar.
// `requiresDataSource` (Kap. 5.3): Control nur zeigen, wenn eine Quelle in
// Reichweite ist (fuer 'field' immer implizit der Fall).

export type PropertyKind =
  | 'text'
  | 'textarea'
  | 'select'
  | 'field'

export interface PropertySelectOption {
  value: string
  label: string
}

export interface PropertyDescription {
  attributeName: string
  name: string
  description: string
  isArray: boolean
  maxLength: number
  kind?: PropertyKind
  options?: PropertySelectOption[]
  requiresDataSource?: boolean
}
