import { css, html, nothing, type TemplateResult } from 'lit'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { pfoteIcon } from './pfote'

export const LEER_TEXT_STANDARD = 'Keine Datensätze.'

export function leerTextProperty(): PropertyDescription {
  return {
    attributeName: 'leerText',
    name: 'Text ohne Datensätze',
    description: 'Steht in der Maske dort, wo sonst die Zeilen stehen — wenn die Datenquelle keine liefert. Leer lassen: dann steht dort gar nichts.',
    kind: 'text',
    requiresDataSource: true,
  }
}

export function leerZustand(text: string, tafel = false): TemplateResult | typeof nothing {
  if (text.trim() === '') return nothing
  return html`<div class="leer${tafel ? ' leer--tafel' : ''}">
    ${pfoteIcon()}
    <span>${text}</span>
  </div>`
}

export const leerStil = css`
  .leer {
    display: grid;
    justify-items: center;
    gap: 7px;
    padding: 22px 14px 24px;
    border: var(--se-border) dashed var(--se-line);
    border-radius: var(--se-r-md);
    color: var(--se-muted);
    font-size: var(--se-fs);
    line-height: 1.4;
    text-align: center;
  }

  .leer svg {
    width: 22px;
    height: 22px;
    fill: var(--se-faint);
    transform: rotate(-12deg);
  }

  .leer--tafel {
    border: none;
    padding: 44px 20px 48px;
  }
`
