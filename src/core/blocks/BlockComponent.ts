// BlockComponent
// Vertrag (Interface) fuer jeden Block-Baustein.
// Statische Klassen-Felder (blockType, tagName, displayName, category,
// defaultProps, customProperties) sind ueber
// `BlockComponentStatic` typisiert. Sie werden von der Registry ohne
// Instanzierung gelesen — `customElements.define` darf erst registrieren,
// bevor irgendjemand `new` auf dem Konstruktor aufruft.

import type { BindableSpot, DefaultChildSpec } from './BlockDefinition'
import type { FlowDirection } from './flowLayout'
import type { PropertyDescription } from './PropertyDescription'

export type BlockCategory = 'eingabe' | 'anzeige' | 'layout'

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
  // Registry-Konzepte aus Kap. 4K.4 — Bedeutung siehe BlockDefinition.
  readonly allowedChildTypes?: readonly string[]
  readonly defaultChildren?: readonly DefaultChildSpec[]
  readonly childDirection?: FlowDirection
  readonly showInPalette?: boolean
  readonly containerHint?: boolean
  readonly addChildButton?: { label: string; childType: string }
  // Datenquellen-Fähigkeit aus Kap. 5.1 — Bedeutung siehe BlockDefinition.
  readonly acceptsDataSource?: boolean
  // Bindbare Stellen aus Kap. 5.2 — Bedeutung siehe BlockDefinition.
  readonly bindableSpots?: readonly BindableSpot[]
  new(): BlockComponent
}
