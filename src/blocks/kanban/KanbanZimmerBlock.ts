// KanbanZimmerBlock (N4)
// Eine Untergruppe INNERHALB einer Kanban-Spalte — im Vorbild sind es die
// Behandlungszimmer, daher der Name. Sie erscheint nicht in der Bibliothek:
// Zimmer entstehen ueber „+ Zimmer" an der Spalte (dieselbe Bauart wie
// „+ Spalte" am Board und „+ Eintrag" an der Navi).
//
// Zwei Sortierebenen, EIN Modell (N4, Nutzer-Wunsch 2026-08-12: „ich will ja
// entscheiden welche zimmer, und OB ich welche will"):
//   Board.statusField  -> welche SPALTE   (Vergleich mit dem Spaltentitel)
//   Spalte.zimmerField -> welches ZIMMER  (Vergleich mit dem Zimmertitel)
// Der TITEL IST DER DATENWERT — dieselbe bewusste Ausnahme von Regel 3, die
// die Spalte seit 2026-07-14 traegt (KanbanSpalteBlock: „zweimal dasselbe
// eintippen war Unsinn"). Eine Ebene tiefer eine ANDERE Bedienung zu
// verlangen waere genau das Gegenteil von „nichts Neues zu lernen".
//
// Zimmer sind OPTIONAL und stehen nie von selbst da: eine Spalte ohne Zimmer
// verhaelt sich exakt wie vor N4 (Karten liegen direkt in ihrem Rumpf). Eine
// Spalte darf beides zugleich tragen — die Musterkarte des Boards liegt
// weiterhin dort, wo der Bauer sie hingelegt hat.
//
// Ein Drop auf ein Zimmer loest AUSSCHLIESSLICH die sichtbare Aktionskette
// „Karte verschoben" aus, jetzt zusaetzlich mit {ZIMMER} = Titel des
// Ziel-Zimmers (./seRuntime). Einen eingebauten Schreibweg gibt es
// unveraendert nicht — die feste Zusage aus CLAUDE.md gilt.
//
// Aussehen abgeschrieben aus dem Optik-Vorbild
// (designsprache/mix-fellnase-empfang.html:110-131, `.zimmer-kopf`):
// versal, 700/12px, gesperrt, in der milden Textfarbe. Die Demo-Namen loesen
// 1:1 auf Masken-Tokens auf (--espresso-mild -> --se-muted,
// --schrift-werk -> --se-font, 12px -> --se-fs-sm). Keine Farb-Literale.
//
// Der LEERZUSTAND ist der geteilte aus N3 (shared/leerZustand: gestrichelter
// Rahmen, Pfote, ein Satz) und NICHT das schlichtere `.zimmer-frei` des
// Vorbilds. Grund steht in leerZustand.ts selbst: es gibt bewusst nur die
// zwei Formen, die die Demo zeigt — eine dritte waere ein zweites Aussehen
// fuer dieselbe Aussage. Der Satz dagegen kommt woertlich aus dem Vorbild.

import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { FlowDirection, FlowWidth } from '../../core/blocks/flowLayout'
import { CardBlock } from '../card/CardBlock'
import { leerStil, leerZustand } from '../shared/leerZustand'
import { kartenAbstandStil } from './kartenAbstand'

// Was in einem Zimmer steht, das leer ausgegangen ist. Woertlich aus dem
// Optik-Vorbild (`.zimmer-frei`: „frei · Patient hierher ziehen") — ohne das
// „Patient", weil der Baukasten nicht weiss, was in der Maske liegt.
//
// Bewusst KEINE einstellbare Eigenschaft (Regel 10): der Satz einer leeren
// SPALTE haengt am Board, weil er eine Sprachregelung der ganzen Maske ist —
// je Zimmer denselben Satz einzutippen waere dieselbe Sorte Unsinn, die die
// Spalte 2026-07-14 losgeworden ist. Wird er einstellbar gebraucht, ist das
// eine eigene kleine Entscheidung.
export const ZIMMER_LEER_TEXT = 'frei · hierher ziehen'

