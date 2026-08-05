// DialogRahmen — der Rahmen eines Fensters IN der laufenden Maske:
// Abdunklung, zentriertes Fenster, Kopfzeile mit Titel und Schliessen-Kreuz,
// optionale Werkzeugzeile darunter, scrollender Inhalt.
//
// Warum ein eigener Baustein-loser Rahmen: das Nachschlage-Fenster ist kein
// Baustein — der Bauer zieht es nicht auf die Flaeche, es entsteht erst,
// wenn der Bediener die Lupe klickt. Ein Baustein waere hier falsch (er
// muesste im Baum liegen, exportiert und positioniert werden).
//
// Der PopupBlock hat heute noch seinen eigenen, fast gleichen Rahmen. Die
// Zusammenlegung ist vorgesehen, aber bewusst NICHT Teil des Nachschlagens
// (2026-08-05): Popup ist ein funktionierender Seiten-Baustein, ein Umbau
// aendert seine Export-Bytes und braucht einen eigenen SE-Echttest. Wer sie
// zusammenlegt, nimmt DIESE Datei als Ziel — nicht umgekehrt.
//
// Aussehen ausschliesslich aus Masken-Tokens (--se-*), wie in jedem
// Baustein; strukturelle Groessen als Literale.

import { css, html, LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'

export const DIALOG_RAHMEN_TAG = 'ff-dialog-rahmen'
export const DIALOG_SCHLIESSEN_EVENT = 'ff-dialog-schliessen'

// „Flaeche minus Rand" — dieselbe Rolle wie POPUP_RAND im PopupBlock: das
// Fenster darf nie bis an die Kante der Maske stossen.
export const DIALOG_RAND = 24

// Groessen koennen als Attribut-Strings ankommen — defensiv wandeln.
function pixel(wert: unknown, ersatz: number): number {
  const zahl = Number(wert)
  return Number.isFinite(zahl) && zahl > 0 ? zahl : ersatz
}

export class DialogRahmen extends LitElement {
  static override styles = css`
    :host {
      position: absolute;
      inset: 0;
      display: block;
      font-family: var(--se-font);
      font-size: var(--se-fs);
      color: var(--se-ink);
    }
    /* Ueber der GANZEN Maske statt nur im Elternkasten: das Nachschlage-
       Fenster haengt an einem Formularfeld, das irgendwo in einer Karte
       sitzt — ohne fixed waere es in deren Ausschnitt eingesperrt. */
    :host([viewport]) {
      position: fixed;
      z-index: 2147483646;
    }
    .abdunklung,
    .buehne {
      position: absolute;
      inset: 0;
    }
    .abdunklung { background: var(--se-scrim); }
    .buehne {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .fenster {
      position: relative;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      max-width: calc(100% - ${DIALOG_RAND}px);
      max-height: calc(100% - ${DIALOG_RAND}px);
      overflow: hidden;
      background: var(--se-panel);
      border: 1px solid var(--se-line);
      border-radius: var(--se-r-lg);
      box-shadow: var(--se-shadow-popup);
    }
    .kopf {
      flex: none;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 6px 6px 12px;
      background: var(--se-panel-2);
      border-bottom: 1px solid var(--se-line-soft);
    }
    .titel {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      color: var(--se-ink);
      font-size: var(--se-fs);
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .schliessen {
      flex: none;
      display: grid;
      place-items: center;
      width: 24px;
      height: 24px;
      padding: 0;
      border: none;
      border-radius: var(--se-r-sm);
      background: none;
      color: var(--se-muted);
      font: inherit;
      font-size: 15px;
      line-height: 1;
      cursor: pointer;
    }
    .schliessen:hover {
      background: var(--se-line-soft);
      color: var(--se-ink);
    }
    .werkzeug {
      display: none;
      flex: none;
      padding: 7px 10px;
      border-bottom: 1px solid var(--se-line-soft);
      background: var(--se-panel-2);
    }
    :host([mit-werkzeug]) .werkzeug { display: block; }
    .inhalt {
      flex: 1 1 auto;
      min-height: 0;
      overflow: auto;
    }
  `

  @property() titel = 'Dialog'
  @property({ type: Number }) breite = 520
  @property({ type: Number }) hoehe = 380
  @property({ type: Boolean, reflect: true }) viewport = false
  @property({ type: Boolean, reflect: true, attribute: 'mit-werkzeug' }) mitWerkzeug = false
  @property({ type: Boolean, attribute: 'escape-schliesst' }) escapeSchliesst = false

  private escapeRegistriert = false

  // Escape in der capture-Phase und mit stopPropagation: dieselbe Schichtung
  // wie im Editor-Panel — das oberste offene Fenster verbraucht die Taste,
  // damit sie nicht zugleich eine Ebene darunter etwas schliesst.
  private readonly aufTaste = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') return
    event.stopPropagation()
    this.schliesse()
  }

  private aktualisiereEscape(): void {
    const sollRegistriert = this.isConnected && this.escapeSchliesst
    if (sollRegistriert === this.escapeRegistriert) return
    if (sollRegistriert) document.addEventListener('keydown', this.aufTaste, true)
    else document.removeEventListener('keydown', this.aufTaste, true)
    this.escapeRegistriert = sollRegistriert
  }

  private schliesse(): void {
    this.dispatchEvent(new CustomEvent(DIALOG_SCHLIESSEN_EVENT, {
      bubbles: true,
      composed: true,
    }))
  }

  override connectedCallback(): void {
    super.connectedCallback()
    this.aktualisiereEscape()
  }

  protected override updated(geaendert: PropertyValues<this>): void {
    if (geaendert.has('escapeSchliesst')) this.aktualisiereEscape()
  }

  override disconnectedCallback(): void {
    if (this.escapeRegistriert) {
      document.removeEventListener('keydown', this.aufTaste, true)
      this.escapeRegistriert = false
    }
    super.disconnectedCallback()
  }

  override render(): TemplateResult {
    const breite = pixel(this.breite, 520)
    const hoehe = pixel(this.hoehe, 380)
    return html`
      <div class="abdunklung"></div>
      <div class="buehne">
        <section
          class="fenster"
          role="dialog"
          aria-modal="true"
          style="width:${breite}px;height:${hoehe}px"
        >
          <header class="kopf">
            <div class="titel"><slot name="titel">${this.titel}</slot></div>
            <button
              class="schliessen"
              type="button"
              aria-label="Schließen"
              title="Schließen"
              @click=${this.schliesse}
            >✕</button>
          </header>
          <div class="werkzeug"><slot name="werkzeug"></slot></div>
          <div class="inhalt"><slot></slot></div>
        </section>
      </div>
    `
  }
}

if (!customElements.get(DIALOG_RAHMEN_TAG)) {
  customElements.define(DIALOG_RAHMEN_TAG, DialogRahmen)
}
