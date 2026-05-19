// BlockComponent
// Vertrag, den jede Block-Klasse erfuellen muss.
// Definiert, welche Eigenschaften und Methoden der Editor von jedem Block erwarten darf.
// Vorlage: Notiz Woche 2 (Interface GridComponent).

import type { PropertyDescription } from './PropertyDescription'

export interface BlockComponent {
  get id(): string
  get type(): string
  get width(): number
  set width(v: number)
  get height(): number
  set height(v: number)
  get customProperties(): PropertyDescription[]
}
