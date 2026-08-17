import { zeilenmass, type Zeilenmass } from './seitengroesse'

export interface MessZiel {
  hasAttribute(name: string): boolean
  renderRoot: { querySelector(auswahl: string): Element | null }
}

export function gemessenesMass(ziel: MessZiel, takt: number): Zeilenmass | null {
  if (!ziel.hasAttribute('fuellt')) return null
  const rumpf = ziel.renderRoot.querySelector('.koerper')
  const kopf = ziel.renderRoot.querySelector('.kopf')
  if (!(rumpf instanceof HTMLElement) || !(kopf instanceof HTMLElement)) return null
  return zeilenmass(rumpf.clientHeight, kopf.offsetHeight, takt)
}

export function beobachteRumpf(ziel: MessZiel, beiAenderung: () => void): ResizeObserver | null {
  if (typeof ResizeObserver === 'undefined') return null
  const rumpf = ziel.renderRoot.querySelector('.koerper')
  if (!rumpf) return null
  const beobachter = new ResizeObserver(beiAenderung)
  beobachter.observe(rumpf)
  return beobachter
}
