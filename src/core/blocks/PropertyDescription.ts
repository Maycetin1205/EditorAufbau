// PropertyDescription
// Beschreibt eine editierbare Property eines Blocks fuer den Inspector.
// `kind` waehlt das Control im Inspector. Ohne `kind` fallback per typeof.
// `options` nur fuer kind 'select' relevant (key/value Paare).

export type PropertyKind =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'select'
  | 'color'
  | 'datasource'   // waehlt einen DataSourceEntry aus dem Catalog
  | 'field'        // waehlt ein Feld (SoftEngine-Feld) innerhalb der gewaehlten Datenquelle
  | 'fieldList'    // Liste { label, field } fuer ff-feldliste
  | 'columns'      // Liste { key, label, field, width } fuer ff-tabelle
  | 'sections'     // Liste { title, fields[{label, field}] } fuer ff-detailkarte

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
  // Optional: andere Property im selben Block, deren Wert die DataSource-Bindung
  // bestimmt (fuer kind 'field'). Beispiel: feld-block hat dataSourceId + fieldName,
  // fieldName.bindsTo = 'dataSourceId'.
  bindsTo?: string
}
