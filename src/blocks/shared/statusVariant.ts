// statusVariant
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

// Technikwert -> Klarname. DIE eine Liste: der Inspector-Select unten und die
// Status-Zuordnung der Tabellenspalte (blocks/tabelle/spaltenArten) lesen
// beide von hier. Zwei Listen hiessen: an einer Stelle heisst es „Fehler", an
// der anderen „Notfall", und niemand faende den Unterschied.
export const STATUS_BEDEUTUNGEN: readonly { wert: StatusVariant; name: string }[] = [
  { wert: 'info', name: 'Hinweis' },
  { wert: 'success', name: 'Erfolg' },
  { wert: 'warning', name: 'Warnung' },
  { wert: 'danger', name: 'Fehler' },
]

// Die Status-Property fuer den Inspector. Der Bediener waehlt weiterhin die
// Bedeutung per Klarname; die feste Farbe ergibt sich daraus.
export function statusVariantProperty(
  attributeName: string,
  description: string,
): PropertyDescription {
  return {
    attributeName,
    name: 'Farbe',
    description,    kind: 'select',
    // Aus DERSELBEN Liste wie die Status-Zuordnung der Tabellenspalte.
    options: STATUS_BEDEUTUNGEN.map((b) => ({ value: b.wert, label: b.name })),
  }
}

// Chip-Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*). Strukturelle
// Groessen (padding, letter-spacing, font-weight, Schnitttiefe) als Literale
// wie bei Button/Infobox; Farben + Radius + font-size kommen aus Tokens.
//
// Das ist die SIGNATUR der Designsprache (Fellnase Regel 5, uebernommen
// 2026-08-06): oben rechts ein 45deg-Schnitt wie an einer abgelegten
// Karteikarte, links ein QUADRATISCHER Punkt. Der Punkt traegt die
// Statusfarbe, die Schrift bleibt Espresso — bei aehnlichen Toenen
// (Sonne/Karamell) ist der Status sonst nur zu erraten. Bis 2026-08-06 war
// der Chip eine Pille mit farbiger Schrift und ohne Punkt.
//
// Notfall ist der einzige Vollton: in dieser Sprache gehoert der laute Ton
// dem Notfall allein (Regel 2), darum Flaeche in der Hausfarbe statt
// getoentem Hauch.
export const chipStyles = css`
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 9px 3px 7px;
    border-radius: var(--se-r-sm);
    /* der 45deg-Schnitt oben rechts — 6px tief */
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%);
    font-family: var(--se-font);
    font-size: var(--se-fs-xs);
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--se-ink);
    background: var(--se-panel-2);
    white-space: nowrap;
  }
  /* der quadratische Punkt: bewusst OHNE border-radius */
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
