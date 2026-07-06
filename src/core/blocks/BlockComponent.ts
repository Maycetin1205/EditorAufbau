// BlockComponent
// Vertrag (Interface) fuer jeden Block-Baustein.
// Statische Klassen-Felder (blockType, tagName, displayName, category,
// defaultProps, customProperties) sind ueber
// `BlockComponentStatic` typisiert. Sie werden von der Registry ohne
// Instanzierung gelesen — `customElements.define` darf erst registrieren,
// bevor irgendjemand `new` auf dem Konstruktor aufruft.

import type { PropertyDescription } from './PropertyDescription'
import type { FlowDirection } from './flowLayout'

export type BlockCategory = 'eingabe' | 'anzeige' | 'layout'

// Beispieldaten-Teilbaum eines Blocks: beschreibt Kinder, die beim Einfügen
// aus der Bibliothek automatisch mit angelegt werden (Bedienlogik: ein Block
// erscheint nie als leeres Gerippe). props überschreiben die defaultProps
// des jeweiligen Kind-Typs.
export interface DefaultChildSpec {
  type: string
  props?: Record<string, unknown>
  children?: readonly DefaultChildSpec[]
}

// Instanz-Vertrag: jede Block-View muss customProperties liefern.
export interface BlockComponent {
  get customProperties(): PropertyDescription[]
}

// Statischer Vertrag: jede Block-Klasse beschreibt sich technisch ueber
// statische Felder, damit Registry, Sidebar und Factory die Klasse finden,
// ohne sie zu instanzieren.
export interface BlockComponentStatic {
  readonly blockType: string
  readonly tagName: string
  readonly displayName: string
  readonly category: BlockCategory
  readonly defaultProps: Record<string, unknown>
  readonly customProperties: PropertyDescription[]
  // true = der Block ist ein Container und rendert Kind-Bloecke (Light-DOM/Slot).
  readonly acceptsChildren?: boolean
  // false = kein Breite-Zieh-Anfasser im Editor (z.B. Button: Breite folgt
  // der Beschriftung). Default true.
  readonly resizableWidth?: boolean
  // Erlaubte Kind-Typen (Kap. 4K.4): undefined = freier Container (alles
  // erlaubt, z.B. Bereich); Liste = NUR diese Typen (z.B. Kanban-Spalte nimmt
  // nur Karten). Regel-Quelle fuer Store/Drag/Palette ist canContain().
  readonly allowedChildTypes?: readonly string[]
  // Feste Fluss-Richtung der Kinder fuer Container mit festem Design
  // (Board = 'row'). undefined = Richtung kommt aus der direction-Prop.
  readonly childDirection?: FlowDirection
  // Beispieldaten-Kinder, die beim Einfuegen automatisch entstehen.
  readonly defaultChildren?: readonly DefaultChildSpec[]
  // true = nicht in der Bibliothek anbieten (Struktur-Block, entsteht nur
  // ueber den Plus-Knopf seines Eltern-Blocks, z.B. Kanban-Spalte).
  readonly paletteHidden?: boolean
  new(): BlockComponent
}
