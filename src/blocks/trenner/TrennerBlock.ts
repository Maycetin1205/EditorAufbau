import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'

const RICHTUNGEN = ['waagerecht', 'senkrecht'] as const
type Richtung = (typeof RICHTUNGEN)[number]
const RICHTUNG_STANDARD: Richtung = 'waagerecht'

function coerceRichtung(v: unknown): Richtung {
  return RICHTUNGEN.includes(v as Richtung) ? (v as Richtung) : RICHTUNG_STANDARD
}

export class TrennerBlock extends BasicBlock {
  static readonly blockType = 'trenner'
  static readonly tagName = 'ff-trenner'
  static readonly displayName = 'Trennlinie'
  static readonly category: BlockCategory = 'layout'

  static readonly defaultProps = { width: 'fill', richtung: RICHTUNG_STANDARD }
  static readonly resizableWidth = false

  static readonly raster = {
    startW: 24,
    startH: 1,
    minW: 1,
    minH: 1,
    varianten: [{
      wenn: { attributeName: 'richtung', equals: 'senkrecht' },
      startW: 1,
      startH: 6,
      breiteZiehbar: false,
    }],
  }
  static override readonly customProperties: PropertyDescription[] = [
    {
      attributeName: 'richtung',
      name: 'Richtung',
      description: 'Waagerecht trennt oben von unten, senkrecht links von rechts.',
      kind: 'select',
      options: [
        { value: 'waagerecht', label: 'Waagerecht' },
        { value: 'senkrecht', label: 'Senkrecht' },
      ],
    },
  ]

  static override styles = [
    BasicBlock.styles,
    css`

      .flaeche {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
      .waagerecht { padding: var(--se-gap-sm) 0; }
      .senkrecht {
        padding: 0 var(--se-gap-sm);

        min-height: 24px;
      }
      .linie { background: var(--se-line); }
      .waagerecht .linie { width: 100%; height: 1px; }
      .senkrecht .linie { width: 1px; height: 100%; }
    `,
  ]

  @property() richtung: string = RICHTUNG_STANDARD

  override render(): TemplateResult {
    return html`<div class="flaeche ${coerceRichtung(this.richtung)}"><div class="linie"></div></div>`
  }
}

BasicBlock.defineAndRegister(TrennerBlock)
