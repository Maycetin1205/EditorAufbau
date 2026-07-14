// KanbanSpalteBlock
// Spezialisierter Container (4K.4): eine Kanban-Spalte mit Kopf (Titel per
// Doppelklick + Kartenzähler) und Rumpf, der AUSSCHLIESSLICH Karten aufnimmt
// (allowedChildTypes — durchgesetzt im Store + in der Drag-Vorschau, nie per
// `if type===` in der UI). Sie erscheint NICHT in der Bibliothek
// (showInPalette=false): Spalten entstehen über "+ Spalte" am Board.
//
// Der Zähler zählt die geslotteten Kinder selbst (slotchange) und ignoriert
// Editor-Hilfselemente (data-ff-editor-helper wie den "+ Karte"-Knopf) —
// dieselbe Logik läuft im Editor UND im Export (WYSIWYG, 1 Render-Quelle).
// Die Bedeutung der Spalte kommt aus dem geteilten Status-Vokabular
// (Technikwert != Anzeigename) und tönt seit P1.2 die GANZE Spalte
// (Empfang-Vorbild .vspalte): Kopf = --se-X-soft, Fläche = --se-X-shell,
// Rahmen = --se-X-line, Titel + Punkt + Zähler kräftig (--se-X). Die
// v-Klassen setzen dafür lokale --col-* Variablen, jede löst auf ein
// --se-Token auf (dasselbe Muster wie --zw-* im Zielbild-Mockup).
//
// Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*), keine Farb-Literale,
// keine Fallbacks. Verbindliches Zielbild: dashboard/stilprobe.html (.zb-col).

