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
  // Ausnahme statt Erlaubnis: nur Bausteine OHNE Datenbezug (Navi,
  // Trennlinie) setzen das. Alle anderen duerfen einer Auswahl folgen.
  readonly ohneDaten?: boolean

  readonly kannErfassen?: ErfassungsFaehigkeit

  readonly bindableSpots?: readonly BindableSpot[]

  readonly actionValueSpots?: readonly ActionValueSpot[]

  readonly listenBindung?: ListenBindung

  /* Zeigt dieser Baustein mit DIESEN Props Tierbilder? Der Export gibt die
     Bilddaten nur dann mit -- sonst traegt jede Maske 29,7 KB umsonst. */
  readonly brauchtTierbilder?: (props: Record<string, unknown>) => boolean

  readonly blockEvents?: readonly BlockEventSpec[]

  readonly pageBlock?: boolean

  readonly flaechenSeite?: boolean

  readonly maskenRand?: boolean

  readonly raster?: Partial<RasterSpec>
  new(): BlockComponent
}
