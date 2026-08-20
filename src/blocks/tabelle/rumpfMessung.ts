import { zeilenmass, type Zeilenmass } from './seitengroesse'

export interface MessZiel {
  hasAttribute(name: string): boolean
  renderRoot: { querySelector(auswahl: string): Element | null }
}

export function gemessenesMass(ziel: MessZiel, takt: number): Zeilenmass | null {
  if (!ziel.hasAttribute('fuellt')) return null
  const rumpf = ziel.renderRoot.querySelector('.koerper')
  if (!(rumpf instanceof HTMLElement)) return null
  // Abgezogen wird ALLES im Rumpf, was keine Datenzeile ist: die Kopfzeile
  // und die Erfassungszeile. Fehlt eine davon, ist sie schlicht 0 hoch.
  //
  // Die Erfassungszeile fehlte hier bis 2026-08-20, und mit Kopfzeile fiel das
  // nicht auf: der Kopf war genauso hoch und hat den Platz zufaellig
  // freigehalten. Schlank nimmt den Kopf weg — und damit passte genau eine
  // Zeile zu viel in den Rumpf, die Tabelle bekam einen Scrollbalken, egal wie
  // gross man sie zog (Nutzer-Befund 2026-08-20).
  const hoeheVon = (auswahl: string): number => {
    const el = ziel.renderRoot.querySelector(auswahl)
    return el instanceof HTMLElement ? el.offsetHeight : 0
  }
  return zeilenmass(rumpf.clientHeight, hoeheVon('.kopf') + hoeheVon('.zeile.erfassung'), takt)
}

export function beobachteRumpf(ziel: MessZiel, beiAenderung: () => void): ResizeObserver | null {
  if (typeof ResizeObserver === 'undefined') return null
  const rumpf = ziel.renderRoot.querySelector('.koerper')
  if (!rumpf) return null
  const beobachter = new ResizeObserver(beiAenderung)
  beobachter.observe(rumpf)
  return beobachter
}
