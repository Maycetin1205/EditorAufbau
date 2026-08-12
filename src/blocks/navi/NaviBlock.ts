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
// Aussehen aus dem verbindlichen Optik-Vorbild
// (designsprache/mix-fellnase-empfang.html, .navi): Espresso-Leiste, warmes
// Elfenbein als Schrift. Ausschliesslich Masken-Tokens, keine Farb-Literale.

import { css, html, type TemplateResult } from 'lit'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { NaviEintragBlock } from './NaviEintragBlock'
import { naviAktualisiert, verbindeNavi, trenneNavi } from './seRuntime'

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
  // Raster-Startgroesse: eine schmale, hohe Leiste am linken Rand — die Form,
  // die das Vorbild zeigt (224 px von 24 Spalten ~ 5 Zellen).
  static readonly raster = { startW: 5, startH: 24, minW: 3, minH: 3 }

  static override styles = [
    BasicBlock.styles,
    css`
      :host { height: 100%; }
      .navi {
        box-sizing: border-box;
        height: 100%;
        background: var(--se-ink);
        color: var(--se-bg);
        display: flex;
        flex-direction: column;
        gap: var(--se-gap-sm);
        padding: 14px 10px;
        font-family: var(--se-font);
        overflow: auto;
      }
      .navi slot { display: contents; }
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

  override render(): TemplateResult {
    // slotchange statt fester Liste: Eintraege kommen und gehen (Editor,
    // Laufzeit) — die Hervorhebung muss danach wieder genau einmal sitzen.
    // Beim Laden der MASKE ist es ausserdem der erste Zeitpunkt, zu dem es
    // ueberhaupt Eintraege gibt (s. naviAktualisiert).
    return html`<div class="navi">
        <slot @slotchange=${() => naviAktualisiert(this)}></slot>
      </div>`
  }
}

BasicBlock.defineAndRegister(NaviBlock)
