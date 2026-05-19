// Echte WYSIWYG-Komponente: Canvas und Export verwenden denselben <ff-button>.
import { LitElement, css, html } from 'lit'
import type { ButtonVariant } from './button.schema'

export class FfButton extends LitElement {
  static properties = {
    label: { type: String },
    variant: { type: String },
    disabled: { type: Boolean, reflect: true },
    actionId: { type: String, attribute: 'action-id' },
  }

  static styles = css`
    :host {
      display: inline-block;
      font-family:
        Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
        sans-serif;
    }

    button {
      min-height: 38px;
      padding: 0 16px;
      border: 1px solid transparent;
      border-radius: 6px;
      font: inherit;
      font-size: 14px;
      font-weight: 650;
      cursor: pointer;
      transition:
        background-color 120ms ease,
        border-color 120ms ease,
        color 120ms ease,
        box-shadow 120ms ease;
    }

    button.primary {
      background: #364fc7;
      color: #ffffff;
    }

    button.secondary {
      background: #ffffff;
      border-color: #c9ced8;
      color: #1f2937;
    }

    button.quiet {
      background: transparent;
      color: #364fc7;
    }

    button:not(:disabled):hover {
      box-shadow: 0 4px 12px rgb(15 23 42 / 14%);
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }
  `

  declare label: string
  declare variant: ButtonVariant
  declare disabled: boolean
  declare actionId: string

  constructor() {
    super()
    this.label = 'Button'
    this.variant = 'primary'
    this.disabled = false
    this.actionId = ''
  }

  private handleClick = () => {
    if (this.disabled) return

    // Die Web Component meldet nur ein Event; der Editor entscheidet, was passiert.
    this.dispatchEvent(
      new CustomEvent('ff-action', {
        detail: {
          actionId: this.actionId,
          label: this.label,
        },
        bubbles: true,
        composed: true,
      }),
    )
  }

  render() {
    return html`
      <button
        class=${this.variant}
        ?disabled=${this.disabled}
        @click=${this.handleClick}
      >
        ${this.label}
      </button>
    `
  }
}

if (!customElements.get('ff-button')) {
  customElements.define('ff-button', FfButton)
}

declare global {
  interface HTMLElementTagNameMap {
    'ff-button': FfButton
  }
}
