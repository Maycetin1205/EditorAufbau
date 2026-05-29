// PropertyDescription
// Beschreibt eine editierbare Property eines Blocks fuer den Inspector.
// `kind` waehlt das Control im Inspector. Ohne `kind` fallback per typeof.
// `options` nur fuer kind 'select' relevant (key/value Paare).

export type PropertyKind =
  | 'text'
  | 'textarea'
  | 'select'

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
}
