// NaviBlock (N2)
// Die Leiste, die zwischen den Seiten der Maske umschaltet: Hauptseite und
// Ansichten (N1). Ein ganz normaler Baustein aus der Bibliothek — der Bauer
// entscheidet je Maske, OB es eine Navi gibt und wo sie liegt.
//
// Bauart wie das Kanban-Board: die EINTRAEGE sind Kind-Bausteine
// (ff-navi-eintrag), angelegt ueber den bekannten „+"-Anstecker aus der
// Registry (addChildButton). Damit erben sie alles Generische geschenkt —
// Auswahl, Inspector, Umsortieren, Duplizieren, Persistenz — statt dass die
// Navi sich eine eigene Listen-Bedienung baut (Regel 2/10).
//
// Was sie NICHT hat (Nutzer-Vorgabe 2026-08-12): keine freien Links, keine
// externen Ziele, keinen eingebauten Bediener-Fuss, keine Marke, keine
// sonstigen festen Zonen. Wer so etwas will, baut es aus normalen
// Bausteinen daneben.
//
// Genau EIN Eintrag ist hervorgehoben. Wer, entscheidet der Klick
// (seRuntime); solange noch keiner geklickt wurde, ist es der erste — in
// beiden Welten, damit der Editor zeigt, was die Maske zeigt (Regel 1).
//
// Bauform seit N2.1 (drei Nutzer-Befunde am ersten Stand): sie ist eine
// LEISTE des Maskenrahmens, keine Rasterzelle — schmal, buendig an Rand,
// oben und unten, auf jeder Ansicht dieselbe (Faehigkeit `maskenRand`,
// core/blocks/maskenRand). Aufgeklappt legt sie sich UEBER die Flaeche und
// verschiebt keinen Baustein; der Platz fuer die schmale Form bleibt
// dauerhaft frei, damit sie nie etwas verdeckt.
//
// Aussehen und Masse abgeschrieben aus der echten empfang-Maske
// (docs/chef-maske/empfang/index.basis.source.html, `.vnav`): 72 px schmal,
// 224 px offen, Klapp-Knopf oben, Eintraege darunter. Die Farben kommen aus
// dem Optik-Vorbild (designsprache/mix-fellnase-empfang.html, .navi):
// Espresso-Leiste, warmes Elfenbein als Schrift — ausschliesslich
// Masken-Tokens, keine Farb-Literale.

import { css, html, type TemplateResult } from 'lit'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { ROOT_TYPE } from '../../core/blocks/BlockData'
import { RAND } from '../../core/blocks/maskenRand'
import { NaviEintragBlock } from './NaviEintragBlock'
import { naviAktualisiert, verbindeNavi, trenneNavi, zeigeBreite } from './seRuntime'

const EINTRAG = NaviEintragBlock.blockType

export class NaviBlock extends BasicBlock {
  static readonly blockType = 'navi'
  static readonly tagName = 'ff-navi'
  static readonly displayName = 'Navi'
  static readonly category: BlockCategory = 'layout'
  static readonly acceptsChildren = true
  static readonly allowedChildTypes = [EINTRAG]
  static readonly addChildButton = { label: 'Eintrag', childType: EINTRAG }
  static readonly containerHint = false
  static readonly defaultProps = {}
  static override readonly customProperties: PropertyDescription[] = []
  // Sie gehoert zum Maskenrahmen: Rand statt Zelle, und auf jeder Flaeche
  // dieselbe (N2.1). Wo das gelesen wird: core/blocks/maskenRand.
  static readonly maskenRand = true
  // ... und genau deshalb NUR direkt an der Wurzel. Beide Enden der
  // Rand-Mechanik setzen das voraus: der Editor holt Rand-Bausteine allein von
  // dort (Canvas/CanvasNode), und die Laufzeit laesst beim Umschalten genau
  // den Ast stehen, in dem die Navi liegt (navi/seRuntime). Lag sie IN einer
  // Ansicht, verschwaende sie in der Maske mit dieser Ansicht — sichtbar
  // wurde das erst in SoftEngine. Dieselbe Zusage wie bei Ansicht und Popup.
  static readonly allowedParentTypes = [ROOT_TYPE]
  // Raster-Startgroesse: nur noch fuer die Einfuege-Vorschau der Bibliothek —
  // liegt der Baustein, bestimmt der Rand seine Groesse, nicht die Zelle.
  static readonly raster = { startW: 5, startH: 24, minW: 3, minH: 3 }

