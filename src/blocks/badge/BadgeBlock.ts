// BadgeBlock
// Atom (4K.2): kleiner Status-Chip mit fester Status-Bedeutung.
// Wie die Infobox waehlt der Bediener die BEDEUTUNG (Hinweis/Erfolg/Warnung/
// Fehler), NIE die Farbe — die Farbe ergibt sich fest aus der Bedeutung
// (Statusfarben-Tokens, Regel "Technikwert != Anzeigename"). Der Chip-Text
// wird per Doppelklick direkt auf dem Block bearbeitet (Inline-Edit, WYSIWYG,
// wie Button/Text/Infobox); die Art ist das einzige Inspector-Feld.
//
// Der Chip ist so breit wie sein Text (resizableWidth=false, wie der Button).
// Aussehen kommt AUSSCHLIESSLICH aus den Masken-Tokens (--se-*), keine Literale,
// keine Fallbacks. Verbindliches Zielbild: dashboard/stilprobe.html (.zb-chip).

import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../../core/blocks/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'

// Technikwert (unsichtbar) — der Bediener waehlt den Klarnamen im Inspector.
type BadgeVariant = 'info' | 'success' | 'warning' | 'danger'

const VARIANTS: readonly BadgeVariant[] = ['info', 'success', 'warning', 'danger']

export class BadgeBlock extends BasicBlock {
  static readonly blockType = 'badge'
  static readonly tagName = 'ff-badge'
  static readonly displayName = 'Status-Chip'
  static readonly category: BlockCategory = 'anzeige'
  // Ein Chip ist so breit wie seine Beschriftung — kein Breite-Anfasser.
  static readonly resizableWidth = false
  static readonly defaultProps = {
    variant: 'info',
    text: 'Hinweis',
  }

  // Einziges Inspector-Feld: die Art (Bedeutung -> Farbe). Der Text laeuft ueber
  // Inline-Edit, nicht ueber den Inspector.
  static override readonly customProperties: PropertyDescription[] = [
    {
      attributeName: 'variant',
      name: 'Art',
      description: 'Bedeutung des Chips — bestimmt die Farbe.',
      isArray: false,
      maxLength: 0,
      kind: 'select',
      options: [
        { value: 'info', label: 'Hinweis' },
        { value: 'success', label: 'Erfolg' },
        { value: 'warning', label: 'Warnung' },
        { value: 'danger', label: 'Fehler' },
      ],
    },
  ]

  // Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*). Strukturelle Groessen
  // (padding, letter-spacing, font-weight) als Literale wie bei Button/Infobox;
  // Farben + Radius + font-size kommen aus Tokens.
  static styles = [
    BasicBlock.styles,
    css`
      .chip {
        display: inline-block;
        padding: 2px 8px;
        border-radius: var(--se-r-sm);
        font-family: var(--se-font);
        font-size: var(--se-fs-xs);
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }
      .chip.v-info { background: var(--se-blue-soft); color: var(--se-blue); }
      .chip.v-success { background: var(--se-green-soft); color: var(--se-green); }
      .chip.v-warning { background: var(--se-amber-soft); color: var(--se-amber); }
      .chip.v-danger { background: var(--se-red-soft); color: var(--se-red); }
    `,
  ]

  @property() variant: BadgeVariant = 'info'
  @property() text = 'Hinweis'

  render(): TemplateResult {
    const v = VARIANTS.includes(this.variant) ? this.variant : 'info'
    return html`<span
      class="chip v-${v}"
      data-ff-editable
      @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'text')}
    >${this.text}</span>`
  }
}

BasicBlock.defineAndRegister(BadgeBlock)
