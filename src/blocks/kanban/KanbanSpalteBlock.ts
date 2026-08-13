// KanbanSpalteBlock
// Spezialisierter Container (4K.4): eine Kanban-Spalte mit Kopf (Titel per
// Doppelklick + Kartenzähler) und Rumpf, der Karten aufnimmt — seit N4
// (2026-08-13) wahlweise auch ZIMMER, also Untergruppen, in denen die Karten
// dann liegen (allowedChildTypes — durchgesetzt im Store + in der
// Drag-Vorschau, nie per `if type===` in der UI). Sie erscheint NICHT in der
// Bibliothek (showInPalette=false): Spalten entstehen über "+ Spalte" am
// Board, Zimmer über "+ Zimmer" an der Spalte.
//
// Der Zähler zählt die geslotteten Kinder selbst (slotchange) und ignoriert
// Editor-Hilfselemente (data-ff-editor-helper wie den "+ Karte"-Knopf) —
// dieselbe Logik läuft im Editor UND im Export (WYSIWYG, 1 Render-Quelle).
// Die Bedeutung der Spalte kommt aus dem geteilten Status-Vokabular
// (Technikwert != Anzeigename) und tönt seit N3 (2026-08-13) die GANZE
// Spaltenfläche: Fläche = --se-X-soft, Punkt + Zählerrahmen kräftig
// (--se-X), Titel und Zahl in normaler Textfarbe. Die v-Klassen setzen dafür
// lokale --col-* Variablen, jede löst auf ein --se-Token auf.
//
// Das hebt die Entscheidung vom 2026-08-07 auf, die Fläche für JEDE Spalte
// auf Sand zu stellen und nur den Kopf zu tönen. Grund ist ein neueres
// Vorbild: der Mix ist seit 2026-08-12 angenommen und für N3 verbindlich
// (designsprache/mix-fellnase-empfang.html:87-101 — `.spalte` trägt
// `--ton-flaeche`, `.spalte-kopf` hat weder Fläche noch Trennlinie, der
// Zähler steht auf Papier mit Rand im kräftigen Ton). Die Werte gehen 1:1
// auf: --sand = --se-panel-2, --himmel-zart = --se-blue-soft, --sonne-zart =
// --se-amber-soft, --salbei-zart = --se-green-soft, --papier = --se-panel,
// --espresso = --se-ink.
// Nebenbefund, NICHT gebaut (eigene Entscheidung): das Vorbild hat auch eine
// UNGETÖNTE Spalte (Sand). Unser Status-Vokabular kennt keinen neutralen
// Wert — jede Spalte hat eine Bedeutung, also ist ab jetzt jede getönt. Ein
// neutraler Wert wäre eine Änderung am geteilten Vokabular (Karte + Tabelle
// lesen dasselbe) und gehört nicht in eine Optik-Etappe.
//
// Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*), keine Farb-Literale,
// keine Fallbacks. Grundmaße weiterhin aus designsprache/atome.css
// (.spalte + .spalte-kopf), die Tönung aus dem Mix.

import { css, html, type TemplateResult } from 'lit'
import { property, state } from 'lit/decorators.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { FlowDirection, FlowWidth } from '../../core/blocks/flowLayout'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { CardBlock } from '../card/CardBlock'
import { jaNeinProperty } from '../shared/jaNeinProperty'
import { leerStil, leerZustand } from '../shared/leerZustand'
import {
  coerceStatusVariant,
  statusVariantProperty,
  type StatusVariant,
} from '../shared/statusVariant'
import { kartenAbstandStil } from './kartenAbstand'
import { KanbanZimmerBlock, ZIMMER_INHALT_EVENT } from './KanbanZimmerBlock'

