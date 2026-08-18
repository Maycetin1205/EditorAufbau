import { css } from 'lit'

// Beim Ziehen einer Karte hebt sich das Ziel hervor — Spalte wie Zimmer
// gleich. Der Stil greift auf der Flaeche, die die Klasse ZIEL_KLASSE
// traegt, sobald der Baustein `data-ff-ziel` gesetzt bekommt.
export const ZIEL_KLASSE = 'ziel'

export const zielStil = css`
  :host([data-ff-ziel]) .ziel {
    background: var(--se-accent-soft);
    outline: var(--se-border) solid var(--se-accent);
    outline-offset: calc(-1 * var(--se-border));
  }
`
