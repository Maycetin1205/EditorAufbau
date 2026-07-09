// CardBlock
// Molekuel (4K.3): Karte = Titel + Textzeile + Status-Chip, das Kartenformat
// fuer die spaeteren Kanban-Spalten (4K.4). Karten sind NORMALE Bloecke im
// Baum — keine eigene Drag-Sonderlogik, die Canvas-Drag-Logik aus 2.3 zieht
// sie wie jeden anderen Block.
//
// Titel, Textzeile und Chip-Text werden per Doppelklick direkt auf dem Block
// bearbeitet (Inline-Edit, WYSIWYG); einziges Inspector-Feld ist die Chip-Art
// (Bedeutung -> Farbe, Regel "Technikwert != Anzeigename"). Status-Vokabular
// + Chip-Aussehen kommen aus dem geteilten Modul shared/statusVariant — der
// Chip der Karte und der freistehende Status-Chip (ff-badge) koennen nicht
// auseinanderlaufen. Bewusst KEIN eingebettetes <ff-badge>-Element: dessen
// Inline-Edit-Event wuerde an der Schattengrenze zur Karte umadressiert und
// die falsche Prop beschreiben.
//
// Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*), keine Literale, keine
// Fallbacks. Verbindliches Zielbild: dashboard/stilprobe.html (.zb-card).

import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../../core/blocks/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { BindableSpot } from '../../core/blocks/BlockDefinition'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import {
  chipStyles,
  coerceStatusVariant,
  statusVariantProperty,
  type StatusVariant,
} from '../shared/statusVariant'

export class CardBlock extends BasicBlock {
  static readonly blockType = 'card'
  static readonly tagName = 'ff-card'
  static readonly displayName = 'Karte'
  static readonly category: BlockCategory = 'anzeige'
  // S3-Musterkarte (Nutzer-Entscheidung 2026-07-09): Das Kanban ist immer
  // datengebunden — Karten werden nicht mehr von Hand in Spalten gepflegt,
  // gestaltet wird NUR die Musterkarte im Vorlagen-Kasten des Boards.
  // Die Karte lebt deshalb ausschließlich dort (Gegenrichtung zu
  // allowedChildTypes; Literal, weil ein Import einen Zyklus ergäbe) und
  // steht nicht mehr in der Bibliothek: sie entsteht mit dem Board bzw.
  // über "+ Karte" am Vorlagen-Kasten. Karten in Spalten ALTER
  // gespeicherter Masken rendern weiter (Rendern prüft keine Regeln) und
  // lassen sich in den Vorlagen-Kasten ziehen oder löschen — nur neu
  // einfügen/verschieben in Spalten geht nicht mehr.
  static readonly allowedParentTypes = ['kanban-vorlage']
  static readonly showInPalette = false
  static readonly defaultProps = {
    chipVariant: 'info',
    heading: 'Rückruf Fr. Wagner',
    text: 'Befund Minka besprechen',
    chipText: 'Heute',
    // Bindungen der Stellen (Kap. 5.2): Feldcode der Datenquelle in
    // Reichweite (Technikwert, unsichtbar) — '' = ungebunden, die Stelle
    // zeigt ihren statischen Text.
    headingField: '',
    textField: '',
    chipTextField: '',
  }

  // Bindbare Stellen (Kap. 5.2, Bedienlogik 3): Klick auf die Stelle bindet
  // sie an ein Feld der Datenquelle in Reichweite (Kanban). Klarnamen für
  // den Feld-Picker; die Bindung liegt in `<prop>Field` (siehe defaultProps).
  static readonly bindableSpots: BindableSpot[] = [
    { prop: 'heading', label: 'Titel' },
    { prop: 'text', label: 'Textzeile' },
    { prop: 'chipText', label: 'Chip' },
  ]

  // Einziges Inspector-Feld: die Chip-Art (Bedeutung -> Farbe). Titel/Text/
  // Chip-Text laufen ueber Inline-Edit, nicht ueber den Inspector.
  static override readonly customProperties: PropertyDescription[] = [
    statusVariantProperty(
      'chipVariant',
      'Bedeutung des Chips auf der Karte — bestimmt die Chip-Farbe.',
    ),
  ]

  // Strukturelle Groessen (padding, margins, line-height, font-weight) als
  // Literale wie bei Button/Infobox; Farben + Radius + Schriftgroessen aus
  // Tokens. .heading setzt --se-ink explizit (Shadow DOM erbt sonst je nach
  // Umgebung unterschiedlich — WYSIWYG).
  static styles = [
    BasicBlock.styles,
    chipStyles,
    css`
      .card {
        box-sizing: border-box;
        background: var(--se-card-bg);
        border: 1px solid var(--se-card-line);
        border-radius: var(--se-r-md);
        padding: 9px 11px 10px;
        font-family: var(--se-font);
      }
      .heading {
        margin: 0 0 2px;
        color: var(--se-ink);
        font-size: var(--se-fs);
        font-weight: 600;
        line-height: 1.3;
      }
      .text {
        margin: 0 0 8px;
        color: var(--se-muted);
        font-size: var(--se-fs-sm);
      }
    `,
  ]

  @property() chipVariant: StatusVariant = 'info'
  @property() heading = 'Rückruf Fr. Wagner'
  @property() text = 'Befund Minka besprechen'
  @property() chipText = 'Heute'
  @property() headingField = ''
  @property() textField = ''
  @property() chipTextField = ''

  // Stellen tragen data-ff-spot (Klick-Ziel für den Feld-Picker des Editors)
  // und data-ff-bound, wenn sie gebunden sind (Daten-Markierung — sichtbar
  // nur im Editor, siehe BasicBlock-CSS; im Export bleibt sie unsichtbar).
  render(): TemplateResult {
    const v = coerceStatusVariant(this.chipVariant)
    return html`<div class="card">
      <p
        class="heading"
        data-ff-editable
        data-ff-spot="heading"
        ?data-ff-bound=${this.headingField !== ''}
        @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'heading')}
      >${this.heading}</p>
      <p
        class="text"
        data-ff-editable
        data-ff-spot="text"
        ?data-ff-bound=${this.textField !== ''}
        @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'text')}
      >${this.text}</p>
      <span
        class="chip v-${v}"
        data-ff-editable
        data-ff-spot="chipText"
        ?data-ff-bound=${this.chipTextField !== ''}
        @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'chipText')}
      >${this.chipText}</span>
    </div>`
  }
}

BasicBlock.defineAndRegister(CardBlock)
