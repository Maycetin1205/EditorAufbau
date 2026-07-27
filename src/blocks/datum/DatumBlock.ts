// DatumBlock — der TAGESWAEHLER der Maske.
//
// Er bestimmt, WELCHEN TAG die Maske zeigt. Kanban und Tabelle zeigen
// daraufhin nur die Saetze dieses Tages (ihre Einstellung „Tag filtern
// nach"). Belegt an der echten Empfang-Maske (behandlung-umbau/empfang):
//   Z. 2780: dateInput geaendert -> SELECTED_DATE -> alles neu gezeichnet
//   Z. 1728: Board zeigt nur Termine mit datum === SELECTED_DATE
//
// KEINE Eigenschaften (Regel 10, Nutzer-Entscheidung 2026-07-27): keine
// Datenquelle, keine Feldbindung, kein Umschalter. Bis zu diesem Tag war
// der Baustein dreierlei zugleich — Uhr, Anzeigefeld UND halber Waehler —
// und sah entsprechend nach nichts aus. Die mitlaufende Uhr ist ersatzlos
// gestrichen; ein Datum aus einem Datensatz zeigt das Formularfeld mit
// Feldtyp „Datum".
//
// Aufbau 1:1 aus der Referenz-Kopfzeile (Z. 1305-1309 + CSS Z. 362-366):
// EIN gerahmter Riegel traegt ‹ | Datumsfeld | ›, daneben steht „Heute"
// als eigener Knopf. Die Pfeile und das Feld sind IM Riegel rahmenlos —
// deshalb wirkt er als ein Bedienelement statt als drei lose Teile.

import { css, html, type TemplateResult } from 'lit'
import { state } from 'lit/decorators.js'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { BasicBlock } from '../base/BasicBlock'
import { heuteSchluessel, tagPlus } from '../shared/datumSchluessel'
import { gewaehlterTag, setzeGewaehltenTag } from '../shared/gewaehlterTag'

export class DatumBlock extends BasicBlock {
  static readonly blockType = 'datum'
  static readonly tagName = 'ff-datum'
  static readonly displayName = 'Datum'
  static readonly category: BlockCategory = 'anzeige'
  static readonly defaultProps = {}
  static override readonly customProperties: PropertyDescription[] = []

  // Raster-Startgroesse. Der Waehler braucht als Ganzes rund 260px
  // (Riegel 190 + Abstand + „Heute"). minW ist bewusst grosszuegig: wird er
  // schmaler gezogen, quetscht Flexbox zuerst das Datumsfeld — genau der
  // Fehler der ersten Fassung (gemessene 8px Feldbreite, Nutzer 2026-07-27).
  // Gegen das Quetschen steht zusaetzlich die Mindestbreite im CSS.
  // Im Browser nachgemessen (2026-07-27). Start bei 9 Spalten (253px):
  // Datumsfeld, beide Pfeile und „Heute" nebeneinander. Die Untergrenze ist
  // bewusst klein (5 Spalten ~137px) — dort hat sich „Heute" weggeblendet
  // und nur noch ‹ Datum › steht da. Hoehe 2 Zeilen = 32px, die
  // natuerliche Hoehe des Riegels.
  static readonly raster = { startW: 9, startH: 2, minW: 5, minH: 2 }

