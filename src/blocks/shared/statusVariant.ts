// statusVariant
// Geteiltes Status-Vokabular (Regel "Technikwert != Anzeigename": der
// Bediener waehlt den Klarnamen Hinweis/Erfolg/Warnung/Fehler, NIE die
// Farbe — die Farbe ergibt sich fest aus der Bedeutung ueber die
// Statusfarben-Tokens).
//  - StatusVariant/coerceStatusVariant: der unsichtbare Technikwert.
//  - statusVariantProperty: die "Art"-Select-Beschreibung fuer den Inspector.
//    Nutzer: die Karte (ff-card) und die Kanban-Spalte.
//  - chipStyles: das Aussehen der Status-Marke. Nutzer: die Karte (ff-card)
//    und die Tabelle (ff-tabelle, Spaltenart "Status"); im Kanban tragen sie
//    die Karten IN den Spalten. DIE EINE Stelle: wer hier ein Mass aendert,
//    aendert die Marke in allen drei Bausteinen gleichzeitig — genau so ist
//    es gewollt, nachgebessert wird nie im einzelnen Baustein.

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
// Bedeutung per Klarname; die feste Farbe ergibt sich daraus. Genau darum
// heisst der Regler seit U6 (2026-08-12) „Bedeutung" und nicht mehr „Farbe":
// er versprach eine Wahl, die es hier nie gab — waehlbar sind
// Hinweis/Erfolg/Warnung/Fehler, die Farbe haengt fest daran.
export function statusVariantProperty(
  attributeName: string,
  description: string,
): PropertyDescription {
  return {
    attributeName,
    name: 'Bedeutung',
    description,
    kind: 'select',
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
  /* Masse Wert fuer Wert aus der Demo (atome.css .marke, --schnitt 7px), seit
     2026-08-07: bis dahin war die Marke rundum kleiner (10,5px, kein
     Zeilenmass, 3/9/3/7 Innenabstand, 5px Abstand, 6px Schnitt) und wirkte
     neben der Demo wie zusammengeschoben. Die 1,3 ist ihr eigenes Zeilenmass
     aus der Demo, nicht das der Maske — eine Marke ist eine Zeile Text in
     einer Flaeche, sie atmet nicht mit dem Fliesstext. */
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 11px 5px 9px;
    border-radius: var(--se-r-sm);
    /* der 45deg-Schnitt oben rechts — 7px tief */
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
