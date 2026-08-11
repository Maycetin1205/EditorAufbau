// PopupBlock (P-A, Nutzer-Entscheidungen 2026-07-16)
// Eine SEITE der Maske: zentriertes Fenster auf abgedunkelter Fläche.
// Der Knoten liegt als Kind der Wurzel im Baum (pageBlock in der Registry) —
// Persistenz, Undo, Export-Sammlung und Preflight laufen dadurch generisch
// mit, ohne Schema-Änderung. Die Hauptseite rendert ihn NIE (Editor.
// childNodesOf filtert Seiten-Bausteine); sichtbar wird er über seinen
// Seiten-Reiter im Editor bzw. — ab P-B — über den Ketten-Schritt
// „Popup öffnen" in der Maske.
//
// Entscheidungen: eingebautes X oben rechts (schließt in der MASKE immer;
// im Editor ist es nur Optik), Klick auf die Abdunklung tut NICHTS
// (ERP-üblich, kein Datenverlust), IMMER zentriert; Größe (breite/hoehe)
// zieht der Editor am Anfasser der Popup-Seite. Der Fenster-Titel ist der
// Klarname der Seite (name-Prop) und wird per Doppelklick direkt am Kopf
// umbenannt (Bedienung am Ding).
//
// Eine Render-Quelle (Regel 1): Abdunklung + Fenster + Kopf + X kommen aus
// DIESEM Baustein — der Editor-Reiter zeigt exakt das Export-Popup
// (data-ff-editor erzwingt nur die Sichtbarkeit). Aussehen ausschließlich
// aus Masken-Tokens; strukturelle Größen als Literale wie überall.

import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import { ROOT_TYPE } from '../../core/blocks/BlockData'

// Größen kommen im Export als Attribut-Strings an — defensiv wandeln.
function px(v: unknown, fallback: number): number {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

// Die Fenster-Grenze „Fläche minus Rand": gilt WÖRTLICH gleich in der Maske
// (max-width/height unten) und am Editor-Anfasser (PopupSeite) — EINE
// Konstante statt zweier 24er (P-C 2026-07-17, WYSIWYG-Drift-Gefahr).
export const POPUP_RAND = 24

export class PopupBlock extends BasicBlock {
  static readonly blockType = 'popup'
  static readonly tagName = 'ff-popup'
  static readonly displayName = 'Popup'
  static readonly category: BlockCategory = 'layout'
  static readonly acceptsChildren = true
  // Seiten entstehen NUR über den „+ Popup"-Reiter, nie aus der Bibliothek;
  // sie leben ausschließlich direkt unter der Wurzel (kein Popup im Popup).
  static readonly showInPalette = false
  static readonly allowedParentTypes = [ROOT_TYPE]
  static readonly pageBlock = true
  // Größe läuft über breite/hoehe (eigene Props, reisen als Attribute) —
  // die generischen width/height-Anfasser des BlockHost bleiben aus.
  static readonly resizableWidth = false
  static readonly containerHint = false
  static readonly defaultProps = {
    name: 'Popup',
    breite: 520,
    hoehe: 380,
  }

  static override styles = [
    BasicBlock.styles,
    css`
      /* Geschlossen = restlos unsichtbar (Export-Zustand bis P-B öffnet).
         Der Editor-Seitenreiter erzwingt die Sicht über data-ff-editor. */
      :host { display: none; }
      :host([offen]),
      :host([data-ff-editor]) {
        display: block;
        position: absolute;
        inset: 0;
        z-index: 10;
        font-family: var(--se-font);
      }
      /* Klick auf die Abdunklung tut NICHTS (Nutzer-Entscheidung) —
         deshalb bewusst kein Handler. */
      .abdunklung {
        position: absolute;
        inset: 0;
        background: var(--se-scrim);
      }
      /* Flex statt Grid (Fix 2026-07-16): bei Grid wächst die auto-Spur mit
         dem Fenster, und max-width: calc(100% - 24px) rechnet gegen die
         GEWACHSENE Spur — auf zu kleiner Fläche ragte das Fenster hinaus
         und wirkte zugleich um genau 24px verkleinert (Editor vs. Export).
         Im Flex-Container rechnet die Grenze gegen die echte Fläche. */
      .buehne {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .fenster {
        position: relative;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        max-width: calc(100% - ${POPUP_RAND}px);
        max-height: calc(100% - ${POPUP_RAND}px);
        background: var(--se-panel);
        border: var(--se-border) solid var(--se-line);
        border-radius: var(--se-r-lg);
        overflow: hidden;
        /* Flach (Fellnase Regel 4): was das Popup abhebt, ist die
           Abdunklung dahinter (--se-scrim) und die 1,5px-Kante — kein
           Schatten. Bis 2026-08-06 lag hier die staerkste von drei
           Schatten-Stufen. */
      }
      .kopf {
        flex: none;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 6px 6px 12px;
        background: var(--se-panel-2);
        border-bottom: var(--se-border) solid var(--se-line-soft);
      }
      .titel {
        /* Der Titel nimmt die ganze Kopfbreite (bis zum X) ein, nicht nur
           seinen Text: ein LEER getippter Name hat sonst null Pixel Flaeche,
           und die Stelle laesst sich per Doppelklick nie wieder beschreiben
           (Nutzer-Meldung 2026-08-11). min-height aus demselben Grund — ein
           leerer span hat auch keine Zeilenhoehe. Optisch aendert sich nichts:
           der Text sitzt weiter links, das X rechts. */
        flex: 1;
        min-height: 1.4em;
        font-weight: 600;
        /* Schmuck-Schrift NUR am Namen eines Kastens (Fellnase: .tafel-titel),
           nie im Fliesstext — sonst verliert sie ihre Wirkung. */
        font-family: var(--se-font-schmuck);
        font-size: var(--se-fs-lg);
        color: var(--se-ink);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .x {
        margin-left: auto;
        flex: none;
        display: grid;
        place-items: center;
        width: 24px;
        height: 24px;
        border: none;
        border-radius: var(--se-r-sm);
        background: none;
        color: var(--se-muted);
        font-size: 15px;
        line-height: 1;
        cursor: pointer;
      }
      .x:hover {
        background: var(--se-line-soft);
        color: var(--se-ink);
      }
      /* Der Rumpf fließt wie die Hauptseite: Spalte, linksbündig. */
      .rumpf {
        flex: 1;
        min-height: 0;
        overflow: auto;
        padding: 12px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
      .rumpf slot { display: contents; }
    `,
  ]

  @property() name = 'Popup'
  @property() breite: number | string = 520
  @property() hoehe: number | string = 380

  // X schließt NUR in der Maske (ab P-B öffnet dort der Ketten-Schritt);
  // im Editor ist das X reine Optik — die Seite verlässt man über die Reiter.
  private onClose(): void {
    if (this.hasAttribute('data-ff-editor')) return
    this.removeAttribute('offen')
  }

  override render(): TemplateResult {
    const b = px(this.breite, 520)
    const h = px(this.hoehe, 380)
    return html`<div class="abdunklung"></div>
      <div class="buehne">
        <div class="fenster" style="width:${b}px;height:${h}px">
          <div class="kopf">
            <span
              class="titel"
              data-ff-editable
              @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'name')}
            >${this.name}</span>
            <button class="x" type="button" aria-label="Schließen" title="Schließen" @click=${this.onClose}>✕</button>
          </div>
          <div class="rumpf"><slot></slot></div>
        </div>
      </div>`
  }
}

BasicBlock.defineAndRegister(PopupBlock)