  static styles = [
    BasicBlock.styles,
    css`
      /* EINE Hoehe fuer Riegel und „Heute" — vorher liefen sie mit 36px und
         30px auseinander und standen sichtbar nicht auf einer Linie. */
      .waehler {
        --tag-h: 34px;
        /* Mindestbreite des Datumsfelds. Der Browser rendert im Datumsfeld
           TT.MM.JJJJ plus sein eigenes Kalender-Symbol; darunter bricht die
           Anzeige um oder verschwindet. Referenz .vinput-date: 128px — hier
           knapper, damit der Baustein sich schmaler ziehen laesst. */
        --tag-feld-min: 112px;
        display: flex;
        align-items: stretch;
        gap: var(--se-gap-sm);
        height: var(--tag-h);
        font-family: var(--se-font);
      }
      /* Der gerahmte Riegel (.vdaynav): EIN Rahmen um Pfeil, Feld, Pfeil —
         dadurch wirkt der Waehler als ein Bedienelement, nicht als drei
         lose Teile. Er FUELLT die Breite des Bausteins: sonst steht der
         Baustein schmal in einer breiten Zelle und der Auswahlrahmen des
         Editors ist sichtbar breiter als das Ding darin (Nutzer 2026-07-27). */
      .riegel {
        box-sizing: border-box;
        display: flex;
        align-items: stretch;
        flex: 1;
        min-width: 0;
        height: 100%;
        padding: 2px;
        border: 1px solid var(--se-line);
        border-radius: var(--se-r-sm);
        background: var(--se-panel);
      }
      /* Pfeile: im Riegel rahmenlos und quadratisch (.vdaynav .vbtn-icon). */
      .pfeil {
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        padding: 0;
        border: none;
        border-radius: var(--se-r-sm);
        background: transparent;
        color: var(--se-muted);
        font-family: var(--se-font);
        font-size: var(--se-fs-lg);
        line-height: 1;
        cursor: pointer;
      }
      .pfeil:hover { background: var(--se-panel-2); color: var(--se-ink); }
      /* Das Datumsfeld traegt im Riegel keinen eigenen Rahmen und steht
         mittig + halbfett (.vinput-date) — es ist die Hauptaussage. */
      .feld {
        box-sizing: border-box;
        /* Waechst mit dem Riegel, faellt aber NIE unter die Mindestbreite —
           genau das fehlte in der ersten Fassung (gemessene 8px). */
        flex: 1;
        min-width: var(--tag-feld-min);
        border: none;
        background: transparent;
        padding: 0 2px;
        font-family: var(--se-font);
        font-size: var(--se-fs);
        font-weight: 600;
        color: var(--se-ink);
        text-align: center;
      }
      .feld:focus { outline: none; }
      /* „Heute" steht NEBEN dem Riegel und ist ein normaler Knopf (.vbtn),
         gleich hoch wie der Riegel. */
      .heute {
        box-sizing: border-box;
        flex: none;
        height: 100%;
        padding: 0 9px;
        border: 1px solid var(--se-line);
        border-radius: var(--se-r-sm);
        background: var(--se-panel);
        color: var(--se-ink);
        font-family: var(--se-font);
        font-size: var(--se-fs-sm);
        font-weight: 550;
        white-space: nowrap;
        cursor: pointer;
      }
      .heute:hover { border-color: var(--se-accent); color: var(--se-accent); }
      /* Schmal gezogen raeumt der Waehler selbst auf, statt sich zu
         verstuemmeln: zuerst geht „Heute" (die Pfeile leisten dasselbe,
         nur langsamer), dann rueckt das Datumsfeld enger zusammen. Ohne
         das waere der Baustein nie unter ~240px zu bekommen (Nutzer
         2026-07-27). Container-Abfragen sind hier ungefaehrlich: kennt sie
         ein alter Browser nicht, ueberspringt er den Block und der Waehler
         bleibt schlicht in seiner breiten Form — nichts bricht. */
      :host { container-type: inline-size; }
      @container (max-width: 210px) {
        .heute { display: none; }
      }
      @container (max-width: 160px) {
        .waehler { --tag-feld-min: 80px; }
      }
      /* Im Editor wird gestaltet, nicht bedient (Regel 7): der Waehler zeigt
         dort den heutigen Tag, nimmt aber keine Eingabe an. */
      :host([data-ff-editor]) .feld,
      :host([data-ff-editor]) .pfeil,
      :host([data-ff-editor]) .heute { pointer-events: none; }
      /* Rasterflaeche: hoeher gezogen waechst der Waehler MIT (wie das
         Eingabefeld beim Formularfeld) — vorher wuchs nur die Zelle und der
         Baustein blieb klein darin stehen (Nutzer 2026-07-27). */
      :host([fuellt]) .waehler { height: 100%; }
    `,
  ]

  // Spiegel des geteilten Werts (shared/gewaehlterTag). Die Wahrheit liegt
  // dort — zwei Waehler in einer Maske zeigen dadurch immer denselben Tag.
  @state() private tag = ''

  private setzeTag(neu: string): void {
    setzeGewaehltenTag(neu)
    this.tag = gewaehlterTag()
  }

  render(): TemplateResult {
    return html`<div class="waehler">
      <div class="riegel">
        <button class="pfeil" title="Vortag" @click=${() => this.setzeTag(tagPlus(this.tag, -1))}>‹</button>
        <input
          class="feld"
          type="date"
          .value=${this.tag}
          @change=${(e: Event) => this.setzeTag((e.target as HTMLInputElement).value)}
        />
        <button class="pfeil" title="Folgetag" @click=${() => this.setzeTag(tagPlus(this.tag, 1))}>›</button>
      </div>
      <button class="heute" @click=${() => this.setzeTag(heuteSchluessel(new Date()))}>Heute</button>
    </div>`
  }

  connectedCallback(): void {
    super.connectedCallback()
    // Startwert ist der heutige Tag (Referenz: SELECTED_DATE = todayKey()).
    // Ein schon gesetzter Tag gewinnt, damit zwei Waehler in derselben Maske
    // nicht gegeneinander arbeiten. Im EDITOR wird nur angezeigt, nie gesetzt.
    this.tag = gewaehlterTag() || heuteSchluessel(new Date())
    if (!this.hasAttribute('data-ff-editor')) this.setzeTag(this.tag)
  }
}

BasicBlock.defineAndRegister(DatumBlock)
