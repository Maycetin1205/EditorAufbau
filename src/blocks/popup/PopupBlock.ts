// PopupBlock (P-A, Nutzer-Entscheidungen 2026-07-16)
// Eine SEITE der Maske: zentriertes Fenster auf abgedunkelter Fläche.
// Der Knoten liegt als Kind der Wurzel im Baum (pageBlock in der Registry) —
// Persistenz, Undo, Export-Sammlung und Preflight laufen dadurch generisch
// mit, ohne Schema-Änderung. Die Hauptseite rendert ihn NIE (Editor.
// childNodesOf filtert Seiten-Bausteine); sichtbar wird er über seinen
// Seiten-Reiter im Editor bzw. über den Ketten-Schritt „Popup öffnen" in
// der Maske.
//
// Entscheidungen: eingebautes X oben rechts, Klick auf die Abdunklung tut
// NICHTS (ERP-üblich, kein Datenverlust), IMMER zentriert; Größe
// (breite/hoehe) zieht der Editor am Anfasser der Popup-Seite. Der
// Fenster-Titel ist der Klarname der Seite (name-Prop) und wird per
// Doppelklick direkt am Kopf umbenannt (Bedienung am Ding).
//
// Seit C1 (2026-08-11) baut das Popup seinen Rahmen nicht mehr selbst:
// Abdunklung, Fenster, Kopf und X kommen aus dem geteilten DialogRahmen
// (shared/DialogRahmen) — dieselbe Form wie das Nachschlage-Fenster, eine
// Stelle für beide. Hier bleibt nur, was das Popup ausmacht: der
// Seiten-Zustand (offen/zu), der editierbare Titel und der Rumpf — seit C2
// (2026-08-16) eine echte Rasterflaeche wie die Maskenwurzel.
//
// Vertrag des Dialogkopf-X (C1): in der MASKE schließt es dieses Popup; im
// EDITOR tut der Baustein nichts (er kennt den Editor nicht, Regel 2) und
// lässt das Schließen-Ereignis weiter steigen — die Popup-Seitenansicht
// (editor/canvas/PopupSeite) wechselt darauf zur Hauptseite. Löschen tut
// das X NIE.
//
// Eine Render-Quelle (Regel 1): der Editor-Reiter zeigt exakt das
// Export-Popup (data-ff-editor erzwingt nur die Sichtbarkeit). Aussehen
// ausschließlich aus Masken-Tokens; strukturelle Größen als Literale.

import { css, html, unsafeCSS, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import { ROOT_TYPE } from '../../core/blocks/BlockData'
import { rasterFlaecheCss } from '../../core/blocks/rasterLayout'
// Definiert das Element ff-dialog-rahmen (Side-Effect-Import). Das
// Schließen-Ereignis steht unten als Literal im Template — Lit erlaubt im
// @-Binding keinen dynamischen Namen; der Name ist DIALOG_SCHLIESSEN_EVENT
// aus derselben Datei.
import '../shared/DialogRahmen'

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
      /* Geschlossen = restlos unsichtbar (Export-Zustand, bis der
         Ketten-Schritt öffnet). Der Editor-Seitenreiter erzwingt die Sicht
         über data-ff-editor. */
      :host { display: none; }
      :host([offen]),
      :host([data-ff-editor]) {
        display: block;
        position: absolute;
        inset: 0;
        z-index: 10;
        font-family: var(--se-font);
      }
      /* Der Titel im Kopf des DialogRahmens: als geslottetes Kind gehört er
         DIESEM Schatten, der Rahmen gibt ihm nur den Platz (flex:1) und die
         Schrift (erbt). display:block + min-height, damit ein LEER
         getippter Name die volle Kopfbreite als Doppelklick-Fläche behält —
         ein leerer Inline-span hätte null Pixel und ließe sich nie wieder
         beschreiben (Nutzer-Meldung 2026-08-11). Nowrap/ellipsis müssen
         MIT auf den Block wandern: die Kürzung des Rahmens wirkt nur auf
         Inline-Inhalt. */
      .titel {
        display: block;
        min-height: 1.4em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      /* Der Rumpf IST eine Rasterflaeche — dasselbe Gitter wie die
         Maskenwurzel, aus DERSELBEN Quelle (rasterFlaecheCss, C2
         2026-08-16). Bis dahin war er eine Flex-Spalte: im Popup lag alles
         zwangsweise untereinander, und Nebeneinander ging nur ueber den
         Baustein „Zeile" (mit diesem Umbau gestrichen).
         Er ist der ALLEINIGE Scroll-Besitzer des Popup-Inhalts (der Rahmen
         steht auf inhalt-fest); height:100% füllt den Inhaltsbereich des
         Rahmens, damit overflow hier greift. */
      .rumpf {
        box-sizing: border-box;
        height: 100%;
        overflow: auto;
        padding: 12px;
        ${unsafeCSS(rasterFlaecheCss())};
      }
      /* display:contents am slot ist die Bedingung dafuer, dass die
         geslotteten Bausteine UNMITTELBAR Zellen des Rumpfs werden — mit
         einem eigenen Kasten dazwischen laege der ganze Inhalt in EINER
         Zelle. */
      .rumpf slot { display: contents; }
    `,
  ]

  @property() name = 'Popup'
  @property() breite: number | string = 520
  @property() hoehe: number | string = 380

  // X = Schließen-Ereignis des DialogRahmens. In der Maske schließt es das
  // Popup; im Editor tut der Baustein nichts und lässt das Ereignis steigen
  // (composed) — PopupSeite wechselt darauf zur Hauptseite, gelöscht wird nie.
  private onClose(): void {
    if (this.hasAttribute('data-ff-editor')) return
    this.removeAttribute('offen')
  }

  override render(): TemplateResult {
    // ohne-modal: keine Fokusbegrenzung vor C3.3, also kein aria-modal
    // (der Rahmen erklärt das). Größen wandelt der Rahmen selbst defensiv.
    return html`<ff-dialog-rahmen
        .breite=${this.breite}
        .hoehe=${this.hoehe}
        ohne-modal
        inhalt-fest
        @ff-dialog-schliessen=${this.onClose}
      >
        <span
          slot="titel"
          class="titel"
          data-ff-editable
          @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'name')}
        >${this.name}</span>
        <div class="rumpf"><slot></slot></div>
      </ff-dialog-rahmen>`
  }
}

BasicBlock.defineAndRegister(PopupBlock)
