export const ZEILE_AKTIVIERT_EVENT = 'ff-zeile-aktiviert'

export interface ZeileAktiviertDetail {
  rohzeile: unknown

  rohIndex: number

  ansichtIndex: number
}

export const ROH_ATTR = 'data-ff-roh'

export function sendeZeileAktiviert(el: HTMLElement, detail: ZeileAktiviertDetail): void {
  el.dispatchEvent(new CustomEvent<ZeileAktiviertDetail>(ZEILE_AKTIVIERT_EVENT, {
    detail,
    bubbles: true,
    composed: true,
  }))
}

export function fokussierterRohIndex(wurzel: ShadowRoot | null): number | null | undefined {
  const aktiv = wurzel?.activeElement
  if (!(aktiv instanceof HTMLElement)) return undefined
  const zeile = aktiv.closest<HTMLElement>('.zeile')
  if (!zeile) return undefined
  const roh = zeile.getAttribute(ROH_ATTR)
  return roh === null || roh === '' ? null : Number(roh)
}

export function stelleZeilenFokusHer(wurzel: ShadowRoot | null, rohIndex: number | null): void {
  if (!wurzel) return
  const gesucht = rohIndex === null
    ? null
    : wurzel.querySelector<HTMLElement>(`.zeile[${ROH_ATTR}="${rohIndex}"]`)
  const ziel = gesucht
    ?? wurzel.querySelector<HTMLElement>(`.zeile[${ROH_ATTR}]`)
    ?? wurzel.querySelector<HTMLElement>('.koerper')
  ziel?.focus()
}
