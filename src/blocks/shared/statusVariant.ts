// statusVariant (Kap. 4K.3)
// Geteiltes Status-Vokabular (Regel "Technikwert != Anzeigename": der
// Bediener waehlt den Klarnamen Hinweis/Erfolg/Warnung/Fehler, NIE die
// Farbe — die Farbe ergibt sich fest aus der Bedeutung ueber die
// Statusfarben-Tokens). Nutzer: die Karte (ff-card) und die Kanban-Spalte
// (Herkunft: docs/decisions/2026-07-14-kahlschlag-bausteine.md).
//  - StatusVariant/coerceStatusVariant: der unsichtbare Technikwert.
//  - statusVariantProperty: die "Art"-Select-Beschreibung fuer den Inspector.
//  - chipStyles: das Chip-Aussehen (.zb-chip im Zielbild
//    der Referenzmaske) fuer den Chip innerhalb von ff-card.

import { css } from 'lit'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'

// Technikwert (unsichtbar) — der Bediener waehlt den Klarnamen im Inspector.
export type StatusVariant = 'info' | 'success' | 'warning' | 'danger'

export const STATUS_VARIANTS: readonly StatusVariant[] = [
  'info',
  'success',
  'warning',
  'danger',
]

// Unbekannte/alte Werte fallen sicher auf 'info' zurueck (z. B. Altbestand
// aus localStorage) — kein Block rendert je eine undefinierte Klasse.
export function coerceStatusVariant(value: string): StatusVariant {
  return (STATUS_VARIANTS as readonly string[]).includes(value)
    ? (value as StatusVariant)
    : 'info'
}

// Die Status-Property fuer den Inspector. Der Bediener waehlt weiterhin die
// Bedeutung per Klarname; die feste Farbe ergibt sich daraus.
export function statusVariantProperty(
  attributeName: string,
  description: string,
): PropertyDescription {
  return {
    attributeName,
    name: 'Farbe',
    description,
    isArray: false,
    maxLength: 0,
    kind: 'select',
    options: [
      { value: 'info', label: 'Hinweis' },
      { value: 'success', label: 'Erfolg' },
      { value: 'warning', label: 'Warnung' },
      { value: 'danger', label: 'Fehler' },
    ],
  }
}

// Chip-Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*). Strukturelle
// Groessen (padding, letter-spacing, font-weight) als Literale wie bei
// Button/Infobox; Farben + Radius + font-size kommen aus Tokens.
// Verbindliches Zielbild: die Referenzmaske (.zb-chip).
export const chipStyles = css`
  .chip {
    display: inline-block;
    padding: 2px 8px;
    border-radius: var(--se-r-sm);
    font-family: var(--se-font);
    font-size: var(--se-fs-xs);
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .chip.v-info { background: var(--se-blue-soft); color: var(--se-blue); }
  .chip.v-success { background: var(--se-green-soft); color: var(--se-green); }
  .chip.v-warning { background: var(--se-amber-soft); color: var(--se-amber); }
  .chip.v-danger { background: var(--se-red-soft); color: var(--se-red); }
`
