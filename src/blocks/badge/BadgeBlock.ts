// BadgeBlock
// Atom (4K.2): kleiner Status-Chip mit fester Status-Bedeutung.
// Wie die Infobox waehlt der Bediener die BEDEUTUNG (Hinweis/Erfolg/Warnung/
// Fehler), NIE die Farbe — die Farbe ergibt sich fest aus der Bedeutung
// (Statusfarben-Tokens, Regel "Technikwert != Anzeigename"). Der Chip-Text
// wird per Doppelklick direkt auf dem Block bearbeitet (Inline-Edit, WYSIWYG,
// wie Button/Text/Infobox); die Art ist das einzige Inspector-Feld.
//
// Der Chip ist so breit wie sein Text (resizableWidth=false, wie der Button).
// Status-Vokabular + Chip-Aussehen kommen aus dem geteilten Modul
// shared/statusVariant (seit 4K.3 — die Karte nutzt denselben Chip).
// Verbindliches Zielbild: dashboard/stilprobe.html (.zb-chip).

import { html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../../core/blocks/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import {
  chipStyles,
  coerceStatusVariant,
  statusVariantProperty,
  type StatusVariant,
} from '../shared/statusVariant'

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
    statusVariantProperty('variant', 'Bedeutung des Chips — bestimmt die Farbe.'),
  ]

  static styles = [BasicBlock.styles, chipStyles]

  @property() variant: StatusVariant = 'info'
  @property() text = 'Hinweis'

  render(): TemplateResult {
    const v = coerceStatusVariant(this.variant)
    return html`<span
      class="chip v-${v}"
      data-ff-editable
      @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'text')}
    >${this.text}</span>`
  }
}

BasicBlock.defineAndRegister(BadgeBlock)