export class KanbanSpalteBlock extends BasicBlock {
  static readonly blockType = 'kanban-spalte'
  static readonly tagName = 'ff-kanban-spalte'
  static readonly displayName = 'Kanban-Spalte'
  static readonly category: BlockCategory = 'anzeige'
  static readonly acceptsChildren = true
  // Nutzer-Entscheidung 2026-07-10: KEIN "+ Karte" — eine Zeile aus
  // SoftEngine = eine Karte, die Anzahl bestimmen allein die Daten. Die
  // EINE Musterkarte (templateChild am Board) ist das Gestaltungsobjekt;
  // sie lässt sich zwischen Spalten ziehen (allowedChildTypes), aber nie
  // löschen und nie vermehren.
  //
  // N4: dazu die ZIMMER (Untergruppen). Eine Spalte darf beides zugleich
  // tragen — die Musterkarte bleibt liegen, wo der Bauer sie hingelegt hat,
  // auch wenn daneben Zimmer stehen.
  static readonly allowedChildTypes: string[] = [
    CardBlock.blockType,
    KanbanZimmerBlock.blockType,
  ]
  // N4: der "+"-Anstecker der Spalte legt ein Zimmer an — dieselbe Bauart wie
  // "+ Spalte" am Board und "+ Eintrag" an der Navi. Zimmer entstehen NUR so
  // (showInPalette=false): ohne diesen Knopf gaebe es keinen Weg, eine Spalte
  // zu unterteilen, und ein Inspector-Schalter dafuer waere Bedienung fern
  // vom Ding (Regel 7).
  static readonly addChildButton = { label: 'Zimmer', childType: KanbanZimmerBlock.blockType }
  static readonly childDirection: FlowDirection = 'column'
  static readonly showInPalette = false
  static readonly containerHint = false
  // S3: Spalten leben NUR im Board (Gegenrichtung zu allowedChildTypes; als
  // Literal, weil ein Import von KanbanBlock einen Import-Zyklus ergäbe).
  // K0/Entscheidung A: Spalten haben KEINE einstellbare Breite — sie teilen
  // sich die Board-Zeile IMMER gleichmäßig (lockedWidth 'fill' → flex-basis
  // 0 + min-width 0): keine Mindestbreite, kein Umbruch, kein horizontaler
  // Scroll. Karten scrollen senkrecht IM Spaltenrumpf (.body).
  static readonly allowedParentTypes = ['kanban']
  static readonly lockedWidth: FlowWidth = 'fill'
  static readonly resizableWidth = false
  // Nutzer-Entscheidung 2026-07-14: der TITEL (heading) IST der Datenwert
  // der Spalte — das frühere separate statusValue ist abgeschafft (zweimal
  // dasselbe eintippen war Unsinn). Einsortiert wird durch Vergleich des
  // Spalten-Felds (statusField am Board) mit dem Titel (getrimmt, Groß/
  // klein egal); Ziehen schreibt den Titel der Zielspalte zurück. Bewusste
  // Konsequenz: der Titel muss exakt dem SoftEngine-Wert entsprechen —
  // Umbenennen per Doppelklick ändert damit auch, was geschrieben wird.
  // zimmerField: Feldcode des Zimmer-Felds (Technikwert, unsichtbar) — sein
  // Zeilenwert bestimmt im Export das ZIMMER innerhalb dieser Spalte, genau
  // wie statusField am Board die Spalte bestimmt. OPTIONAL und ohne jede
  // Wirkung, solange die Spalte keine Zimmer hat.
  static readonly defaultProps = {
    variant: 'info',
    heading: 'Neue Spalte',
    auffang: 'nein',
    zimmerField: '',
  }

  // Inspector: nur die Bedeutung (-> Farbwelt der Spalte). Der Titel
  // (= Datenwert) läuft über Inline-Edit direkt am Spaltenkopf.
  static override readonly customProperties: PropertyDescription[] = [
    statusVariantProperty(
      'variant',
      'Bedeutung der Spalte — bestimmt ihre Farbwelt (Kopf, Fläche, Rahmen).',
    ),
    jaNeinProperty(
      'auffang',
      'Auffangspalte',
      'Eintr\u00E4ge ohne passenden Spaltentitel landen hier. Ohne Auffangspalte landen sie in der ersten Spalte.',
      { requiresDataSource: true, exclusiveAmongSiblings: true },
    ),
    // N4: die zweite Sortierebene. Wortwahl bewusst nah an „Einsortieren
    // nach" am Board — es IST dieselbe Bedienung, nur eine Ebene tiefer.
    // Die Feldliste kommt aus der Quelle des BOARDS (der Inspector sucht sie
    // mit dataSourceFor am Elternteil); an der Spalte selbst haengt nie eine
    // eigene Quelle.
    {
      attributeName: 'zimmerField',
      name: 'Unterteilen nach',
      description: 'Optional: Feld der Datenquelle, dessen Inhalt bestimmt, in welches Zimmer dieser Spalte ein Eintrag kommt. Wirkt erst, wenn die Spalte Zimmer hat.',
      kind: 'field',
    },
  ]

