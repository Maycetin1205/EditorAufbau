// BlockComponent
// Vertrag (Interface) fuer jeden Block-Baustein.
// Statische Klassen-Felder (blockType, tagName, displayName, category,
// defaultProps, customProperties) sind ueber
// `BlockComponentStatic` typisiert. Sie werden von der Registry ohne
// Instanzierung gelesen — `customElements.define` darf erst registrieren,
// bevor irgendjemand `new` auf dem Konstruktor aufruft.

import type { PropertyDescription } from './PropertyDescription'

export type BlockCategory = 'eingabe' | 'anzeige'

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
  new(): BlockComponent
}
