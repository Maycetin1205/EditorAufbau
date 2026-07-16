// CardBlock
// Molekuel (4K.3, erweitert P1.2; Empfang-Anatomie 2026-07-16): Karte mit
// ACHT Stellen nach dem Empfang-Vorbild — Kopfzeile = Zeit + Datum (Mono),
// darunter Avatar (rund, Tier-Silhouette aus dem Datenwert) neben dem
// Titelblock (Titel + Titel 2 fliessen in einer Zeile zusammen, darunter
// die Unterzeile), dann Textzeile, unten der Status-Chip. Karten sind
// NORMALE Bloecke im Baum — keine eigene Drag-Sonderlogik, die Canvas-
// Drag-Logik aus 2.3 zieht sie wie jeden anderen Block.
//
// Leer-Regel (Nutzer-Entscheidung 2026-07-16): In der MASKE verschwinden
// Stellen ohne Inhalt restlos — samt ihrer Zeile, wenn alles darin leer
// ist; die Karte ist deshalb auto-hoch mit 112px MINDESThoehe (ersetzt die
// feste 112px-Hoehe vom SE-Echttest 2026-07-15, ebenfalls Nutzer-
// Entscheidung). Im Editor bleibt jede Stelle als Klick-Ziel stehen
// (Strich bzw. gestrichelter Avatar-Kreis, Regel 7: nie erfundene Daten).
//
// Alle Text-Stellen werden per Doppelklick direkt auf dem Block bearbeitet
// (Inline-Edit, WYSIWYG) und sind bindbare Stellen (Kap. 5.2); der Avatar
// ist eine reine Daten-Stelle (kein Text, nur Bindung — Wert -> Icon ueber
// tierIcon, Zuordnung aus der Empfang-Referenz). Einziges Inspector-Feld
// ist die Chip-Art (Bedeutung -> Farbe, Regel "Technikwert != Anzeigename").
// Status-Vokabular + Chip-Aussehen kommen aus dem geteilten Modul
// shared/statusVariant. Der Chip ist bewusst KEIN eigenes Element im
// Licht-DOM: dessen Inline-Edit-Event wuerde an der Schattengrenze zur
// Karte umadressiert und die falsche Prop beschreiben. KEINE Aktions-
// Knoepfe (Kap. 8).
//
// Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*), keine Literale,
// keine Fallbacks. Zielbild: die Empfang-Referenzmaske (vkarte) — Avatar
// und Zeilenaufbau folgen ihr, Chip unten bleibt unsere Abweichung
// (Nutzer-Entscheidung 2026-07-15).

import { css, html, nothing, type TemplateResult } from 'lit'
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
import { tierIcon } from './tierIcon'

