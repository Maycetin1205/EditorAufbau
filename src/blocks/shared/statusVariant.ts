import { css } from 'lit'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'

export type StatusVariant = 'info' | 'success' | 'warning' | 'danger'

export const STATUS_VARIANTS: readonly StatusVariant[] = [
  'info',
  'success',
  'warning',
  'danger',
]

export function coerceStatusVariant(value: string): StatusVariant {
  return (STATUS_VARIANTS as readonly string[]).includes(value)
    ? (value as StatusVariant)
    : 'info'
}

export const STATUS_BEDEUTUNGEN: readonly { wert: StatusVariant; name: string }[] = [
  { wert: 'info', name: 'Hinweis' },
  { wert: 'success', name: 'Erfolg' },
  { wert: 'warning', name: 'Warnung' },
  { wert: 'danger', name: 'Fehler' },
]

export function statusVariantProperty(
  attributeName: string,
  description: string,
): PropertyDescription {
  return {
    attributeName,
    name: 'Bedeutung',
    description,
    kind: 'select',

    options: STATUS_BEDEUTUNGEN.map((b) => ({ value: b.wert, label: b.name })),
  }
}

export const chipStyles = css`

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 11px 5px 9px;
    border-radius: var(--se-r-sm);

    clip-path: polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 0 100%);
    font-family: var(--se-font);
    font-size: var(--se-fs-sm);
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: 0.02em;
    color: var(--se-ink);
    background: var(--se-panel-2);
    white-space: nowrap;
  }

  .chip::before {
    content: '';
    flex: none;
    width: 6px;
    height: 6px;
    background: var(--chip-punkt, var(--se-faint));
  }
  .chip.v-info { background: var(--se-blue-soft); --chip-punkt: var(--se-blue); }
  .chip.v-success { background: var(--se-green-soft); --chip-punkt: var(--se-green); }
  .chip.v-warning { background: var(--se-amber-soft); --chip-punkt: var(--se-amber); }
  .chip.v-danger {
    background: var(--se-red);
    color: var(--se-panel);
    --chip-punkt: var(--se-panel);
  }
`