  // Zum Stil unten, damit die Begruendung nicht in jeder Maske mitreist (jeder
  // Kommentar IM Stil wird exportiert): die BREITE gehoert dem Baustein, weil
  // sie am Auf-/Zuklappen haengt — der Rand (maskenRand) gibt nur die Lage vor.
  // Freigehalten wird von der Flaeche aber nur die SCHMALE Breite; die offene
  // Leiste legt sich darum ueber den Inhalt, statt ihn zu verschieben
  // (Nutzer-Befund N2.1-2). Masse: core/blocks/maskenRand.
  // AUFGEKLAPPT ist sie leicht durchscheinend (Nutzer-Ansage 2026-08-12): man
  // soll sehen, dass sie ueber der Maske liegt und nicht Teil von ihr ist.
  // color-mix statt eines eigenen Farbwerts, damit der Ton weiter aus dem
  // Token kommt (belegt lauffaehig: die echte empfang-Maske benutzt color-mix).
  static override styles = [
    BasicBlock.styles,
    css`
      :host {
        height: 100%;
        width: ${RAND.breite}px;
        transition: width var(--se-move);
      }
      :host([offen]) { width: ${RAND.breiteOffen}px; }
      .leiste {
        box-sizing: border-box;
        height: 100%;
        width: 100%;
        background: var(--se-ink);
        color: var(--se-bg);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-family: var(--se-font);
      }
      :host([offen]) .leiste {
        background: color-mix(in oklab, var(--se-ink) 88%, transparent);
      }
      /* Kopf mit dem Klapp-Knopf (Vorbild .vnav-kopf, ohne dessen Marke) */
      .kopf {
        flex: none;
        display: flex;
        align-items: center;
        padding: 8px;
      }
      .schalter {
        flex: none;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 4px;
        width: 40px;
        height: 32px;
        padding: 0 11px;
        border: none;
        border-radius: var(--se-r-md);
        background: none;
        color: inherit;
        cursor: pointer;
      }
      .schalter:hover { background: var(--se-muted); }
      .balken {
        height: 2px;
        background: currentColor;
      }
      .eintraege {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 6px 0;
        overflow-y: auto;
      }
      .eintraege slot { display: contents; }
    `,
  ]

  override connectedCallback(): void {
    super.connectedCallback()
    verbindeNavi(this)
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    trenneNavi(this)
  }

  // Auf- und zuklappen. Ein ZUSTAND, keine Eigenschaft: die Maske startet
  // schmal, und was der Bediener aufklappt, gehoert nicht in die Maskendatei
  // (dieselbe Linie wie das `offen` des Popups). Der Editor klappt mit —
  // sonst waere die offene Form nirgends zu sehen.
  private klappen(): void {
    this.toggleAttribute('offen')
    zeigeBreite(this)
  }

  override render(): TemplateResult {
    // slotchange statt fester Liste: Eintraege kommen und gehen (Editor,
    // Laufzeit) — die Hervorhebung muss danach wieder genau einmal sitzen.
    // Beim Laden der MASKE ist es ausserdem der erste Zeitpunkt, zu dem es
    // ueberhaupt Eintraege gibt (s. naviAktualisiert).
    return html`<div class="leiste">
        <div class="kopf">
          <button
            class="schalter"
            type="button"
            aria-label="Navi auf- und zuklappen"
            @click=${() => this.klappen()}
          >
            <span class="balken"></span>
            <span class="balken"></span>
            <span class="balken"></span>
          </button>
        </div>
        <div class="eintraege">
          <slot @slotchange=${() => naviAktualisiert(this)}></slot>
        </div>
      </div>`
  }
}

BasicBlock.defineAndRegister(NaviBlock)
