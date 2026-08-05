// TrennerBlock
// Statisches Layout-Atom "Trennlinie": eine waagerechte Linie ueber die volle
// Breite mit festem dezentem Aussenabstand. KEINE Eigenschaften (Regel 10 —
// erst wenn ein echter Fall mehr erzwingt: keine Farbe, keine Dicke, kein
// Stil). Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*).

import { css, html, type TemplateResult } from 'lit'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'

export class TrennerBlock extends BasicBlock {
  static readonly blockType = 'trenner'
  static readonly tagName = 'ff-trenner'
  static readonly displayName = 'Trennlinie'
  static readonly category: BlockCategory = 'layout'
  // Immer volle Breite, kein Anfasser: eine Trennlinie teilt die ganze Flaeche.
  static readonly defaultProps = { width: 'fill' }
  static readonly resizableWidth = false
  // Raster-Startgröße: volle Breite, eine Zeile hoch (eine Trennlinie).
  static readonly raster = { startW: 24, startH: 1, minW: 1, minH: 1 }
  static override readonly customProperties: PropertyDescription[] = []

  static override styles = [
    BasicBlock.styles,
    css`
      /* Fester dezenter Aussenabstand (--se-gap-sm) ober-/unterhalb der Linie;
         die Linie selbst ist ein 1px-Rand in der sichtbaren Linienfarbe. */
      :host { padding: var(--se-gap-sm) 0; }
      .linie { border-top: 1px solid var(--se-line); }
      /* Rasterflaeche: bleibt eine Zeile hoch; wird die Zelle hoeher gezogen,
         sitzt die Linie mittig statt oben. */
      :host([fuellt]) { display: flex; flex-direction: column; justify-content: center; }
      :host([fuellt]) .linie { width: 100%; }
    `,
  ]

  override render(): TemplateResult {
    return html`<div class="linie"></div>`
  }
}

BasicBlock.defineAndRegister(TrennerBlock)
