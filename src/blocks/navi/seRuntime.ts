import { SEITEN_WECHSEL_EVENT, type SeitenWechselDetail } from '../../core/blocks/seitenWechsel'
import { AnsichtBlock } from '../ansicht/AnsichtBlock'
import { NaviEintragBlock } from './NaviEintragBlock'

const AKTIV = 'aktiv'

function eintraegeVon(navi: Element): NaviEintragBlock[] {
  return Array.from(navi.querySelectorAll(NaviEintragBlock.tagName))
}

export function haltePunktAktiv(navi: Element, gewaehlt?: Element): void {
  const eintraege = eintraegeVon(navi)
  const ziel = gewaehlt ?? eintraege.find((e) => e.hasAttribute(AKTIV)) ?? eintraege[0]
  for (const e of eintraege) {
    if (e === ziel) e.setAttribute(AKTIV, '')
    else e.removeAttribute(AKTIV)
  }
}

export function zeigeBreite(navi: Element): void {
  const breit = navi.hasAttribute('offen')
  for (const e of eintraegeVon(navi)) e.toggleAttribute('breit', breit)
}

function nameVon(ansicht: Element): string {
  return ansicht.getAttribute('name') ?? String(AnsichtBlock.defaultProps.name)
}

function astVon(navi: Element, flaeche: Element): Element | null {
  let cur: Element | null = navi
  while (cur && cur.parentElement !== flaeche) cur = cur.parentElement
  return cur
}

export function schalteUm(navi: Element, ansichtsName: string): void {
  const doc = navi.ownerDocument
  const alle = Array.from(doc.querySelectorAll(AnsichtBlock.tagName))

  const flaeche = alle[0]?.parentElement ?? null
  if (!flaeche) return
  const eigenerAst = astVon(navi, flaeche)
  if (!eigenerAst) return
  const ziel = alle.find((a) => nameVon(a) === ansichtsName) ?? null
  for (const kind of Array.from(flaeche.children)) {
    if (kind === eigenerAst) continue
    const istAnsicht = alle.includes(kind as AnsichtBlock)
    const sichtbar = istAnsicht ? kind === ziel : ziel === null
    if (sichtbar) kind.removeAttribute('hidden')
    else kind.setAttribute('hidden', '')
  }
}

const horcher = new WeakMap<Element, (e: Event) => void>()

const gestartet = new WeakSet<Element>()

export function verbindeNavi(navi: Element): void {
  const auf = (e: Event): void => {
    const detail = (e as CustomEvent<SeitenWechselDetail>).detail
    if (!detail) return
    haltePunktAktiv(navi, e.target instanceof Element ? e.target : undefined)

    navi.removeAttribute('offen')
    zeigeBreite(navi)
    if (navi.hasAttribute('data-ff-editor')) return
    schalteUm(navi, detail.ansicht)
  }
  navi.addEventListener(SEITEN_WECHSEL_EVENT, auf)
  horcher.set(navi, auf)
}

export function trenneNavi(navi: Element): void {
  const auf = horcher.get(navi)
  if (!auf) return
  navi.removeEventListener(SEITEN_WECHSEL_EVENT, auf)
  horcher.delete(navi)
}

export function naviAktualisiert(navi: Element): void {
  haltePunktAktiv(navi)

  zeigeBreite(navi)
  if (navi.hasAttribute('data-ff-editor') || gestartet.has(navi)) return
  const erster = eintraegeVon(navi)[0]
  if (!erster) return
  gestartet.add(navi)

  const start = (): void => schalteUm(navi, erster.seitename)
  if (navi.ownerDocument.readyState === 'loading') {
    navi.ownerDocument.addEventListener('DOMContentLoaded', start, { once: true })
  } else {
    queueMicrotask(start)
  }
}
