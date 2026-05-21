// ButtonBlock
// Lit Web Component fuer den Button-Block.
// Reine View. Editor-State lebt im Editor als BlockData.
// Single Source of Truth: buttonTemplate(props) -> HTML-String. Lit-render
// und static exportHtml nutzen dieselbe Funktion (Regel: keine doppelte
// Canvas-/Export-Implementierung).

import { css, html, LitElement, type TemplateResult } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { registerBlockType } from '../../core/blocks/blockRegistry'
import { escapeHtml } from '../shared'

interface ButtonProps {
  label: string
  variant?: 'default' | 'primary' | 'ghost'
}

function buttonTemplate(props: Partial<ButtonProps>): string {
  const label = escapeHtml(props.label ?? 'Klick mich')
  const variant = props.variant ?? 'default'
  return `<button data-variant="${variant}">${label}</button>`
}

export class ButtonBlock extends LitElement {
  static styles = css`
    :host { display: block; width: 100%; height: 100%; }
    button {
      width: 100%; height: 100%; box-sizing: border-box;
      cursor: pointer; border-radius: 6px; border: 1px solid #cbd5e1;
      background: #f8fafc; color: #0f172a; font-size: 13px; font-weight: 500;
    }
    button[data-variant='primary'] { background: #2563eb; color: white; border-color: #1d4ed8; }
    button[data-variant='ghost'] { background: transparent; border-color: transparent; }
    button:hover { filter: brightness(0.97); }
  `

  private _label: string = 'Klick mich'
  private _variant: ButtonProps['variant'] = 'default'

  get label(): string { return this._label }
  set label(v: string) { const o = this._label; this._label = v; this.requestUpdate('label', o) }
  get variant(): ButtonProps['variant'] { return this._variant }
  set variant(v: ButtonProps['variant']) { const o = this._variant; this._variant = v; this.requestUpdate('variant', o) }

  render(): TemplateResult {
    return html`${unsafeHTML(buttonTemplate({ label: this._label, variant: this._variant }))}`
  }
}

if (!customElements.get('ff-button')) {
  customElements.define('ff-button', ButtonBlock)
}

registerBlockType({
  type: 'button',
  tagName: 'ff-button',
  displayName: 'Schaltflaeche',
  category: 'eingabe',
  defaultProps: { label: 'Klick mich', variant: 'default' },
  defaultLayout: { width: 140, height: 40 },
  customProperties: [
    { attributeName: 'label', name: 'Beschriftung', description: 'Text auf dem Button', isArray: false, maxLength: 80, kind: 'text' },
    {
      attributeName: 'variant', name: 'Variante', description: 'Optisches Schema',
      isArray: false, maxLength: 0, kind: 'select',
      options: [
        { value: 'default', label: 'Standard' },
        { value: 'primary', label: 'Primaer' },
        { value: 'ghost', label: 'Ghost' },
      ],
    },
  ],
  exportHtml: (props) => buttonTemplate(props as Partial<ButtonProps>),
})
