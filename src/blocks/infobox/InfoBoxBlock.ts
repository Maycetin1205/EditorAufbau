// InfoBoxBlock
// Anzeige-Baustein: farbige Hinweisbox mit fester Status-Bedeutung.
// Der Bediener waehlt die BEDEUTUNG (Hinweis/Erfolg/Warnung/Fehler), NIE die
// Farbe — die Farbe ergibt sich fest aus der Bedeutung (Statusfarben-Tokens,
// Regel "Technikwert != Anzeigename"). Titel + Nachricht werden per
// Doppelklick direkt auf dem Block bearbeitet (Inline-Edit, WYSIWYG, wie
// Button/Text); die Art ist das einzige Inspector-Feld (erstes reales
// customProperties-Select im Projekt).
//
// Aussehen kommt AUSSCHLIESSLICH aus den Masken-Tokens (--se-*), keine Literale,
// keine Fallbacks. Bewusst anders als der alte Editor: kantig (getoente Flaeche
// + farbiger linker Balken), KEINE Gradienten/Schatten/Emoji.

import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../../core/blocks/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'

// Technikwert (unsichtbar) — der Bediener waehlt den Klarnamen im Inspector.
type InfoVariant = 'info' | 'success' | 'warning' | 'danger'

const VARIANTS: readonly InfoVariant[] = ['info', 'success', 'warning', 'danger']

export class InfoBoxBlock extends BasicBlock {
  static readonly blockType = 'infobox'
  static readonly tagName = 'ff-infobox'
  static readonly displayName = 'Infobox'
  static readonly category: BlockCategory = 'anzeige'
  static readonly defaultProps = {
    variant: 'info',
    heading: 'Hinweis',
    message: 'Das ist ein Hinweistext.',
  }

  // Einziges Inspector-Feld: die Art (Bedeutung -> Farbe). Titel/Nachricht
  // laufen ueber Inline-Edit, nicht ueber den Inspector.
  static override readonly customProperties: PropertyDescription[] = [
    {
      attributeName: 'variant',
      name: 'Art',
      description: 'Bedeutung der Box — bestimmt die Farbe.',
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

  // Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*). Rahmenbreiten in px
  // wie ButtonBlock (dafuer gibt es bewusst keine Tokens).
  static styles = [
    BasicBlock.styles,
    css`
      .box {
        box-sizing: border-box;
        border: 1px solid var(--se-line);
        border-left-width: 4px;
        border-radius: var(--se-r-md);
        padding: var(--se-gap);
        font-family: var(--se-font);
        font-size: var(--se-fs);
      }
      .box.v-info { border-left-color: var(--se-blue); background: var(--se-blue-soft); }
      .box.v-success { border-left-color: var(--se-accent); background: var(--se-accent-soft); }
      .box.v-warning { border-left-color: var(--se-amber); background: var(--se-amber-soft); }
      .box.v-danger { border-left-color: var(--se-red); background: var(--se-red-soft); }
      .heading {
        margin: 0 0 var(--se-gap-sm);
        color: var(--se-ink);
        font-weight: 600;
      }
      .message {
        margin: 0;
        color: var(--se-muted);
        line-height: 1.45;
      }
    `,
  ]

  @property() variant: InfoVariant = 'info'
  @property() heading = 'Hinweis'
  @property() message = 'Das ist ein Hinweistext.'

  render(): TemplateResult {
    const v = VARIANTS.includes(this.variant) ? this.variant : 'info'
    return html`<div class="box v-${v}">
      <p
        class="heading"
        data-ff-editable
        @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'heading')}
      >${this.heading}</p>
      <p
        class="message"
        data-ff-editable
        @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'message')}
      >${this.message}</p>
    </div>`
  }
}

BasicBlock.defineAndRegister(InfoBoxBlock)
