// BildBlock (N5, Stufe 1)
// Ein statisches Bild in der Maske. Der Bauer waehlt im Editor eine Datei;
// sie reist als eingebetteter Daten-URI im `quelle`-Attribut mit — eine Maske
// bleibt damit EINE Datei, genau wie bei den Tierbildern der Karte. Der
// Baustein selbst laedt nie etwas nach und kennt keinen Dateidialog: das
// Auswaehlen und Verkleinern ist Editor-Arbeit (editor/inspector/controls/
// BildControl) und reist deshalb NICHT im Runtime-Buendel mit.
//
// GENAU EINE Eigenschaft — das Bild (Regel 10). Kein Zuschnitt-Regler, kein
// Alternativtext, kein Rahmen: der Auftrag der Welle U beginnt mit dem Befund
// „es gibt zig stellschrauben fuer jede einstellung", und ein neuer Baustein
// faengt deshalb bei einer an. Das Bild passt sich GANZ in seine Zelle ein
// (object-fit: contain) — nie beschnitten, nie verzerrt. Wer „fuellend und
// beschnitten" braucht, hat dann den echten zweiten Fall.
//
// Stufe 2 (Bilder aus SoftEngine-FELDERN) ist ausdruecklich SPAETER und erst
// mit Beleg (Regel 5: Feld-Art, Ablage und Abrufweg an einer echten Maske).
// Bis dahin ist der Baustein rein statisch und traegt keine bindbare Stelle —
// eine anklickbare Stelle, die nichts binden kann, waere eine Luege.
//
// Ohne gewaehltes Bild steht in der MASKE gar nichts (der Editor erfindet
// keine Daten, Regel 7). Nur im EDITOR liegt an der Stelle ein gestrichelter
// Platzhalter — sonst waere ein frisch abgelegter Baustein unsichtbar und
// nicht mehr anklickbar.
//
// Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*), keine Farb-Literale.

import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'

export class BildBlock extends BasicBlock {
  static readonly blockType = 'bild'
  static readonly tagName = 'ff-bild'
  static readonly displayName = 'Bild'
  static readonly category: BlockCategory = 'anzeige'
  static readonly defaultProps = { quelle: '' }
  // Raster-Startgroesse: ein handlicher Kasten, aus dem der Bauer zieht, was
  // er braucht. Beide Kanten sind ziehbar (kein lockedWidth) — bei einem Bild
  // ist das Format die halbe Miete.
  static readonly raster = { startW: 6, startH: 6, minW: 1, minH: 1 }

  static override readonly customProperties: PropertyDescription[] = [
    {
      attributeName: 'quelle',
      name: 'Bild',
      description: 'Die Bilddatei wird in die Maske eingebettet — die Maske bleibt EINE Datei. Grosse Bilder werden dabei still verkleinert.',
      kind: 'bild',
    },
  ]

  static override styles = [
    BasicBlock.styles,
    css`
      :host { display: block; }
      /* Die Flaeche fuellt die Zelle; das Bild passt sich ganz hinein und
         bleibt mittig, egal wie der Bauer zieht. */
      .flaeche {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
      /* Der Platzhalter ist eine EDITOR-Hilfe und traegt darum die
         data-ff-editor-Bedingung: in der Maske steht an einer leeren Stelle
         nichts. Gestrichelt und in der stillen Textfarbe wie jeder andere
         Leerzustand des Baukastens (shared/leerZustand) — hier aber ohne
         Pfote und ohne Satzbau: es ist kein Leerzustand der DATEN, sondern
         ein Bauplan, in dem noch nichts steht. */
      .platzhalter { display: none; }
      :host([data-ff-editor]) .platzhalter {
        display: grid;
        place-items: center;
        width: 100%;
        height: 100%;
        min-height: 48px;
        box-sizing: border-box;
        padding: var(--se-gap-sm);
        border: var(--se-border) dashed var(--se-line);
        border-radius: var(--se-r-md);
        color: var(--se-faint);
        font-family: var(--se-font);
        font-size: var(--se-fs-sm);
        text-align: center;
      }
    `,
  ]

  @property() quelle = ''

  override render(): TemplateResult {
    // Der Daten-URI wandert als Attribut ins Markup — Lit setzt ihn hier als
    // Property, der Export schreibt ihn aus den Props (bindingAttr-freie,
    // ganz normale Eigenschaft). Kein zweiter Weg.
    return html`<div class="flaeche">
      ${this.quelle === ''
        ? html`<div class="platzhalter">Bild</div>`
        : html`<img src=${this.quelle} alt="">`}
    </div>`
  }
}

BasicBlock.defineAndRegister(BildBlock)
