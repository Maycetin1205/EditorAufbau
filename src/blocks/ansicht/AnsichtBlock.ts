// AnsichtBlock (N1)
// Eine zweite (dritte, …) HAUPTFLÄCHE derselben Maske: Empfang,
// Terminkalender, … Der Knoten liegt — wie das Popup — als Kind der Wurzel
// im Baum (pageBlock), Persistenz, Undo, Export und Preflight laufen dadurch
// generisch mit. Anders als das Popup ist er aber KEIN Fenster, sondern eine
// FLÄCHE: flaechenSeite in der Registry.
//
// Das Entscheidende steht in einer einzigen CSS-Zeile: `display: contents`.
// Die Ansicht bekommt damit gar keinen eigenen Kasten — ihre Kinder werden
// unmittelbar zu Rasterzellen der Maskenwurzel (.ff-root im Export, die
// Rasterfläche des Canvas im Editor). Es gibt also weiterhin GENAU EIN
// Raster, aus DERSELBEN Quelle (rasterFlaecheStyle), und keine zweite
// Rasterdefinition, die auseinanderlaufen könnte (Regel 1). Die Ansicht ist
// nichts als eine Klammer um die Bausteine, die zusammen sichtbar sind.
//
// Sichtbarkeit: eine Ansicht ist nie beim Öffnen der Maske dran — die
// Hauptseite hat den Start. Der Export gibt jeder Ansicht darum `hidden`
// mit; umgeschaltet wird später von der Navi (N2), die genau dieses Attribut
// setzt und nimmt. `hidden` muss hier ausdrücklich behandelt werden: die
// Regel [hidden]{display:none} des Browsers steht in seinem eigenen
// Stylesheet und verliert gegen jedes :host aus dem Baustein.
//
// Im EDITOR erscheint die Ansicht nicht als Baustein, sondern als Reiter in
// der Seiten-Leiste — genau wie die Hauptseite selbst, die auch kein
// anklickbarer Baustein ist. Sie hat nichts zu ziehen und nichts
// einzustellen: ihr Name wird am Reiter vergeben (Doppelklick).

import { css, html, type TemplateResult } from 'lit'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import { ROOT_TYPE } from '../../core/blocks/BlockData'

export class AnsichtBlock extends BasicBlock {
  static readonly blockType = 'ansicht'
  static readonly tagName = 'ff-ansicht'
  static readonly displayName = 'Ansicht'
  static readonly category: BlockCategory = 'layout'
  static readonly acceptsChildren = true
  // Ansichten entstehen NUR über die Seiten-Leiste, nie aus der Bibliothek;
  // sie leben ausschließlich direkt unter der Wurzel (keine Seite in einer
  // Seite — dieselbe Regel wie beim Popup, die topologie.ts beim Laden prüft).
  static readonly showInPalette = false
  static readonly allowedParentTypes = [ROOT_TYPE]
  static readonly pageBlock = true
  static readonly flaechenSeite = true
  // Die Ansicht selbst hat keine Größe (display:contents) — die generischen
  // Anfasser des BlockHost bleiben aus.
  static readonly resizableWidth = false
  static readonly containerHint = false
  static readonly defaultProps = {
    name: 'Ansicht',
  }

  static override styles = [
    BasicBlock.styles,
    // Nur zwei Regeln — und beide muessen sein. Warum, steht ausfuehrlich im
    // Dateikopf; hier bleibt es knapp, weil CSS-Kommentare eines Bausteins
    // Byte fuer Byte in JEDER exportierten Maske landen (Umlaute darin sogar
    // sechsfach, als \uXXXX).
    css`
      /* kein eigener Kasten: Kinder sind Zellen des Wurzel-Rasters */
      :host { display: contents; }
      /* schlaegt die UA-Regel [hidden]{display:none}, die gegen :host verliert */
      :host([hidden]) { display: none; }
    `,
  ]

  override render(): TemplateResult {
    // NUR der Slot, ohne Hülle: jedes zusätzliche Element hier bekäme wieder
    // einen Kasten und nähme den Kindern ihren Platz im Wurzel-Raster.
    return html`<slot></slot>`
  }
}

BasicBlock.defineAndRegister(AnsichtBlock)
