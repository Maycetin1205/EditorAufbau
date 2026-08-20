import { zeilenmass, type Zeilenmass } from './seitengroesse'

export interface MessZiel {
  hasAttribute(name: string): boolean
  renderRoot: { querySelector(auswahl: string): Element | null }
}

export function gemessenesMass(ziel: MessZiel, takt: number): Zeilenmass | null {
  if (!ziel.hasAttribute('fuellt')) return null
  const rumpf = ziel.renderRoot.querySelector('.koerper')
  if (!(rumpf instanceof HTMLElement)) return null
  // Abgezogen wird die KOPFZEILE — und nur sie. Fehlt sie, ist sie 0 hoch.
  //
  // Die tippbaren Zeilen zieht `tabelleAnsicht` ueber `belegt` von der
  // Zeilenzahl ab. Sie hier NOCH einmal abzuziehen war ein doppelter Abzug: es
  // blieb unten genau eine Zeilenhoehe Platz uebrig — das leere Band ohne
  // Linien am Boden (Nutzer-Befund 2026-08-20: „es gibt eine leere letzte
  // Zeile OHNE Linien oder sonst was"). Beide Abzuege kamen am selben Tag und
  // wollten denselben Scrollbalken verhindern; einer davon reicht.
  //
  // `passen` heisst damit: wie viele Zeilen ausser dem Kopf in den Rumpf
  // gehen, die tippbaren eingeschlossen.
  const hoeheVon = (auswahl: string): number => {
    const el = ziel.renderRoot.querySelector(auswahl)
    return el instanceof HTMLElement ? el.offsetHeight : 0
  }
  return zeilenmass(rumpf.clientHeight, hoeheVon('.kopf'), takt)
}

export function beobachteRumpf(ziel: MessZiel, beiAenderung: () => void): ResizeObserver | null {
  if (typeof ResizeObserver === 'undefined') return null
  const rumpf = ziel.renderRoot.querySelector('.koerper')
  if (!rumpf) return null
  const beobachter = new ResizeObserver(beiAenderung)
  beobachter.observe(rumpf)
  return beobachter
}
