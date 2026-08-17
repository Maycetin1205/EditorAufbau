import { css, html, type TemplateResult } from 'lit'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { ROOT_TYPE } from '../../core/blocks/BlockData'
import { RAND } from '../../core/blocks/maskenRand'
import { NaviEintragBlock } from './NaviEintragBlock'
import { naviAktualisiert, verbindeNavi, trenneNavi, zeigeBreite } from './seRuntime'

const EINTRAG = NaviEintragBlock.blockType

export class NaviBlock extends BasicBlock {
  static readonly blockType = 'navi'
  static readonly tagName = 'ff-navi'
  static readonly displayName = 'Navi'
  static readonly category: BlockCategory = 'layout'
  static readonly acceptsChildren = true
  static readonly allowedChildTypes = [EINTRAG]
  static readonly addChildButton = { label: 'Eintrag', childType: EINTRAG }
  static readonly containerHint = false
  static readonly defaultProps = {}
  static override readonly customProperties: PropertyDescription[] = []

  static readonly maskenRand = true

  static readonly allowedParentTypes = [ROOT_TYPE]

  static readonly raster = { startW: 5, startH: 24, minW: 3, minH: 3 }

  static override styles = [
    BasicBlock.styles,
    css`
      :host {
        height: 100%;
        width: ${RAND.breite}px;
        transition: width var(--se-move);
      }
      :host([offen]) { width: ${RAND.breiteOffen}px; }
      .leiste {
        box-sizing: border-box;
        height: 100%;
        width: 100%;
        background: var(--se-ink);
        color: var(--se-bg);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-family: var(--se-font);
      }
      :host([offen]) .leiste {
        background: color-mix(in oklab, var(--se-ink) 88%, transparent);
      }

      .kopf {
        flex: none;
        display: flex;
        align-items: center;
        padding: 8px;
      }
      .schalter {
        flex: none;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 4px;
        width: 40px;
        height: 32px;
        padding: 0 11px;
        border: none;
        border-radius: var(--se-r-md);
        background: none;
        color: inherit;
        cursor: pointer;
      }
      .schalter:hover { background: var(--se-muted); }
      .balken {
        height: 2px;
        background: currentColor;
      }
      .eintraege {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 6px 0;
        overflow-y: auto;
      }
      .eintraege slot { display: contents; }
    `,
  ]

  override connectedCallback(): void {
    super.connectedCallback()
    verbindeNavi(this)
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    trenneNavi(this)
  }

  private klappen(): void {
    this.toggleAttribute('offen')
    zeigeBreite(this)
  }

  override render(): TemplateResult {
    return html`<div class="leiste">
        <div class="kopf">
          <button
            class="schalter"
            type="button"
            aria-label="Navi auf- und zuklappen"
            @click=${() => this.klappen()}
          >
            <span class="balken"></span>
            <span class="balken"></span>
            <span class="balken"></span>
          </button>
        </div>
        <div class="eintraege">
          <slot @slotchange=${() => naviAktualisiert(this)}></slot>
        </div>
      </div>`
  }
}

BasicBlock.defineAndRegister(NaviBlock)
