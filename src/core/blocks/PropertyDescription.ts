// PropertyDescription
// Metadaten fuer genau ein editierbares Block-Property.
// kind bestimmt das Inspector-Control; field speichert einen Feldcode,
// relation die id einer Relation-Vorlage. requiresDataSource blendet ein
// Control ohne Quelle aus. visibleWhen beschreibt registry-getrieben, wann
// ein Control zum aktuellen Blockzustand passt. exclusiveAmongSiblings
// erzwingt hoechstens ein Ja-Kennzeichen unter gleichartigen Geschwistern.
// hiddenInInspector ist nur fuer Properties erlaubt, die in einem eigenen
// Dialog gepflegt werden.
// number ist eine kompakte Zahl (unit/min/max), segment eine Options-Liste
// als Segmentgruppe statt Dropdown. inspectorRow packt benachbarte
// Properties mit gleichem Zeilen-Titel in EINE Inspector-Zeile (ein Label,
// Controls nebeneinander) — Registry-Daten, kein Sondercode je Baustein.
export type PropertyKind =
  | 'text'
  | 'textarea'
  | 'select'
  | 'number'
  | 'segment'
  | 'field'
  | 'relation'

export interface PropertySelectOption {
  value: string
  label: string
}

export interface PropertyVisibilityCondition {
  attributeName: string
  equals: unknown
}

export interface PropertyDescription {
  attributeName: string
  name: string
  description: string
  maxLength?: number
  kind: PropertyKind
  options?: PropertySelectOption[]
  /** Nur kind 'number': angezeigte Einheit (z. B. 'px') und erlaubte Grenzen. */
  unit?: string
  min?: number
  max?: number
  /** Benachbarte Properties mit gleichem Titel teilen sich EINE Inspector-Zeile. */
  inspectorRow?: string
  visibleWhen?: PropertyVisibilityCondition
  requiresDataSource?: boolean
  exclusiveAmongSiblings?: boolean
  hiddenInInspector?: boolean
}
