// KanbanSpalteBlock
// Struktur-Block (4K.4): eine Kanban-Spalte = spezialisierter Container.
// Kopf mit Titel (Inline-Edit per Doppelklick) + automatischem Kartenzähler,
// Rumpf nimmt AUSSCHLIESSLICH Karten auf (erlaubte Kind-Typen über die
// Registry, Regel-Quelle canContain — kein `if type===` in der UI).
//
// Die Spalte steht NICHT in der Bibliothek (paletteHidden): sie entsteht nur
// über den Plus-Knopf des Boards. Die "Art" (Hinweis/Erfolg/Warnung/Fehler)
// färbt die Oberlinie — Bediener wählt die BEDEUTUNG, nie die Farbe
// (Technikwert != Anzeigename; geteiltes Status-Vokabular shared/statusVariant).
//
// Der Kartenzähler zählt die geslotteten Kinder, gefiltert über die Tag-Namen
// der erlaubten Kind-Typen aus der Registry: im Editor stecken die Karten in
// Wrapper-Elementen des Canvas, im Export liegen sie direkt im Slot — der
// Filter (Element IST eine Karte oder ENTHÄLT eine) zählt in beiden Welten
// identisch (EINE Render-Quelle, WYSIWYG).
//
// Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*), keine Literale, keine
// Fallbacks. Verbindliches Zielbild: dashboard/stilprobe.html (.zb-col).

import { css, html, type TemplateResult } from 'lit'
import { property, state } from 'lit/decorators.js'
import { BasicBlock } from '../../core/blocks/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import type { FlowDirection } from '../../core/blocks/flowLayout'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { CardBlock } from '../card/CardBlock'
import {
  coerceStatusVariant,
  statusVariantProperty,
  type StatusVariant,
} from '../shared/statusVariant'

export class KanbanSpalteBlock extends BasicBlock {
  static readonly blockType = 'kanban-spalte'
  static readonly tagName = 'ff-kanban-spalte'
  static readonly displayName = 'Spalte'
  static readonly category: BlockCategory = 'anzeige'
  static readonly acceptsChildren = true
  static readonly allowedChildTypes = [CardBlock.blockType]
  static readonly childDirection: FlowDirection = 'column'
  static readonly paletteHidden = true
  // width 290 = feste Spaltenbreite aus dem Zielbild (flex 0 0 290px) über
  // die universelle Flow-Breite — per Anfasser/Inspector änderbar.
  static readonly defaultProps = {
    heading: 'Neue Spalte',
    variant: 'info',
    width: 290,
  }

  static override readonly customProperties: PropertyDescription[] = [
    statusVariantProperty(
      'variant',
      'Bedeutung der Spalte — bestimmt die Farbe der Oberlinie.',
    ),
  ]

  // Strukturelle Groessen (padding, letter-spacing, font-weight, min-height)
  // als Literale wie bei Button/Karte; Farben + Radius + Schriftgroessen aus
  // Tokens.
  static styles = [
    BasicBlock.styles,
    css`
      .col {
        box-sizing: border-box;
        background: var(--se-panel);
        border: 1px solid var(--se-line);
        border-top: 3px solid var(--se-faint);
        border-radius: var(--se-r-lg);
        font-family: var(--se-font);
      }
      .col.v-info { border-top-color: var(--se-blue); }
      .col.v-success { border-top-color: var(--se-green); }
      .col.v-warning { border-top-color: var(--se-amber); }
      .col.v-danger { border-top-color: var(--se-red); }
      .head {
        display: flex;
        align-items: center;
        gap: var(--se-gap-sm);
        padding: 9px 11px;
        border-bottom: 1px solid var(--se-line-soft);
      }
      .heading {
        color: var(--se-ink);
        font-size: var(--se-fs-sm);
        font-weight: 700;
        letter-spacing: 0.09em;
        text-transform: uppercase;
      }
      .count {
        margin-left: auto;
        min-width: 22px;
        height: 20px;
        padding: 0 6px;
        border-radius: var(--se-r-sm);
        background: var(--se-panel-2);
        border: 1px solid var(--se-line-soft);
        display: grid;
        place-items: center;
        font-family: var(--se-mono);
        font-size: var(--se-fs-sm);
        font-weight: 600;
        color: var(--se-muted);
      }
      .body {
        padding: 11px;
        display: flex;
        flex-direction: column;
        gap: var(--se-gap);
        min-height: 150px;
      }
      slot { display: contents; }
    `,
  ]

  @property() heading = 'Neue Spalte'
  @property() variant: StatusVariant = 'info'

  // Kartenzähler — abgeleitet aus dem Slot-Inhalt, nie gespeichert.
  @state() private cardCount = 0

  private recount(e: Event): void {
    const slot = e.target as HTMLSlotElement
    const cardTags = (this.constructor as typeof KanbanSpalteBlock).allowedChildTypes
      .map((type) => getBlockDefinition(type)?.tagName)
      .filter((tag): tag is string => Boolean(tag))
    this.cardCount = slot.assignedElements().filter((el) =>
      cardTags.some((tag) => el.matches(tag) || el.querySelector(tag) !== null),
    ).length
  }

  render(): TemplateResult {
    const v = coerceStatusVariant(this.variant)
    return html`<div class="col v-${v}">
      <div class="head">
        <span
          class="heading"
          data-ff-editable
          @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'heading')}
        >${this.heading}</span>
        <span class="count">${this.cardCount}</span>
      </div>
      <div class="body"><slot @slotchange=${this.recount}></slot></div>
    </div>`
  }
}

BasicBlock.defineAndRegister(KanbanSpalteBlock)
