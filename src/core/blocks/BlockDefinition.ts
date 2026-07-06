// BlockDefinition
// Technischer Registry-Eintrag fuer einen registrierten Block-Typ.
// Wird aus den statischen Klassenfeldern + customProperties-Getter einer
// Block-Klasse abgeleitet (siehe BasicBlock.defineAndRegister).

import type { BlockCategory } from './BlockComponent'
import type { FlowDirection } from './flowLayout'
import type { PropertyDescription } from './PropertyDescription'

export type { BlockCategory }

// Beispieldaten-Bauplan (Kap. 4K.4): beschreibt, mit welchem Teilbaum ein
// Block eingefügt wird ("nie ein leeres Gerippe"). Reine Daten — die Factory
// materialisiert daraus BlockNodes. `children` überschreibt die
// defaultChildren des Kind-Typs; fehlt es, gelten dessen eigene.
export interface DefaultChildSpec {
  type: string
  props?: Record<string, unknown>
  children?: readonly DefaultChildSpec[]
}

export interface BlockDefinition {
  type: string
  tagName: string
  displayName: string
  category: BlockCategory
  defaultProps: Record<string, unknown>
  customProperties: PropertyDescription[]
  acceptsChildren: boolean
  resizableWidth: boolean
  // Erlaubte Kind-Typen (Kap. 4K.4): undefined = alle Typen erlaubt.
  // Kanban-Spalte nimmt z. B. NUR Karten. Durchgesetzt im Store (addBlock/
  // moveNode) und in der Drag-Vorschau — nie per `if type===` in der UI.
  allowedChildTypes?: readonly string[]
  // Teilbaum, mit dem der Block eingefügt wird (Beispieldaten).
  defaultChildren?: readonly DefaultChildSpec[]
  // Feste Fluss-Richtung der Kinder für spezialisierte Container (Kanban-
  // Board = row). Der generische Bereich steuert das weiter über seine
  // `direction`-Prop — siehe resolveChildDirection in flowLayout.
  childDirection?: FlowDirection
  // false = erscheint nicht in der Bibliothek (Kanban-Spalte entsteht nur
  // über das Board). undefined/true = sichtbar.
  showInPalette?: boolean
  // false = keine gestrichelte Editor-Hilfe um den Container (Blöcke mit
  // eigenem sichtbarem Rahmen wie Kanban/Spalte). undefined/true = Hilfe an.
  containerHint?: boolean
  // Editor-Hilfe "Plus-Knopf" am Container: fügt einen Kind-Block dieses
  // Typs ans Ende ein (Kanban: "+ Spalte", Spalte: "+ Karte").
  addChildButton?: { label: string; childType: string }
}
