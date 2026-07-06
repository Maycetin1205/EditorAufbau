// BlockDefinition
// Technischer Registry-Eintrag fuer einen registrierten Block-Typ.
// Wird aus den statischen Klassenfeldern + customProperties-Getter einer
// Block-Klasse abgeleitet (siehe BasicBlock.defineAndRegister).

import type { BlockCategory, DefaultChildSpec } from './BlockComponent'
import type { FlowDirection } from './flowLayout'
import type { PropertyDescription } from './PropertyDescription'

export type { BlockCategory, DefaultChildSpec }

export interface BlockDefinition {
  type: string
  tagName: string
  displayName: string
  category: BlockCategory
  defaultProps: Record<string, unknown>
  customProperties: PropertyDescription[]
  acceptsChildren: boolean
  resizableWidth: boolean
  // null = freier Container (alles erlaubt); Liste = NUR diese Kind-Typen.
  allowedChildTypes: readonly string[] | null
  // null = Richtung aus der direction-Prop; sonst fest (Board = 'row').
  childDirection: FlowDirection | null
  // Beispieldaten-Kinder beim Einfuegen (leer = keine).
  defaultChildren: readonly DefaultChildSpec[]
  // true = nicht in der Bibliothek anbieten.
  paletteHidden: boolean
}
