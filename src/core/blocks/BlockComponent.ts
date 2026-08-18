import type {
  ActionValueSpot,
  BindableSpot,
  BlockEventSpec,
  DefaultChildSpec,
  ErfassungsFaehigkeit,
  ListenBindung,
  QuellenFaehigkeit,
  SatzWahl,
} from './BlockDefinition'
import type { FlowDirection, FlowWidth } from './flowLayout'
import type { RasterSpec } from './rasterLayout'
import type { PropertyDescription } from './PropertyDescription'

export type BlockCategory = 'eingabe' | 'anzeige' | 'layout'

export interface BlockComponent {
  get customProperties(): PropertyDescription[]
}

export interface BlockComponentStatic {
  readonly blockType: string
  readonly tagName: string
  readonly displayName: string
  readonly category: BlockCategory
  readonly defaultProps: Record<string, unknown>
  readonly customProperties: PropertyDescription[]

  readonly acceptsChildren?: boolean

  readonly resizableWidth?: boolean

  readonly resizableHeight?: boolean

  readonly allowedChildTypes?: readonly string[]

  readonly allowedParentTypes?: readonly string[]
  readonly lockedWidth?: FlowWidth
  readonly defaultChildren?: readonly DefaultChildSpec[]
  readonly childDirection?: FlowDirection
  readonly showInPalette?: boolean
  readonly templateChild?: { type: string; label: string }
  readonly containerHint?: boolean
  readonly addChildButton?: { label: string; childType: string }

  readonly acceptsDataSource?: QuellenFaehigkeit

  readonly satzWahl?: SatzWahl
  readonly kannAuswahlFolgen?: boolean

  readonly kannErfassen?: ErfassungsFaehigkeit

  readonly bindableSpots?: readonly BindableSpot[]

  readonly actionValueSpots?: readonly ActionValueSpot[]

  readonly listenBindung?: ListenBindung

  readonly blockEvents?: readonly BlockEventSpec[]

  readonly pageBlock?: boolean

  readonly flaechenSeite?: boolean

  readonly maskenRand?: boolean

  readonly raster?: Partial<RasterSpec>
  new(): BlockComponent
}
