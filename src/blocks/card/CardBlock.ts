import { html, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { BindableSpotsFor, BindingProp } from '../../core/blocks/BlockDefinition'
import type { FlowWidth } from '../../core/blocks/flowLayout'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import {
  chipStyles,
  coerceStatusVariant,
  statusVariantProperty,
  type StatusVariant,
} from '../shared/statusVariant'
import { tierIcon } from '../shared/tierIcon'
import { kartenStil } from './kartenStil'

type TextSpotProp = 'heading' | 'heading2' | 'time' | 'date' | 'meta' | 'text'

export class CardBlock extends BasicBlock {
  static readonly blockType = 'card'
  static readonly tagName = 'ff-card'
  static readonly displayName = 'Karte'
  static readonly category: BlockCategory = 'anzeige'

  static readonly allowedParentTypes = ['kanban-spalte', 'kanban-zimmer']
  static readonly showInPalette = false

  static readonly lockedWidth: FlowWidth = 'fill'
  static readonly resizableWidth = false

  static readonly defaultProps = {
    chipVariant: 'info',
    heading: '',
    heading2: '',
    time: '',
    date: '',
    avatar: '',
    meta: '',
    text: '',
    chipText: '',

    headingField: '',
    heading2Field: '',
    timeField: '',
    dateField: '',
    avatarField: '',
    metaField: '',
    textField: '',
    chipTextField: '',
  }

  static readonly bindableSpots: BindableSpotsFor<typeof CardBlock.defaultProps> = [
    { prop: 'time', label: 'Zeit' },
    { prop: 'date', label: 'Datum' },
    { prop: 'avatar', label: 'Avatar' },
    { prop: 'heading', label: 'Titel' },
    { prop: 'heading2', label: 'Titel 2' },
    { prop: 'meta', label: 'Unterzeile' },
    { prop: 'text', label: 'Textzeile' },
    { prop: 'chipText', label: 'Chip' },
  ]

  static override readonly customProperties: PropertyDescription[] = [
    statusVariantProperty(
      'chipVariant',
      'Bedeutung des Chips auf der Karte — bestimmt die Chip-Farbe.',
    ),
  ]

  static override styles = [BasicBlock.styles, chipStyles, kartenStil]

  @property() chipVariant: StatusVariant = 'info'
  @property() heading = ''
  @property() heading2 = ''
  @property() time = ''
  @property() date = ''
  @property() avatar = ''
  @property() meta = ''
  @property() text = ''
  @property() chipText = ''
  @property() headingField = ''
  @property() heading2Field = ''
  @property() timeField = ''
  @property() dateField = ''
  @property() avatarField = ''
  @property() metaField = ''
  @property() textField = ''
  @property() chipTextField = ''

  private stelle(prop: TextSpotProp, klass: string): TemplateResult {
    return html`<span
      class=${klass}
      data-ff-editable
      data-ff-spot=${prop}
      ?data-ff-bound=${this[`${prop}Field` satisfies BindingProp<TextSpotProp>] !== ''}
      @dblclick=${(e: MouseEvent) => this.inlineEdit(e, prop)}
    >${this[prop]}</span>`
  }

  private hatReiter(): boolean {
    return this.hasAttribute('data-ff-editor') || this.date.trim() !== '' || this.time.trim() !== ''
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed)
    this.toggleAttribute('hat-reiter', this.hatReiter())
  }

  override render(): TemplateResult {
    const v = coerceStatusVariant(this.chipVariant)

    const editor = this.hasAttribute('data-ff-editor')
    const zeigt = (wert: string) => editor || wert.trim() !== ''

    const reiter = this.hatReiter()
    const kopf = zeigt(this.avatar) || zeigt(this.heading) || zeigt(this.meta)
    const fuss = zeigt(this.heading2) || zeigt(this.chipText)
    return html`<div class="card v-${v}${reiter ? '' : ' ohne-reiter'}">
      ${reiter
        ? html`<span class="reiter">
            ${zeigt(this.date) ? this.stelle('date', 'datum') : nothing}
            ${zeigt(this.time) ? this.stelle('time', 'zeit') : nothing}
          </span>`
        : nothing}
      ${kopf
        ? html`<div class="kopf">
            ${zeigt(this.avatar)
              ? html`<span
                  class="avatar"
                  data-ff-spot="avatar"
                  ?data-ff-bound=${this.avatarField !== ''}
                >${this.avatar.trim() === '' ? nothing : tierIcon(this.avatar)}</span>`
              : nothing}
            <div class="namen">
              ${zeigt(this.heading) ? this.stelle('heading', 'name') : nothing}
              ${zeigt(this.meta) ? this.stelle('meta', 'zusatz') : nothing}
            </div>
          </div>`
        : nothing}
      ${zeigt(this.text) ? this.stelle('text', 'grund') : nothing}
      ${fuss
        ? html`<div class="fuss">
            ${zeigt(this.heading2) ? this.stelle('heading2', 'fussl') : nothing}
            ${zeigt(this.chipText)
              ? html`<span
                  class="chip v-${v}"
                  data-ff-editable
                  data-ff-spot="chipText"
                  ?data-ff-bound=${this.chipTextField !== ''}
                  @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'chipText')}
                >${this.chipText}</span>`
              : nothing}
          </div>`
        : nothing}
    </div>`
  }
}

BasicBlock.defineAndRegister(CardBlock)