// Meldung an die Spalte, dass sich der Inhalt dieses Zimmers geaendert hat.
// Die Spalte zaehlt KARTEN, auch die in Zimmern — und `slotchange` kommt dort
// nie an: es bubbelt nur innerhalb des Schattenbaums, in dem der Slot liegt,
// und ueberquert keine Schattengrenze (composed: false). Deshalb meldet das
// Zimmer selbst, composed und bubbelnd, an seinem Host.
export const ZIMMER_INHALT_EVENT = 'ff-zimmer-inhalt'

export class KanbanZimmerBlock extends BasicBlock {
  static readonly blockType = 'kanban-zimmer'
  static readonly tagName = 'ff-kanban-zimmer'
  static readonly displayName = 'Kanban-Zimmer'
  static readonly category: BlockCategory = 'anzeige'
  static readonly acceptsChildren = true
  static readonly allowedChildTypes: string[] = [CardBlock.blockType]
  static readonly childDirection: FlowDirection = 'column'
  static readonly showInPalette = false
  static readonly containerHint = false
  // Gegenrichtung zu allowedChildTypes der Spalte; als Literal, weil ein
  // Import von KanbanSpalteBlock einen Import-Zyklus ergaebe (die Spalte
  // importiert dieses Modul) — dasselbe Muster wie bei Spalte und Karte.
  static readonly allowedParentTypes = ['kanban-spalte']
  // Wie Spalte und Karte: keine einstellbare Breite, ein Zimmer ist immer so
  // breit wie seine Spalte.
  static readonly lockedWidth: FlowWidth = 'fill'
  static readonly resizableWidth = false
  static readonly defaultProps = {
    heading: 'Neues Zimmer',
  }

  static override styles = [
    BasicBlock.styles,
    leerStil,
    kartenAbstandStil,
    css`
      :host { display: block; }
      /* Vorbild .zimmer-kopf: versal und gesperrt, damit er sich vom
         Kartentext absetzt, ohne eine zweite Flaeche zu brauchen. Die
         Strukturmasse (Abstaende, letter-spacing) bleiben Literale wie in
         der Demo, Farbe und Schrift kommen aus Tokens. */
      .kopf {
        padding: 2px 2px 0;
        font-family: var(--se-font);
        font-size: var(--se-fs-sm);
        font-weight: 700;
        line-height: 1.3;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--se-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      /* Der Rumpf traegt die Karten. Sein Abstand zum Kopf ist der
         24px-Vorschub der ersten Karte (kartenAbstand) — genau wie in der
         Spalte, wo ihn die Unterkante des Spaltenkopfs setzt. */
      .body {
        display: flex;
        flex-direction: column;
        align-items: stretch;
      }
    `,
  ]

  @property() heading = 'Neues Zimmer'

  // Der Leerzustand-Satz DIESES Zimmers — gesetzt von der Board-Laufzeit
  // (./seRuntime), sobald sie die Zeilen verteilt hat. Leer = kein
  // Leerzustand. Dieselbe Bauart und derselbe Grund wie bei der Spalte: nur
  // das Board weiss, ob ueberhaupt eine Datenquelle haengt, und im EDITOR ist
  // ein leeres Zimmer ein Bauplan, kein Leerzustand.
  // attribute:false: ein Laufzeitwert, der nie in den Export gehoert.
  @property({ attribute: false }) leerHinweis = ''

  // Meldet der Spalte jede Inhaltsaenderung (s. ZIMMER_INHALT_EVENT). OB der
  // Leerzustand erscheint, entscheidet diese Stelle bewusst NICHT — das tut
  // allein die Laufzeit ueber `leerHinweis`, genau wie bei der Spalte. Zwei
  // Stellen, die dasselbe beantworten, waeren zwei Wahrheiten.
  private onSlotChange(): void {
    this.dispatchEvent(new CustomEvent(ZIMMER_INHALT_EVENT, {
      bubbles: true,
      composed: true,
    }))
  }

  override render(): TemplateResult {
    return html`<div class="zimmer">
      <div
        class="kopf"
        data-ff-editable
        @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'heading')}
      >${this.heading}</div>
      <div class="body">
        <slot @slotchange=${this.onSlotChange}></slot>
        ${leerZustand(this.leerHinweis)}
      </div>
    </div>`
  }
}

BasicBlock.defineAndRegister(KanbanZimmerBlock)
