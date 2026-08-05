// BlockComponent
// Vertrag (Interface) fuer jeden Block-Baustein.
// Statische Klassen-Felder (blockType, tagName, displayName, category,
// defaultProps, customProperties) sind ueber
// `BlockComponentStatic` typisiert. Sie werden von der Registry ohne
// Instanzierung gelesen — `customElements.define` darf erst registrieren,
// bevor irgendjemand `new` auf dem Konstruktor aufruft.

import type {
  ActionValueSpot,
  BindableSpot,
  BlockEventSpec,
  DefaultChildSpec,
  ListenBindung,
  SatzWahl,
} from './BlockDefinition'
import type { FlowDirection, FlowWidth } from './flowLayout'
import type { RasterSpec } from './rasterLayout'
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
  // true = einstellbare Höhe — Bedeutung siehe BlockDefinition.
  readonly resizableHeight?: boolean
  // Registry-Konzepte — Bedeutung siehe BlockDefinition.
  readonly allowedChildTypes?: readonly string[]
  // Registry-Konzepte aus S3/K0/P1.1 — Bedeutung siehe BlockDefinition.
  readonly allowedParentTypes?: readonly string[]
  readonly lockedWidth?: FlowWidth
  readonly defaultChildren?: readonly DefaultChildSpec[]
  readonly childDirection?: FlowDirection
  readonly showInPalette?: boolean
  readonly templateChild?: { type: string; label: string }
  readonly containerHint?: boolean
  readonly addChildButton?: { label: string; childType: string }
  // Datenquellen-Fähigkeit — Bedeutung siehe BlockDefinition.
  readonly acceptsDataSource?: boolean
  // Satz herausgreifen / einer Auswahl folgen — Bedeutung siehe BlockDefinition.
  readonly satzWahl?: SatzWahl
  readonly kannAuswahlFolgen?: boolean
  // Bindbare Stellen — Bedeutung siehe BlockDefinition.
  readonly bindableSpots?: readonly BindableSpot[]
  // Als Aktionsparameter auslesbare Stellen — Bedeutung siehe BlockDefinition.
  readonly actionValueSpots?: readonly ActionValueSpot[]
  // Bindbare Liste (Tabellen-Spalten) — Bedeutung siehe BlockDefinition.
  readonly listenBindung?: ListenBindung
  // Ereignisse des Blocks — Bedeutung siehe BlockDefinition.
  readonly blockEvents?: readonly BlockEventSpec[]
  // Seiten-Baustein (Popup, P-A) — Bedeutung siehe BlockDefinition.
  readonly pageBlock?: boolean
  // Raster-Start-/Mindestgröße (opt-in) — Bedeutung siehe BlockDefinition.
  readonly raster?: Partial<RasterSpec>
  new(): BlockComponent
}
