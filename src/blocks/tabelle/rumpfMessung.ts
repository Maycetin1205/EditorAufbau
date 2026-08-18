import { zeilenmass, type Zeilenmass } from './seitengroesse'

export interface MessZiel {
  hasAttribute(name: string): boolean
  renderRoot: { querySelector(auswahl: string): Element | null }
}

export function gemessenesMass(ziel: MessZiel, takt: number): Zeilenmass | null {
  if (!ziel.hasAttribute('fuellt')) return null
  const rumpf = ziel.renderRoot.querySelector('.koerper')
  if (!(rumpf instanceof HTMLElement)) return null
  // Ohne Kopfzeile (Schalter „Kopfzeile" aus) gehoert die ganze Hoehe den
  // Zeilen — der Kopf ist dann schlicht 0 hoch, keine Messluecke.
  const kopf = ziel.renderRoot.querySelector('.kopf')
  const kopfHoehe = kopf instanceof HTMLElement ? kopf.offsetHeight : 0
  return zeilenmass(rumpf.clientHeight, kopfHoehe, takt)
}

export function beobachteRumpf(ziel: MessZiel, beiAenderung: () => void): ResizeObserver | null {
  if (typeof ResizeObserver === 'undefined') return null
  const rumpf = ziel.renderRoot.querySelector('.koerper')
  if (!rumpf) return null
  const beobachter = new ResizeObserver(beiAenderung)
  beobachter.observe(rumpf)
  return beobachter
}
