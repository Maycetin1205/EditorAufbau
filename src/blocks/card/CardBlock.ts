// CardBlock
// Molekuel (4K.3; Empfang-Anatomie): Karte mit ACHT Stellen nach dem
// Empfang-Vorbild — oben Avatar (freistehendes Tierzeichen aus dem Datenwert)
// neben dem Titelblock (Titel + Titel 2 fliessen in einer Zeile zusammen,
// darunter die Unterzeile), Zeit + Datum sitzen OBEN RECHTS in derselben
// Zeile, dann Textzeile, unten der Status-Chip. Karten sind NORMALE
// Bloecke im Baum — keine eigene Drag-Sonderlogik, die Canvas-Drag-Logik
// aus 2.3 zieht sie wie jeden anderen Block. (Entscheidungs-Historie:
// docs/decisions/2026-07-16-karte-empfang-anatomie.md)
//
// Leer-Regel: In der MASKE verschwinden Stellen ohne Inhalt restlos —
// samt ihrer Zeile, wenn alles darin leer ist; die Karte ist deshalb
// auto-hoch mit 112px MINDESThoehe. Im Editor bleibt jede Stelle als
// Klick-Ziel stehen (Strich bzw. gestrichelter Avatar-Kreis, Regel 7:
// nie erfundene Daten).
//
// Alle Text-Stellen werden per Doppelklick direkt auf dem Block bearbeitet
// (Inline-Edit, WYSIWYG) und sind bindbare Stellen; der Avatar
// ist eine reine Daten-Stelle (kein Text, nur Bindung — Wert -> Zeichen ueber
// shared/tierIcon, seit 2026-08-06 die zehn Bilder des Nutzers statt der
// sechs Silhouetten aus der Empfang-Referenz). Einziges Inspector-Feld
// ist die Chip-Art (Bedeutung -> Farbe, Regel "Technikwert != Anzeigename").
// Status-Vokabular + Chip-Aussehen kommen aus dem geteilten Modul
// shared/statusVariant. Der Chip ist bewusst KEIN eigenes Element im
// Licht-DOM: dessen Inline-Edit-Event wuerde an der Schattengrenze zur
// Karte umadressiert und die falsche Prop beschreiben. KEINE Aktions-
// Knoepfe.
//
// Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*), keine Literale,
// keine Fallbacks. Zielbild: die Empfang-Referenzmaske (vkarte) — Avatar
// und Zeilenaufbau folgen ihr, Chip unten bleibt unsere Abweichung
// (Nutzer-Entscheidung 2026-07-15).

