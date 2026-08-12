// seRuntime — das Umschalten in der EXPORTIERTEN Maske.
//
// Die Ansichten (N1) fahren alle `hidden` aus. Ohne diese Datei nimmt das
// Attribut niemand je wieder weg — eine Ansicht waere in SoftEngine toter
// Inhalt. Hier steht der eine Weg, der es nimmt.
//
// Das Modell in einem Satz: die Maskenflaeche zeigt IMMER den Ast, in dem
// die Navi selbst liegt (die Leiste, Kopfzeilen, alles Feste), dazu GENAU
// EINE weitere Sache — entweder die gewaehlte Ansicht oder den Rest der
// Hauptseite.
//
// Adressiert wird ueber den KLARNAMEN der Ansicht, nicht ueber eine id:
// dasselbe Muster, mit dem ein Popup-Schritt sein Fenster findet
// (blocks/shared/seAktionen). Fehlendes name-Attribut = Standardname, denn
// der Export laesst Standardwerte weg. Jeder Zielname, den KEINE Ansicht
// traegt, meint die Hauptseite: ihr eigener („Hauptseite"), der leere und
// der einer geloeschten Ansicht.
//
// Laeuft NUR im Export: Editor-Elemente tragen data-ff-editor und melden
// sich hier nie an. Im Editor wechselt statt dessen die Arbeitsflaeche die
// offene Seite (Canvas hoert auf dasselbe Ereignis).

import { SEITEN_WECHSEL_EVENT, type SeitenWechselDetail } from '../../core/blocks/seitenWechsel'
import { AnsichtBlock } from '../ansicht/AnsichtBlock'
import { NaviEintragBlock } from './NaviEintragBlock'

const AKTIV = 'aktiv'

// Die Eintraege einer Navi in ihrer sichtbaren Reihenfolge.
function eintraegeVon(navi: Element): NaviEintragBlock[] {
  return Array.from(navi.querySelectorAll(NaviEintragBlock.tagName))
}

// Genau EIN Eintrag ist hervorgehoben. Ohne Wahl: der erste — im Editor wie
// in der Maske, damit beide dasselbe zeigen (Regel 1).
export function haltePunktAktiv(navi: Element, gewaehlt?: Element): void {
  const eintraege = eintraegeVon(navi)
  const ziel = gewaehlt ?? eintraege.find((e) => e.hasAttribute(AKTIV)) ?? eintraege[0]
  for (const e of eintraege) {
    if (e === ziel) e.setAttribute(AKTIV, '')
    else e.removeAttribute(AKTIV)
  }
}

function nameVon(ansicht: Element): string {
  // Fehlendes Attribut = Standardname (der Export laesst Standardwerte weg).
  return ansicht.getAttribute('name') ?? String(AnsichtBlock.defaultProps.name)
}

// Der sichtbare Ast: das direkte Kind der Maskenflaeche, in dem die Navi
// liegt. Er bleibt immer stehen — sonst blendete sich die Navi mit dem
// ersten Klick selbst weg. null = die Navi liegt gar nicht auf dieser
// Flaeche; dann wird nichts angefasst.
function astVon(navi: Element, flaeche: Element): Element | null {
  let cur: Element | null = navi
  while (cur && cur.parentElement !== flaeche) cur = cur.parentElement
  return cur
}

// Umschalten: die gesuchte Ansicht sichtbar, alle anderen und der Rest der
// Hauptseite verborgen. Findet keine Ansicht den Namen, ist die Hauptseite
// gemeint (leerer Name, oder eine geloeschte Ansicht).
export function schalteUm(navi: Element, ansichtsName: string): void {
  const doc = navi.ownerDocument
  const alle = Array.from(doc.querySelectorAll(AnsichtBlock.tagName))
  // Die Maskenflaeche ist der Elternteil der Ansichten — sie liegen immer
  // unmittelbar darauf (N1). Ohne Ansicht gibt es nichts umzuschalten; so
  // braucht diese Datei den Klassennamen der Flaeche nicht zu kennen.
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

// Ein geschlossenes Popup bleibt geschlossen, ein geoeffnetes bleibt offen:
// sein eigenes :host([offen]) schlaegt die hidden-Regel des Browsers. Die
// Navi muss darum nichts ueber Popups wissen.

const horcher = new WeakMap<Element, (e: Event) => void>()
// Welche Navi ihr Startbild schon gesetzt hat. Das darf genau EINMAL
// passieren — sonst spraenge die Maske bei jedem spaeteren slotchange
// zurueck auf den ersten Eintrag.
const gestartet = new WeakSet<Element>()

export function verbindeNavi(navi: Element): void {
  // Der Klick-Horcher haengt in BEIDEN Welten: die Hervorhebung soll auch im
  // Editor dem Klick folgen (sonst zeigte er dauerhaft den ersten Eintrag,
  // die Maske aber den geklickten — WYSIWYG-Bruch). Nur das UMBLENDEN ist
  // Sache der Maske; im Editor wechselt statt dessen die Arbeitsflaeche die
  // offene Seite (Canvas hoert auf dasselbe Ereignis).
  const auf = (e: Event): void => {
    const detail = (e as CustomEvent<SeitenWechselDetail>).detail
    if (!detail) return
    haltePunktAktiv(navi, e.target instanceof Element ? e.target : undefined)
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

// Nach jedem slotchange — und NICHT in connectedCallback: beim Laden der
// Maske meldet sich die Navi an, sobald ihr oeffnendes Tag gelesen ist. Ihre
// Eintraege gibt es da noch gar nicht.
export function naviAktualisiert(navi: Element): void {
  haltePunktAktiv(navi)
  if (navi.hasAttribute('data-ff-editor') || gestartet.has(navi)) return
  const erster = eintraegeVon(navi)[0]
  if (!erster) return
  gestartet.add(navi)
  // Startbild: die Maske oeffnet mit dem, was der erste Eintrag zeigt —
  // sonst stuende die Flaeche beim Oeffnen ohne jede Ansicht da. Erst wenn
  // das Dokument fertig gelesen ist: die Ansichten koennen HINTER der Navi
  // stehen, und was noch nicht existiert, findet schalteUm nicht.
  const start = (): void => schalteUm(navi, erster.seitename)
  if (navi.ownerDocument.readyState === 'loading') {
    navi.ownerDocument.addEventListener('DOMContentLoaded', start, { once: true })
  } else {
    queueMicrotask(start)
  }
}
