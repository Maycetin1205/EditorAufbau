// PropertyDescription
// Beschreibt eine editierbare Property eines Blocks fuer den Inspector.
// `kind` waehlt das Control im Inspector. Ohne `kind` fallback per typeof.
// `options` nur fuer kind 'select' relevant (key/value Paare).
// `field` (Kap. 5.3): Auswahl eines Felds der Datenquelle in Reichweite
// (Editor.dataSourceFor) — der Bediener sieht Klarnamen, gespeichert wird
// der Feldcode (Technikwert). Ohne Quelle in Reichweite unsichtbar.
// `relation` (Kap. 5.5): Auswahl einer Relation-Vorlage aus der Bibliothek
// (RelationStore) — der Bediener sieht Anzeigenamen, gespeichert wird die
// Vorlagen-id (Technikwert). Konsumenten (Kanban-Schreibweg) referenzieren
// die Vorlage darüber, statt ein Protokoll fest zu verdrahten.
// `requiresDataSource` (Kap. 5.3): Control nur zeigen, wenn eine Quelle in
// Reichweite ist (fuer 'field' immer implizit der Fall).
// `exclusiveAmongSiblings` (V2/B2): Ja/Nein-Kennzeichen, das hoechstens EIN
// Geschwister gleichen Typs tragen darf (z. B. Auffangspalte am Board).
// Konsumenten: der Store (updateProperty raeumt beim Setzen auf 'ja' die
// anderen Geschwister ab, 1 Undo) und die Export-Preflight (mehr als ein
// 'ja' im geladenen Altbestand blockiert den Export mit Klartext).

export type PropertyKind =
  | 'text'
  | 'textarea'
  | 'select'
  | 'field'
  | 'relation'

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
  exclusiveAmongSiblings?: boolean
}
