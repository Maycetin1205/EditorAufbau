// BlockDefinition
// Technischer Registry-Eintrag fuer einen registrierten Block-Typ.
// Wird aus den statischen Klassenfeldern + customProperties-Getter einer
// Block-Klasse abgeleitet (siehe BasicBlock.defineAndRegister).

import type { BlockCategory } from './BlockComponent'
import type { PropertyDescription } from './PropertyDescription'

export type { BlockCategory }

export interface BlockDefinition {
  type: string
  tagName: string
  displayName: string
  category: BlockCategory
  defaultProps: Record<string, unknown>
  customProperties: PropertyDescription[]
}
