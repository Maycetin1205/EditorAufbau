// DatumBlock — kompakte Anzeige für das echte aktuelle Datum bzw. die Uhrzeit.
//
// Ungebunden kommt der Wert aus der Browser-Uhr, nie aus erfundenen
// Beispieldaten. Gebunden nutzt der Block denselben source/valueField/value-
// Vertrag und dieselbe Export-Runtime wie das Formularfeld; im Editor zeigt
// BlockHost dafür generisch den Klarnamen des Felds.

import { css, html, nothing, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { BindableSpotsFor, BindingRouteFor } from '../../core/blocks/BlockDefinition'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { BasicBlock } from '../base/BasicBlock'
import { connectField, disconnectField } from '../formfeld/feldRuntime'
import { datumAnzeige } from './datumWert'

export class DatumBlock extends BasicBlock {
  static readonly blockType = 'datum'
  static readonly tagName = 'ff-datum'
  static readonly displayName = 'Datum'
  static readonly category: BlockCategory = 'anzeige'
  static readonly acceptsDataSource = true
  // Typgeprüft gegen die eigenen defaultProps (Bindungs-Konvention, A5).
  static readonly bindingRoute: BindingRouteFor<typeof DatumBlock.defaultProps> = { fieldProp: 'valueField' }
  static readonly bindableSpots: BindableSpotsFor<typeof DatumBlock.defaultProps> = [{ prop: 'value', label: 'Wert' }]
  static readonly defaultProps = {
    zeigt: 'date',
    source: '',
    value: '',
    valueField: '',
  }

  // Raster-Startgröße auf der Maskenfläche (im Browser gemessen 2026-07-23:
  // Haupt- + Nebenzeile ~36px). Feste Zeilen (je 12px) → 3 Zellen = 52px, damit
  // beide Zeilen hineinpassen.
  static readonly raster = { startW: 4, startH: 3, minW: 2, minH: 2 }

  static override readonly customProperties: PropertyDescription[] = [
    {
      attributeName: 'zeigt',
      name: 'Zeigt',
      description: 'Welche Zeitangabe ohne Datenbindung angezeigt wird.',      kind: 'select',
      options: [
        { value: 'date', label: 'Datum' },
        { value: 'time', label: 'Zeit' },
        { value: 'datetime', label: 'Datum + Zeit' },
      ],
    },
    {
      attributeName: 'valueField',
      name: 'Feld',
      description: 'Feld der angeschlossenen Datenquelle, dessen Wert angezeigt wird.',      kind: 'field',
      hiddenInInspector: true,
    },
  ]

  // Optik nach dem Empfang-Vorbild .vuhr (chef-maske, Nutzer 2026-07-21
  // — „wie Windows 98" war die alte kleine Mono-Zeile): grosse Hauptzeile
  // (Zeit bzw. Wert, mono/halbfett), kleines gedaempftes Datum darunter,
  // KEIN Kasten. Pixelgroessen sind Literale wie in der Referenz (17/11.5).
  static styles = [
    BasicBlock.styles,
    css`
      .vuhr {
        display: flex;
        flex-direction: column;
        line-height: 1.25;
      }
      .haupt {
        color: var(--se-ink);
        font-family: var(--se-mono);
        font-size: 17px;
        font-weight: 600;
        white-space: nowrap;
      }
      .neben {
        color: var(--se-muted);
        font-family: var(--se-font);
        font-size: 11.5px;
        white-space: nowrap;
      }
    `,
  ]

  @property() zeigt = 'date'
  @property() source = ''
  @property() value = ''
  @property() valueField = ''

  render(): TemplateResult {
    // Gebunden zeigt die Hauptzeile den Feldwert (eine Zeile); die
    // Spot-Markierung bleibt wie zuvor auf der Hauptzeile (Feld-Picker).
    const anzeige = this.valueField === ''
      ? datumAnzeige(this.zeigt, new Date())
      : { haupt: this.value }
    return html`<div class="vuhr">
      <span
        class="haupt"
        data-ff-spot="value"
        ?data-ff-bound=${this.valueField !== ''}
      >${anzeige.haupt}</span>
      ${anzeige.neben ? html`<span class="neben">${anzeige.neben}</span>` : nothing}
    </div>`
  }

  connectedCallback(): void {
    super.connectedCallback()
    connectField(this)
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
    disconnectField(this)
  }
}

BasicBlock.defineAndRegister(DatumBlock)