// Text-Stellen der Karte (der Avatar ist gesondert: kein Inline-Edit).
type TextSpotProp = 'heading' | 'heading2' | 'time' | 'date' | 'meta' | 'text'

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
  // Regel 7 (Nutzer-Entscheidung 2026-07-16): der Editor erfindet nie Daten —
  // alle Stellen starten LEER. Ohne Feldzuweisung zeigt die Maske nichts;
  // im Editor markiert ein Strich (CSS ::before) die leere Stelle als
  // Klick-Ziel für Inline-Edit und Feld-Picker.
  static readonly defaultProps = {
    chipVariant: 'info',
    heading: '',
    heading2: '',
    time: '',
    date: '',
    avatar: '',
    meta: '',
    text: '',
    chipText: '',
    // Bindungen der Stellen (Kap. 5.2): Feldcode der Datenquelle in
    // Reichweite (Technikwert, unsichtbar) — '' = ungebunden, die Stelle
    // zeigt ihren statischen Text.
    headingField: '',
    heading2Field: '',
    timeField: '',
    dateField: '',
    avatarField: '',
    metaField: '',
    textField: '',
    chipTextField: '',
  }

  // Bindbare Stellen (Kap. 5.2, Bedienlogik 3): Klick auf die Stelle bindet
  // sie an ein Feld der Datenquelle in Reichweite (Kanban). Klarnamen für
  // den Feld-Picker; die Bindung liegt in `<prop>Field` (siehe defaultProps).
  static readonly bindableSpots: BindableSpot[] = [
    { prop: 'time', label: 'Zeit' },
    { prop: 'date', label: 'Datum' },
    { prop: 'avatar', label: 'Avatar' },
    { prop: 'heading', label: 'Titel' },
    { prop: 'heading2', label: 'Titel 2' },
    { prop: 'meta', label: 'Unterzeile' },
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
  // Umgebung unterschiedlich — WYSIWYG). Titelzeile + Unterzeile bleiben
  // einzeilig (ellipsis).
  static styles = [
    BasicBlock.styles,
    chipStyles,
    css`
      .card {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        min-height: 112px;
        overflow: hidden;
        gap: 5px;
        background: var(--se-card-bg);
        border: 1px solid var(--se-card-line);
        border-radius: var(--se-r-md);
        padding: 8px 10px 9px;
        font-family: var(--se-font);
      }
      .head {
        display: flex;
        align-items: baseline;
        gap: 7px;
        min-width: 0;
      }
      .time,
      .date {
        color: var(--se-muted);
        font-family: var(--se-mono);
        font-size: var(--se-fs-sm);
      }
      .main {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }
      .avatar {
        box-sizing: border-box;
        display: grid;
        place-items: center;
        width: 28px;
        height: 28px;
        flex: none;
        border-radius: var(--se-r-pill);
        background: var(--se-accent-soft);
        color: var(--se-accent);
      }
      .avatar svg {
        width: 16px;
        height: 16px;
        display: block;
      }
      .titles {
        display: flex;
        flex-direction: column;
        min-width: 0;
        line-height: 1.25;
      }
      .trow {
        display: flex;
        align-items: baseline;
        gap: 5px;
        min-width: 0;
      }
      .heading,
      .heading2 {
        color: var(--se-ink);
        font-size: var(--se-fs-lg);
        font-weight: 600;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .meta {
        display: block;
        color: var(--se-faint);
        font-size: var(--se-fs-sm);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .text {
        display: block;
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
      /* Leere Stellen existieren nur im Editor (die Maske rendert sie gar
         nicht, siehe render): ein Strich markiert das Klick-Ziel, der leere
         Avatar wird zum gestrichelten Kreis (Regel 7: Striche statt
         Demo-Werte). Lit-Marker-Kommentare zählen für :empty nicht. Die
         Daten-Markierung (gepunktete Linie, BasicBlock) ist am Avatar
         unsichtbar — er bekommt stattdessen eine gepunktete Umrandung. */
      :host([data-ff-editor]) [data-ff-spot]:empty::before {
        content: '—';
        color: var(--se-faint);
      }
      :host([data-ff-editor]) .avatar:empty::before {
        content: none;
      }
      :host([data-ff-editor]) .avatar:empty {
        background: transparent;
        border: 1px dashed var(--se-faint);
      }
      :host([data-ff-editor]) .avatar[data-ff-bound] {
        outline: 2px dotted var(--se-accent);
        outline-offset: 1px;
      }
    `,
  ]

  @property() chipVariant: StatusVariant = 'info'
  @property() heading = ''
  @property() heading2 = ''
  @property() time = ''
  @property() date = ''
  @property() avatar = ''
  @property() meta = ''
  @property() text = ''
  @property() chipText = ''
  @property() headingField = ''
  @property() heading2Field = ''
  @property() timeField = ''
  @property() dateField = ''
  @property() avatarField = ''
  @property() metaField = ''
  @property() textField = ''
  @property() chipTextField = ''

  // Eine Text-Stelle: traegt data-ff-spot (Klick-Ziel für den Feld-Picker
  // des Editors) und data-ff-bound, wenn sie gebunden ist (Daten-Markierung
  // — sichtbar nur im Editor, siehe BasicBlock-CSS; im Export bleibt sie
  // unsichtbar).
  private stelle(prop: TextSpotProp, klass: string): TemplateResult {
    return html`<span
      class=${klass}
      data-ff-editable
      data-ff-spot=${prop}
      ?data-ff-bound=${this[`${prop}Field`] !== ''}
      @dblclick=${(e: MouseEvent) => this.inlineEdit(e, prop)}
    >${this[prop]}</span>`
  }

  render(): TemplateResult {
    const v = coerceStatusVariant(this.chipVariant)
    // Leer-Regel: die Maske rendert leere Stellen (und komplett leere
    // Zeilen) gar nicht; der Editor zeigt jede Stelle als Klick-Ziel.
    // data-ff-editor setzt ausschließlich der BlockHost, VOR dem Einhängen —
    // zur Render-Zeit ist das Attribut stabil.
    const editor = this.hasAttribute('data-ff-editor')
    const zeigt = (wert: string) => editor || wert.trim() !== ''
    const kopf = zeigt(this.time) || zeigt(this.date)
    const titel = zeigt(this.heading) || zeigt(this.heading2)
    const mitte = zeigt(this.avatar) || titel || zeigt(this.meta)
    return html`<div class="card">
      ${kopf
        ? html`<div class="head">
            ${zeigt(this.time) ? this.stelle('time', 'time') : nothing}
            ${zeigt(this.date) ? this.stelle('date', 'date') : nothing}
          </div>`
        : nothing}
      ${mitte
        ? html`<div class="main">
            ${zeigt(this.avatar)
              ? html`<span
                  class="avatar"
                  data-ff-spot="avatar"
                  ?data-ff-bound=${this.avatarField !== ''}
                >${this.avatar.trim() === '' ? nothing : tierIcon(this.avatar)}</span>`
              : nothing}
            <div class="titles">
              ${titel
                ? html`<div class="trow">
                    ${zeigt(this.heading) ? this.stelle('heading', 'heading') : nothing}
                    ${zeigt(this.heading2) ? this.stelle('heading2', 'heading2') : nothing}
                  </div>`
                : nothing}
              ${zeigt(this.meta) ? this.stelle('meta', 'meta') : nothing}
            </div>
          </div>`
        : nothing}
      ${zeigt(this.text) ? this.stelle('text', 'text') : nothing}
      ${zeigt(this.chipText)
        ? html`<span
            class="chip v-${v}"
            data-ff-editable
            data-ff-spot="chipText"
            ?data-ff-bound=${this.chipTextField !== ''}
            @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'chipText')}
          >${this.chipText}</span>`
        : nothing}
    </div>`
  }
}

BasicBlock.defineAndRegister(CardBlock)
