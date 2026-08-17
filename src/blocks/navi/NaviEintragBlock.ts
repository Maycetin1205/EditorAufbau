import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { SEITEN_WECHSEL_EVENT, type SeitenWechselDetail } from '../../core/blocks/seitenWechsel'

const TOENE: readonly { wert: string; name: string }[] = [
  { wert: 'sonne', name: 'Sonnengelb' },
  { wert: 'salbei', name: 'Salbeigrün' },
  { wert: 'himmel', name: 'Himmelblau' },
  { wert: 'flieder', name: 'Flieder' },
  { wert: 'koralle', name: 'Koralle' },
]

export class NaviEintragBlock extends BasicBlock {
  static readonly blockType = 'navi-eintrag'
  static readonly tagName = 'ff-navi-eintrag'
  static readonly displayName = 'Navi-Eintrag'
  static readonly category: BlockCategory = 'layout'
  static readonly acceptsChildren = false
  static readonly showInPalette = false
  static readonly allowedParentTypes = ['navi']
  static readonly resizableWidth = false
  static readonly defaultProps = {
    seite: '',
    seitename: '',
    ton: 'sonne',
  }

  static override readonly customProperties: PropertyDescription[] = [
    {
      attributeName: 'seite',
      name: 'Seite',
      description: 'Welche Seite dieser Maske der Eintrag zeigt.',
      kind: 'seite',
      klarnameProp: 'seitename',
      nurImEditor: true,
    },
    {
      attributeName: 'ton',
      name: 'Farbe',
      description: 'Farbe des Zeichens vor dem Namen.',
      kind: 'select',
      options: TOENE.map((t) => ({ value: t.wert, label: t.name })),
    },
  ]

  static override styles = [
    BasicBlock.styles,
    css`
      :host {
        --ton: var(--se-amber);
        display: flex;
        align-items: center;
        gap: 13px;
        box-sizing: border-box;
        margin: 2px 6px;
        padding: 10px 11px;
        border-radius: var(--se-r-md);
        font-family: var(--se-font);
        font-size: var(--se-fs);
        font-weight: 600;
        color: var(--se-bg);
        white-space: nowrap;
        cursor: pointer;
      }
      :host(:hover) { background: var(--se-muted); }

      :host([aktiv]) { background: var(--se-accent); color: var(--se-panel); }

      .zeichen {
        width: 22px;
        height: 22px;
        flex: none;
        border-radius: 50%;
        background: var(--ton);
      }
      :host([aktiv]) .zeichen { background: var(--se-panel); }

      :host([ton='sonne'])   { --ton: var(--se-amber); }
      :host([ton='salbei'])  { --ton: var(--se-green); }
      :host([ton='himmel'])  { --ton: var(--se-blue); }
      :host([ton='flieder']) { --ton: var(--se-violet); }
      :host([ton='koralle']) { --ton: var(--se-accent); }

      .name { display: none; }
      :host([breit]) .name {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
  ]

  @property() seite = ''
  @property() seitename = ''
  @property({ reflect: true }) ton = 'sonne'

  constructor() {
    super()
    this.addEventListener('click', () => this.melde())
  }

  private melde(): void {
    const detail: SeitenWechselDetail = { ansicht: this.seitename }
    this.dispatchEvent(new CustomEvent<SeitenWechselDetail>(SEITEN_WECHSEL_EVENT, {
      detail,
      bubbles: true,
      composed: true,
    }))
  }

  override render(): TemplateResult {
    return html`<span class="zeichen"></span>
      <span class="name">${this.seitename === '' ? '—' : this.seitename}</span>`
  }
}

BasicBlock.defineAndRegister(NaviEintragBlock)
