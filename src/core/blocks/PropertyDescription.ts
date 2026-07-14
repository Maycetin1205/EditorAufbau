// PropertyDescription
// Metadaten fuer genau ein editierbares Block-Property.
// kind bestimmt das Inspector-Control; field speichert einen Feldcode,
// relation die id einer Relation-Vorlage. requiresDataSource blendet ein
// Control ohne Quelle aus. exclusiveAmongSiblings erzwingt hoechstens ein
// Ja-Kennzeichen unter gleichartigen Geschwistern. hiddenInInspector ist nur
// fuer Properties erlaubt, die in einem eigenen Dialog gepflegt werden.
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
  hiddenInInspector?: boolean
}