  // Strukturelle Größen (padding, font-weight, 9px-Punkt, 22px-Zähler) als
  // Literale exakt nach Zielbild; Farben + Radius + Schriftgrößen aus Tokens.
  static override styles = [
    BasicBlock.styles,
    leerStil,
    kartenAbstandStil,
    css`
      /* Die Spalte fuellt die Board-Hoehe in BEIDEN Welten (P1.2-Fix eines
         P1.3-Fehlers): die Host-HOEHE bleibt auto — nur so greift im Export
         das align-items:stretch des Boards (eine Prozent-Hoehe zaehlt fuer
         stretch nicht als auto und loeste sich gegen die unbestimmte
         Board-Hoehe zur Inhaltshoehe auf -> leere Spalten blieben kurz).
         min-height:100% deckt den Editor ab (BlockHost-Wrapper = Flex-Item,
         reicht feste Hoehen per 100%-Kette durch); der Host ist selbst
         Flex-Spalte, damit .col die Host-Box IMMER fuellt (flex:1 statt
         height:100% — Prozent braeuchte eine bestimmte Elternhoehe). */
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100%;
      }
      /* Flaeche = Toenung der Bedeutung, ueber die GANZE Spalte; kein Rahmen,
         der Farbwechsel setzt sie ab. Rundung 7px = calc(--rundung + 2px) des
         Vorbilds; overflow:hidden schneidet an den Ecken ab. S. Klassenkopf. */
      .col {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
        overflow: hidden;
        background: var(--col-soft);
        border-radius: var(--se-r-lg);
        font-family: var(--se-font);
      }
      /* --col-strong: Punkt + Zaehlerrand · --col-soft: die Spaltenflaeche. */
      .col.v-info { --col-strong: var(--se-blue); --col-soft: var(--se-blue-soft); }
      .col.v-success { --col-strong: var(--se-green); --col-soft: var(--se-green-soft); }
      .col.v-warning { --col-strong: var(--se-amber); --col-soft: var(--se-amber-soft); }
      .col.v-danger { --col-strong: var(--se-red); --col-soft: var(--se-red-soft); }
      /* Kopf ohne eigene Flaeche und ohne Trennlinie (Vorbild .spalte-kopf:
         nur Abstaende); seine Unterkante ist der Abstand zur ersten Karte. */
      .head {
        flex: none;
        display: flex;
        align-items: center;
        gap: var(--se-gap-sm);
        padding: 10px 12px;
      }
      /* Quadratisch, nicht rund: derselbe Punkt wie an der Status-Marke
         (Fellnase Regel 5, 2026-08-06) — bis dahin war er eine Scheibe. */
      .dot {
        flex: none;
        width: 8px;
        height: 8px;
        background: var(--col-strong);
      }
      /* Eigene Zeilenhoehen wie in der Demo (.spalte-titel 1.3, .zaehler 1).
         Ohne sie erben beide die Zeilenhoehe der Maske (--se-lh, 1.55) und
         werden dadurch hoeher als im Vorbild: der Titel schiebt den Kopf
         auseinander, der Zaehler wird zum Kaestchen mit Luft ueber und unter
         der Zahl. Die Demo setzt die Werte am Element, nicht am Grundtext —
         deshalb stehen sie auch hier am Element. */
      /* Titel und Zahl in normaler Textfarbe — die Bedeutung zeigt die
         Flaeche (Vorbild: .spalte-titel ohne Farbe, .zaehler espresso). */
      .title {
        color: var(--se-ink);
        font-size: var(--se-fs);
        font-weight: 600;
        line-height: 1.3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      /* Zaehler: Papierflaeche, Rand im kraeftigen Ton (Vorbild .zaehler). */
      .count {
        margin-left: auto;
        min-width: 22px;
        padding: 1px 8px;
        line-height: 1;
        border-radius: var(--se-r-sm);
        background: var(--se-panel);
        border: var(--se-border) solid var(--col-strong);
        text-align: center;
        font-family: var(--se-mono);
        font-size: var(--se-fs-sm);
        font-weight: 600;
        color: var(--se-ink);
      }
      /* K0: der Rumpf scrollt senkrecht (Empfang-Vorbild .vspalte-karten);
         min-height:0 erlaubt ihm, bei fester Board-Höhe kleiner zu werden
         als sein Inhalt — der Leer-Hinweis hält leere Spalten offen. */
      /* Innenabstand nach Demo (.spalte: 10px seitlich, 12px unten). Oben
         KEINER: dort steht der Kopf, dessen eigene Unterkante den Abstand zur
         ersten Karte schon setzt — genau wie .spalte-kopf in der Demo.
         KEIN gap: den Kartenabstand macht der 24px-Vorschub der Karte
         (kartenStil). Bis 2026-08-07 lagen hier 6px obendrauf, also 30px statt
         24px zwischen zwei Karten. */
      .body {
        padding: 0 10px 12px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
      }
      /* Der Abstand zwischen zwei gestapelten Karten steht seit N4 in
         ./kartenAbstand — dieselbe Regel braucht auch der Zimmer-Rumpf, und
         zwei Kopien waeren zwei Wahrheiten. Sie gilt hier unveraendert und
         trifft ab N4 auch die Zimmer selbst: das Optik-Vorbild setzt sie
         zwar enger (8px), aber eine tag-genaue Regel griffe nur im Export
         (im Editor liegt jedes Kind in einem Wrapper) — Editor und Maske
         stuenden dann verschieden da. Begruendung ausfuehrlich dort. */
    `,
  ]

