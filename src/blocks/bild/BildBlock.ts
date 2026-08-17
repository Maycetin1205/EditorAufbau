import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'

export class BildBlock extends BasicBlock {
  static readonly blockType = 'bild'
  static readonly tagName = 'ff-bild'
  static readonly displayName = 'Bild'
  static readonly category: BlockCategory = 'anzeige'
  static readonly defaultProps = { quelle: '' }

  static readonly raster = { startW: 6, startH: 6, minW: 1, minH: 1 }

  static override readonly customProperties: PropertyDescription[] = [
    {
      attributeName: 'quelle',
      name: 'Bild',
      description: 'Die Bilddatei wird in die Maske eingebettet — die Maske bleibt EINE Datei. Grosse Bilder werden dabei still verkleinert.',
      kind: 'bild',
    },
  ]

  static override styles = [
    BasicBlock.styles,
    css`
      :host { display: block; }

      .flaeche {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .platzhalter { display: none; }
      :host([data-ff-editor]) .platzhalter {
        display: grid;
        place-items: center;
        width: 100%;
        height: 100%;
        min-height: 48px;
        box-sizing: border-box;
        padding: var(--se-gap-sm);
        border: var(--se-border) dashed var(--se-line);
        border-radius: var(--se-r-md);
        color: var(--se-faint);
        font-family: var(--se-font);
        font-size: var(--se-fs-sm);
        text-align: center;
      }
    `,
  ]

  @property() quelle = ''

  override render(): TemplateResult {
    return html`<div class="flaeche">
      ${this.quelle === ''
        ? html`<div class="platzhalter">Bild</div>`
        : html`<img src=${this.quelle} alt="">`}
    </div>`
  }
}

BasicBlock.defineAndRegister(BildBlock)
