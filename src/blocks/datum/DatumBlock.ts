// DatumBlock — kompakte Anzeige für das echte aktuelle Datum bzw. die Uhrzeit.
//
// Ungebunden kommt der Wert aus der Browser-Uhr, nie aus erfundenen
// Beispieldaten. Gebunden nutzt der Block denselben source/valueField/value-
// Vertrag und dieselbe Export-Runtime wie das Formularfeld; im Editor zeigt
// BlockHost dafür generisch den Klarnamen des Felds.

import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { BindableSpotsFor, BindingRouteFor } from '../../core/blocks/BlockDefinition'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { BasicBlock } from '../base/BasicBlock'
import { connectField, disconnectField } from '../formfeld/feldRuntime'
import { currentDateDisplay } from './datumWert'

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

  static override readonly customProperties: PropertyDescription[] = [
    {
      attributeName: 'zeigt',
      name: 'Zeigt',
      description: 'Welche Zeitangabe ohne Datenbindung angezeigt wird.',
      isArray: false,
      maxLength: 0,
      kind: 'select',
      options: [
        { value: 'date', label: 'Datum' },
        { value: 'time', label: 'Zeit' },
        { value: 'datetime', label: 'Datum + Zeit' },
      ],
    },
    {
      attributeName: 'valueField',
      name: 'Feld',
      description: 'Feld der angeschlossenen Datenquelle, dessen Wert angezeigt wird.',
      isArray: false,
      maxLength: 0,
      kind: 'field',
      hiddenInInspector: true,
    },
  ]

  static styles = [
    BasicBlock.styles,
    css`
      .datum {
        color: var(--se-muted);
        font-family: var(--se-mono);
        font-size: var(--se-fs-sm);
        white-space: nowrap;
      }
    `,
  ]

  @property() zeigt = 'date'
  @property() source = ''
  @property() value = ''
  @property() valueField = ''

  render(): TemplateResult {
    const display = this.valueField === ''
      ? currentDateDisplay(this.zeigt, new Date())
      : this.value
    return html`<span
      class="datum"
      data-ff-spot="value"
      ?data-ff-bound=${this.valueField !== ''}
    >${display}</span>`
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
