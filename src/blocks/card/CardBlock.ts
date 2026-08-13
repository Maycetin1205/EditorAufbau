// CardBlock
// Molekuel: Karte mit ACHT Stellen — seit 2026-08-06 gebaut wie die KARTE DER
// DEMO (designsprache/musterbogen.html, .karte), Wert fuer Wert abgeschrieben
// auf Nutzer-Auftrag („der Nutzer will exakt die Demo-Karte"). Aufbau von oben
// nach unten:
//
//   Lasche oben links   Datum + Zeit (die Karteikarten-Signatur der Sprache)
//   Kopf                Bild links, daneben Titel ueber der Unterzeile
//   Fliesstext          die Textzeile, hoechstens zwei Zeilen
//   Fusszeile           links Titel 2, rechts die Status-Marke
//
// Vorher (bis 2026-08-06, Empfang-Vorbild): Zeit und Datum sassen oben RECHTS,
// Titel und Titel 2 flossen in EINER Zeile zusammen, und die Marke stand allein
// unten links. Keine Stelle ist bei dem Umbau weggefallen oder dazugekommen —
// sie sitzen nur woanders, gespeicherte Karten verlieren also nichts. Die
// Zuordnung der zwei uebrigen Stellen (Datum, Titel 2) ist eine
// Nutzer-Entscheidung: Datum teilt sich die Lasche mit der Zeit, Titel 2 wird
// der linke Fussplatz — in der Demo steht dort der Tierhalter, also ein Name.
//
// Karten sind NORMALE Bloecke im Baum — keine eigene Drag-Sonderlogik.
//
// Leer-Regel: In der MASKE verschwinden Stellen ohne Inhalt restlos — samt
// ihrer Zeile, wenn alles darin leer ist. Im EDITOR bleibt jede Stelle ein
// Klick-Ziel (Strich bzw. gestrichelte Bildflaeche): ganz weglassen geht
// nicht, eine leere Stelle waere 0px hoch und liesse sich nie anklicken.
// Seit U8 (2026-08-12) an JEDER Karte gleich — die Auswahl aendert das Gesicht
// der Karte nicht mehr (Begruendung in ./kartenStil). Das WIE steht dort.
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
// keine Fallbacks — das WIE wohnt in ./kartenStil.

import { html, nothing, type PropertyValues, type TemplateResult } from 'lit'
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
import { kartenStil } from './kartenStil'

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
  // Seit N4 auch im ZIMMER (Untergruppe einer Spalte) — dieselbe Karte, nur
  // eine Ebene tiefer.
  static readonly allowedParentTypes = ['kanban-spalte', 'kanban-zimmer']
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

  // chipStyles ist die GETEILTE Marke (../shared/statusVariant) — dieselbe,
  // die Tabelle und Kanban-Spalte tragen. Das Aussehen der Karte selbst
  // wohnt in ./kartenStil (Werte aus der Demo, s. Kopfkommentar).
  static override styles = [BasicBlock.styles, chipStyles, kartenStil]

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

  // Hat diese Karte eine Lasche? Die Antwort brauchen ZWEI Stellen: das
  // Template hier und der Platz ueber der Karte (kartenStil: die Lasche ragt
  // nach oben heraus). Darum steht sie an einer Stelle — und wird als Attribut
  // `hat-reiter` nach aussen getragen, weil ihre Bedingung im Inneren der Karte
  // entsteht und von aussen sonst nicht sichtbar waere. Das Attribut ist ein
  // Laufzeitwert: der Export schreibt Attribute aus dem Baustein-Modell, nicht
  // aus dem lebenden Baum — es landet nie in einer Datei.
  private hatReiter(): boolean {
    return this.hasAttribute('data-ff-editor') || this.date.trim() !== '' || this.time.trim() !== ''
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed)
    this.toggleAttribute('hat-reiter', this.hatReiter())
  }

  override render(): TemplateResult {
    const v = coerceStatusVariant(this.chipVariant)
    // Leer-Regel: die Maske rendert leere Stellen (und komplett leere
    // Zeilen) gar nicht; der Editor zeigt jede Stelle als Klick-Ziel.
    // data-ff-editor setzt ausschließlich der BlockHost, VOR dem Einhängen —
    // zur Render-Zeit ist das Attribut stabil.
    const editor = this.hasAttribute('data-ff-editor')
    const zeigt = (wert: string) => editor || wert.trim() !== ''
    // Die vier Baugruppen der Demo-Karte. Jede faellt weg, wenn NICHTS darin
    // steht — in der Maske; im Editor steht immer alles (Klick-Ziele).
    const reiter = this.hatReiter()
    const kopf = zeigt(this.avatar) || zeigt(this.heading) || zeigt(this.meta)
    const fuss = zeigt(this.heading2) || zeigt(this.chipText)
    return html`<div class="card v-${v}${reiter ? '' : ' ohne-reiter'}">
      ${reiter
        ? html`<span class="reiter">
            ${zeigt(this.date) ? this.stelle('date', 'datum') : nothing}
            ${zeigt(this.time) ? this.stelle('time', 'zeit') : nothing}
          </span>`
        : nothing}
      ${kopf
        ? html`<div class="kopf">
            ${zeigt(this.avatar)
              ? html`<span
                  class="avatar"
                  data-ff-spot="avatar"
                  ?data-ff-bound=${this.avatarField !== ''}
                >${this.avatar.trim() === '' ? nothing : tierIcon(this.avatar)}</span>`
              : nothing}
            <div class="namen">
              ${zeigt(this.heading) ? this.stelle('heading', 'name') : nothing}
              ${zeigt(this.meta) ? this.stelle('meta', 'zusatz') : nothing}
            </div>
          </div>`
        : nothing}
      ${zeigt(this.text) ? this.stelle('text', 'grund') : nothing}
      ${fuss
        ? html`<div class="fuss">
            ${zeigt(this.heading2) ? this.stelle('heading2', 'fussl') : nothing}
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
        : nothing}
    </div>`
  }
}

BasicBlock.defineAndRegister(CardBlock)