import { css, html, nothing, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { BindableSpotsFor, BindingProp } from '../../core/blocks/BlockDefinition'
import type { FlowWidth } from '../../core/blocks/flowLayout'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import {
  chipStyles,
  coerceStatusVariant,
  statusVariantProperty,
  type StatusVariant,
} from '../shared/statusVariant'
import { tierIcon } from '../shared/tierIcon'

// Text-Stellen der Karte (der Avatar ist gesondert: kein Inline-Edit).
type TextSpotProp = 'heading' | 'heading2' | 'time' | 'date' | 'meta' | 'text'

export class CardBlock extends BasicBlock {
  static readonly blockType = 'card'
  static readonly tagName = 'ff-card'
  static readonly displayName = 'Karte'
  static readonly category: BlockCategory = 'anzeige'
  // Karten leben in Kanban-Spalten (Gegenrichtung zu allowedChildTypes;
  // Literal, weil ein Import von KanbanSpalteBlock einen Zyklus ergäbe)
  // und stehen nicht in der Bibliothek — sie entstehen mit dem Board bzw.
  // über "+ Karte" an der Spalte. Die ERSTE Karte des Boards ist die
  // Musterkarte (templateChild am Board): aus ihr erzeugt die Laufzeit
  // die Datenkarten.
  static readonly allowedParentTypes = ['kanban-spalte']
  static readonly showInPalette = false
  // Karten haben KEINE einstellbare Breite — sie sind IMMER so breit wie
  // ihre Spalte (lockedWidth 'fill', dasselbe Muster wie die Spalte selbst:
  // die width-Prop des Knotens wird ignoriert, kein Breiten-Anfasser).
  // Bereits verschmälerte Bestandskarten springen damit von selbst zurück
  // auf volle Spaltenbreite.
  static readonly lockedWidth: FlowWidth = 'fill'
  static readonly resizableWidth = false
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
    // Bindungen der Stellen: Feldcode der Datenquelle in
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

  // Bindbare Stellen: Klick auf die Stelle bindet
  // sie an ein Feld der Datenquelle in Reichweite (Kanban). Klarnamen für
  // den Feld-Picker; die Bindung liegt in `<prop>Field` (siehe defaultProps,
  // typgeprüft über die Bindungs-Konvention, A5).
  static readonly bindableSpots: BindableSpotsFor<typeof CardBlock.defaultProps> = [
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
  static override styles = [
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
        border: var(--se-border) solid var(--se-card-line);
        border-radius: var(--se-r-md);
        padding: 8px 10px 9px;
        font-family: var(--se-font);
        transition: border-color var(--se-move);
      }
      /* Flach (Fellnase Regel 4): beim Zeigen wird die KANTE dunkler, die
         Karte hebt nicht ab. Vorher hob sie sich per Schatten + 1px nach
         oben — das liess die Nachbarkarten wackeln und war das einzige
         Koerperhafte der Maske. */
      .card:hover {
        border-color: var(--se-faint);
      }
      /* Statusfarbe AM KOERPER (2026-07-30, Nutzer-Go).
         Die Karte kennt ihren Status laengst — die Eigenschaft „Farbe"
         faerbt seit jeher den Chip. Gezeigt hat der Koerper ihn nie: weisse
         Flaeche, grauer Rahmen, egal ob Notfall oder erledigt. Ein schmaler
         Streifen links macht ihn auf einen Blick lesbar. Kostet KEINE neue
         Eigenschaft und KEINE neue Farbe — dieselben Statusfarben wie Chip
         und Kanban-Spalte, dieselbe Klassen-Bauart (v-variante). */
      .card { border-left-width: 3px; }
      .card.v-info { border-left-color: var(--se-blue); }
      .card.v-success { border-left-color: var(--se-green); }
      .card.v-warning { border-left-color: var(--se-amber); }
      .card.v-danger { border-left-color: var(--se-red); }
      /* Die GEWAEHLTE Karte (Auswahl-Geber Kanban, 2026-08-05): getoente
         Akzentflaeche + Akzentrahmen — dieselbe Handschrift wie die
         gewaehlte Tabellenzeile. Das Attribut setzt NUR die Laufzeit
         (kanban/seRuntime), der Editor erfindet keine Auswahl (Regel 7).
         Der linke STATUS-Streifen bleibt sichtbar: er traegt Bedeutung
         (Notfall!), darum nur die drei anderen Kanten in Akzent. */
      :host([data-ff-auswahl]) .card {
        border-top-color: var(--se-accent);
        border-right-color: var(--se-accent);
        border-bottom-color: var(--se-accent);
        background: var(--se-accent-soft);
      }
      .main {
        display: flex;
        align-items: center;
        gap: 9px;
        min-width: 0;
      }
      /* Zeit + Datum oben rechts (Nutzer-Entscheidung 2026-07-16) —
         align-self:flex-start hält die Gruppe an der Oberkante, auch wenn
         der Titelblock zweizeilig ist. */
      .when {
        display: flex;
        align-items: baseline;
        gap: 7px;
        flex: none;
        margin-left: auto;
        align-self: flex-start;
      }
      .time,
      .date {
        color: var(--se-muted);
        font-family: var(--se-mono);
        font-size: var(--se-fs-sm);
      }
      /* Avatar: das Tierzeichen steht FREI, ohne Kachel darunter.
         Bis 2026-08-06 sass es auf einer koralle-getoenten 30px-Flaeche und
         war selbst nur 17px gross. Zwei Gruende, beide zwingend: die
         Designsprache hat die Kachel ausdruecklich abgeschafft („sie wirkte
         als Rahmen, in dem das Zeichen eingequetscht aussah. Ohne sie atmet
         es" — designsprache/atome.css, Nutzer-Entscheidung), und die neuen
         Zeichen bringen ihre eigenen Farben mit: ein buntes Bild auf
         getoentem Grund in der Hausfarbe schlaegt sich mit ihr.
         Die Flaeche bleibt 30px (der dichte Editor-Takt, nicht die 36px der
         Demo), das Bild fuellt sie jetzt aber ganz. Die Farbe (color) bleibt
         gesetzt — davon lebt die Pfote, der einzige einfarbige Rueckfall. */
      .avatar {
        box-sizing: border-box;
        display: grid;
        place-items: center;
        width: 30px;
        height: 30px;
        flex: none;
        color: var(--se-accent);
      }
      .avatar img,
      .avatar svg {
        width: 100%;
        height: 100%;
        display: block;
        /* Die Zeichen sind quadratisch aufgefuellt; contain haelt sie auch
           dann unverzerrt, wenn die Flaeche einmal nicht quadratisch ist. */
        object-fit: contain;
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
        border: var(--se-border) dashed var(--se-faint);
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
      ?data-ff-bound=${this[`${prop}Field` satisfies BindingProp<TextSpotProp>] !== ''}
      @dblclick=${(e: MouseEvent) => this.inlineEdit(e, prop)}
    >${this[prop]}</span>`
  }

  override render(): TemplateResult {
    const v = coerceStatusVariant(this.chipVariant)
    // Leer-Regel: die Maske rendert leere Stellen (und komplett leere
    // Zeilen) gar nicht; der Editor zeigt jede Stelle als Klick-Ziel.
    // data-ff-editor setzt ausschließlich der BlockHost, VOR dem Einhängen —
    // zur Render-Zeit ist das Attribut stabil.
    const editor = this.hasAttribute('data-ff-editor')
    const zeigt = (wert: string) => editor || wert.trim() !== ''
    const titel = zeigt(this.heading) || zeigt(this.heading2)
    const wann = zeigt(this.time) || zeigt(this.date)
    const mitte = zeigt(this.avatar) || titel || zeigt(this.meta) || wann
    return html`<div class="card v-${v}">
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
            ${wann
              ? html`<div class="when">
                  ${zeigt(this.date) ? this.stelle('date', 'date') : nothing}
                  ${zeigt(this.time) ? this.stelle('time', 'time') : nothing}
                </div>`
              : nothing}
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
