// CardBlock
// Molekuel (4K.3, erweitert P1.2): Karte mit FUENF Stellen nach dem
// Empfang-Vorbild — Zeile 1 = Titel (fett) + Zeit (Mono, rechts), Zeile 2 =
// Meta (klein), darunter Textzeile, darunter Status-Chip. Karten sind
// NORMALE Bloecke im Baum — keine eigene Drag-Sonderlogik, die Canvas-
// Drag-Logik aus 2.3 zieht sie wie jeden anderen Block.
//
// Alle Text-Stellen werden per Doppelklick direkt auf dem Block bearbeitet
// (Inline-Edit, WYSIWYG) und sind bindbare Stellen (Kap. 5.2); einziges
// Inspector-Feld ist die Chip-Art (Bedeutung -> Farbe, Regel "Technikwert
// != Anzeigename"). Status-Vokabular + Chip-Aussehen kommen aus dem
// geteilten Modul shared/statusVariant. Der Chip ist bewusst KEIN eigenes
// Element im Licht-DOM: dessen Inline-Edit-Event wuerde an der
// Schattengrenze zur Karte umadressiert und die falsche Prop beschreiben.
// (Der freistehende Status-Chip ff-badge ist seit dem Kahlschlag 2026-07-14
// abgeschafft.) KEINE Aktions-Knoepfe (Kap. 8), KEINE Verknuepfungs-Stellen
// wie Besitzer/Avatar (Kap. 7).
//
// Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*), keine Literale, keine
// Fallbacks. Verbindliches Zielbild: dashboard/stilprobe.html (.zb-card,
// P1.2-Revision — Abweichung vom Empfang-Original dort begruendet: Meta in
// eigener Zeile statt neben dem Titel, weil Entscheidung A schmale Spalten
// erlaubt und die Einzeile den Titel anschneiden wuerde).

import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../base/BasicBlock'
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
  // P1.1 (Vorlagen-Kasten abgeschafft, wie das Empfang-Vorbild): Karten
  // leben in Kanban-Spalten (Gegenrichtung zu allowedChildTypes; Literal,
  // weil ein Import von KanbanSpalteBlock einen Zyklus ergäbe) und stehen
  // nicht in der Bibliothek — sie entstehen mit dem Board bzw. über
  // "+ Karte" an der Spalte. Die ERSTE Karte des Boards ist die
  // Musterkarte (templateChild am Board): aus ihr erzeugt die Laufzeit
  // die Datenkarten.
  static readonly allowedParentTypes = ['kanban-spalte']
  static readonly showInPalette = false
  static readonly defaultProps = {
    chipVariant: 'info',
    heading: 'Rückruf Fr. Wagner',
    time: '09:15',
    meta: 'Katze · EKH',
    text: 'Befund Minka besprechen',
    chipText: 'Heute',
    // Bindungen der Stellen (Kap. 5.2): Feldcode der Datenquelle in
    // Reichweite (Technikwert, unsichtbar) — '' = ungebunden, die Stelle
    // zeigt ihren statischen Text.
    headingField: '',
    timeField: '',
    metaField: '',
    textField: '',
    chipTextField: '',
  }

  // Bindbare Stellen (Kap. 5.2, Bedienlogik 3): Klick auf die Stelle bindet
  // sie an ein Feld der Datenquelle in Reichweite (Kanban). Klarnamen für
  // den Feld-Picker; die Bindung liegt in `<prop>Field` (siehe defaultProps).
  static readonly bindableSpots: BindableSpot[] = [
    { prop: 'heading', label: 'Titel' },
    { prop: 'time', label: 'Zeit' },
    { prop: 'meta', label: 'Meta-Zeile' },
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
  // Literale wie bei Button; Farben + Radius + Schriftgroessen aus
  // Tokens. .heading setzt --se-ink explizit (Shadow DOM erbt sonst je nach
  // Umgebung unterschiedlich — WYSIWYG). Titel/Meta bleiben einzeilig
  // (ellipsis); die Meta rueckt per negativem margin an den Titel heran
  // (Zielbild .zb-cardmeta).
  static styles = [
    BasicBlock.styles,
    chipStyles,
    css`
      .card {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        height: 112px;
        min-height: 112px;
        overflow: hidden;
        gap: 5px;
        background: var(--se-card-bg);
        border: 1px solid var(--se-card-line);
        border-radius: var(--se-r-md);
        padding: 8px 10px 9px;
        font-family: var(--se-font);
      }
      .row {
        display: flex;
        align-items: baseline;
        gap: 7px;
        min-width: 0;
      }
      .heading {
        color: var(--se-ink);
        font-size: var(--se-fs-lg);
        font-weight: 600;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .time {
        margin-left: auto;
        flex: none;
        color: var(--se-muted);
        font-family: var(--se-mono);
        font-size: var(--se-fs-sm);
      }
      .meta {
        margin: -3px 0 0;
        color: var(--se-faint);
        font-size: var(--se-fs-sm);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .text {
        margin: 0;
        color: var(--se-muted);
        font-size: var(--se-fs);
        line-height: 1.35;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }
      .card .chip {
        align-self: flex-start;
        margin-top: auto;
      }
    `,
  ]

  @property() chipVariant: StatusVariant = 'info'
  @property() heading = 'Rückruf Fr. Wagner'
  @property() time = '09:15'
  @property() meta = 'Katze · EKH'
  @property() text = 'Befund Minka besprechen'
  @property() chipText = 'Heute'
  @property() headingField = ''
  @property() timeField = ''
  @property() metaField = ''
  @property() textField = ''
  @property() chipTextField = ''

  // Stellen tragen data-ff-spot (Klick-Ziel für den Feld-Picker des Editors)
  // und data-ff-bound, wenn sie gebunden sind (Daten-Markierung — sichtbar
  // nur im Editor, siehe BasicBlock-CSS; im Export bleibt sie unsichtbar).
  render(): TemplateResult {
    const v = coerceStatusVariant(this.chipVariant)
    return html`<div class="card">
      <div class="row">
        <span
          class="heading"
          data-ff-editable
          data-ff-spot="heading"
          ?data-ff-bound=${this.headingField !== ''}
          @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'heading')}
        >${this.heading}</span>
        <span
          class="time"
          data-ff-editable
          data-ff-spot="time"
          ?data-ff-bound=${this.timeField !== ''}
          @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'time')}
        >${this.time}</span>
      </div>
      <p
        class="meta"
        data-ff-editable
        data-ff-spot="meta"
        ?data-ff-bound=${this.metaField !== ''}
        @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'meta')}
      >${this.meta}</p>
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