  @property() variant: StatusVariant = 'info'
  @property() heading = 'Neue Spalte'

  // Der Leerzustand-Satz DIESER Spalte — gesetzt von der Board-Laufzeit
  // (./seRuntime), sobald sie die Zeilen verteilt hat und diese Spalte leer
  // ausgegangen ist. Leer = kein Leerzustand.
  //
  // Warum die Laufzeit das setzt und nicht die Spalte selbst entscheidet: nur
  // das Board weiss, ob ueberhaupt eine Datenquelle haengt. Ohne Quelle ist
  // eine leere Spalte kein Leerzustand, sondern ein Bauplan, in dem noch
  // nichts steht — und im EDITOR ist genau das der Normalfall (zwei der drei
  // Standardspalten sind leer). Der Editor bleibt deshalb unveraendert.
  // attribute:false: ein Laufzeitwert, der nie in den Export gehoert.
  @property({ attribute: false }) leerHinweis = ''

  // Kartenzähler: aus dem Inhalt abgeleitet, nie gepflegt.
  @state() private _count = 0

  constructor() {
    super()
    // N4: eine Karte liegt entweder direkt in der Spalte ODER in einem
    // Zimmer. Legt die Laufzeit sie in ein Zimmer, feuert nur DESSEN
    // slotchange — der bleibt in dessen Schattenbaum (composed: false) und
    // erreicht diese Spalte nie. Deshalb meldet sich das Zimmer selbst
    // (ZIMMER_INHALT_EVENT), und die Spalte zählt neu.
    this.addEventListener(ZIMMER_INHALT_EVENT, () => this.zaehle())
  }

  // Gezählt werden KARTEN, egal wie tief sie liegen — nicht die geslotteten
  // Kinder: mit Zimmern wären das die Zimmer, und der Zähler zeigte plötzlich
  // die Zahl der Untergruppen statt der Einträge.
  //
  // querySelectorAll geht durch den LICHT-Baum dieser Spalte und findet
  // beide Lagen. Es steigt bewusst NICHT in <template> hinein (eigenes
  // Dokumentfragment) — im Export reist die Musterkarte genau so mit und ist
  // keine sichtbare Karte. Im EDITOR liegt jede Karte in einem
  // BlockHost-Wrapper; für querySelectorAll ist die Tiefe egal, beide Welten
  // zählen deshalb dieselbe Zahl.
  private zaehle(): void {
    this._count = Array.from(this.querySelectorAll(CardBlock.tagName))
      .filter((el) => !el.hasAttribute('data-ff-editor-helper'))
      .length
  }

  override render(): TemplateResult {
    const v = coerceStatusVariant(this.variant)
    return html`<div class="col v-${v}">
      <div class="head">
        <span class="dot"></span>
        <span
          class="title"
          data-ff-editable
          @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'heading')}
        >${this.heading}</span>
        <span class="count">${this._count}</span>
      </div>
      <div class="body">
        <slot @slotchange=${this.zaehle}></slot>
        ${leerZustand(this.leerHinweis)}
      </div>
    </div>`
  }
}

BasicBlock.defineAndRegister(KanbanSpalteBlock)