import { css, html, type TemplateResult } from 'lit'
import { property, state } from 'lit/decorators.js'
import { BasicBlock } from '../../core/blocks/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { FlowDirection, FlowWidth } from '../../core/blocks/flowLayout'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { CardBlock } from '../card/CardBlock'
import { jaNeinProperty } from '../shared/jaNeinProperty'
import {
  coerceStatusVariant,
  statusVariantProperty,
  type StatusVariant,
} from '../shared/statusVariant'

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
  static readonly allowedChildTypes: string[] = [CardBlock.blockType]
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
  // statusValues (V2/B1, ersetzt statusValue): die Datenwerte dieser Spalte
  // als LISTE (Technikwerte) — Zeilen, deren Spalten-Feld (statusField am
  // Board) einen dieser Werte hat, landen im Export hier; beim Ablegen wird
  // der ERSTE Wert zurückgeschrieben. Standard-Regel (freigegebene Strecke):
  // LEERE Liste = der Spaltentitel zählt als Wert. Die Listenform trägt schon
  // K5b (Unterbereiche = je Wert eine Drop-Zone). Alte Stände mit statusValue
  // migriert der Lader (Editor.ts). Default [] -> überlebt Persistenz, reist
  // als JSON-Attribut.
  // auffang (V2/B2): Ja/Nein-Kennzeichen "Auffangspalte" — Zeilen, deren
  // Sortier-Feld KEINE Spalte trifft, landen zur Laufzeit hier. Hoechstens
  // eine je Board (exclusiveAmongSiblings, durchgesetzt im Store + in der
  // Preflight). Ohne gewaehlte Auffangspalte erzeugt die Maske zur Laufzeit
  // die eigene Spalte "Nicht zugeordnet" (seRuntime) — Zeilen verschwinden
  // NIE still (Nutzer-Auflage der freigegebenen Strecke).
  static readonly defaultProps = {
    variant: 'info',
    heading: 'Neue Spalte',
    statusValues: [] as string[],
    auffang: 'nein',
  }

  // Inspector: nur noch die Bedeutung (-> Farbwelt der Spalte). Der Titel
  // läuft über Inline-Edit direkt am Spaltenkopf; Werte-Liste + Auffang
  // werden seit B3 in der Bindungsstrecke am BOARD gepflegt — ihre
  // Beschreibungen bleiben hier die EINE Property-Wahrheit (Wortlaut für
  // die Strecke, exclusiveAmongSiblings für Store + Preflight), sind aber
  // hiddenInInspector (die B1/B2-Brücken-Controls sind ABGELÖST).
  static override readonly customProperties: PropertyDescription[] = [
    statusVariantProperty(
      'variant',
      'Bedeutung der Spalte — bestimmt ihre Farbwelt (Kopf, Fläche, Rahmen).',
    ),
    {
      attributeName: 'statusValues',
      // Wortlaut-Runde V1 (2026-07-13, Nutzer): das ist das `zimmer:`-Feld
      // seiner Referenzmaske — Titel (sichtbar) und Wert (Technik) getrennt.
      name: 'Werte dieser Spalte',
      description: 'Einträge, bei denen einer dieser Werte im Sortier-Feld steht, landen hier; beim Ablegen einer Karte wird der erste Wert zurückgeschrieben. Ohne eigene Werte zählt der Spaltentitel.',
      isArray: true,
      maxLength: 60,
      kind: 'text',
      requiresDataSource: true,
      hiddenInInspector: true,
    },
    jaNeinProperty(
      'auffang',
      'Auffangspalte',
      'Einträge, die in keine Spalte passen, landen hier. Ohne Auffangspalte zeigt die Maske sie in einer eigenen Spalte "Nicht zugeordnet". Höchstens eine Spalte je Board.',
      { requiresDataSource: true, exclusiveAmongSiblings: true, hiddenInInspector: true },
    ),
  ]

  // Strukturelle Größen (padding, font-weight, 9px-Punkt, 22px-Zähler) als
  // Literale exakt nach Zielbild; Farben + Radius + Schriftgrößen aus Tokens.
  static styles = [
    BasicBlock.styles,
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
      /* P1.2: overflow:hidden schneidet die getoente Kopfzeile an den
         runden Spaltenecken sauber ab (Empfang-Vorbild). */
      .col {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
        overflow: hidden;
        background: var(--col-shell);
        border: 1px solid var(--col-line);
        border-radius: var(--se-r-lg);
        font-family: var(--se-font);
      }
      .col.v-info { --col-strong: var(--se-blue); --col-soft: var(--se-blue-soft); --col-shell: var(--se-blue-shell); --col-line: var(--se-blue-line); }
      .col.v-success { --col-strong: var(--se-green); --col-soft: var(--se-green-soft); --col-shell: var(--se-green-shell); --col-line: var(--se-green-line); }
      .col.v-warning { --col-strong: var(--se-amber); --col-soft: var(--se-amber-soft); --col-shell: var(--se-amber-shell); --col-line: var(--se-amber-line); }
      .col.v-danger { --col-strong: var(--se-red); --col-soft: var(--se-red-soft); --col-shell: var(--se-red-shell); --col-line: var(--se-red-line); }
      /* B2: die Laufzeit-Spalte "Nicht zugeordnet" (seRuntime setzt das
         Attribut data-ff-nicht-zugeordnet) ist bewusst NEUTRAL grau — sie
         traegt keine Bedeutung aus dem Status-Vokabular, sondern ist der
         sichtbare Reparaturweg fuer Zeilen ohne Treffer. Nur vorhandene
         Grund-Tokens, keine neue Farbwelt; schlaegt die v-Klasse
         (drei einfache Selektoren gegen zwei). */
      :host([data-ff-nicht-zugeordnet]) .col {
        --col-strong: var(--se-muted);
        --col-soft: var(--se-bg);
        --col-shell: var(--se-panel);
        --col-line: var(--se-line);
      }
      .head {
        flex: none;
        display: flex;
        align-items: center;
        gap: var(--se-gap-sm);
        padding: 10px 12px;
        background: var(--col-soft);
        border-bottom: 1px solid var(--col-line);
      }
      .dot {
        flex: none;
        width: 9px;
        height: 9px;
        border-radius: var(--se-r-pill);
        background: var(--col-strong);
      }
      .title {
        color: var(--col-strong);
        font-size: var(--se-fs);
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .count {
        margin-left: auto;
        min-width: 22px;
        padding: 1px 8px;
        border-radius: var(--se-r-sm);
        background: var(--se-panel);
        border: 1px solid var(--col-line);
        text-align: center;
        font-family: var(--se-mono);
        font-size: var(--se-fs-sm);
        font-weight: 600;
        color: var(--col-strong);
      }
      /* K0: der Rumpf scrollt senkrecht (Empfang-Vorbild .vspalte-karten);
         min-height:0 erlaubt ihm, bei fester Board-Höhe kleiner zu werden
         als sein Inhalt — der Leer-Hinweis hält leere Spalten offen. */
      .body {
        padding: 10px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: var(--se-gap-sm);
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
      }
      slot { display: contents; }
    `,
  ]

  @property() variant: StatusVariant = 'info'
  @property() heading = 'Neue Spalte'

  // Kartenzähler: aus den geslotteten Kindern abgeleitet, nie gepflegt.
  @state() private _count = 0

  private onSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement
    this._count = slot
      .assignedElements()
      // Editor-Hilfen zählen nicht; <template> ebenso wenig (im Export
      // reist die Musterkarte als inertes template-Element mit, sie ist
      // keine sichtbare Karte).
      .filter((el) => !el.hasAttribute('data-ff-editor-helper') && el.tagName.toLowerCase() !== 'template')
      .length
  }

  render(): TemplateResult {
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
        <slot @slotchange=${this.onSlotChange}></slot>
      </div>
    </div>`
  }
}

BasicBlock.defineAndRegister(KanbanSpalteBlock)
