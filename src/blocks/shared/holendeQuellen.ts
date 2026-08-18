import { getAllBlockDefinitions } from '../../core/blocks/blockRegistry'
import { QUELLE_PROP } from '../../core/blocks/treeQuery'
import { seGlobal } from '../../softengine/bridge'
import { findRuntimeDataSource, isRecord } from '../../softengine/data'
import { ladeZeilenPerRelation } from '../../softengine/relationLader'
import {
  aufAuswahlHoeren,
  auswahlFuer,
  auswahlNummer,
  beimAuswahlZuruecksetzen,
  merkmalVon,
} from './auswahl'

const letzterAbdruck = new Map<string, string>()
let verdrahtet = false

export function quelleAttrJeTag(): Map<string, string> {
  const map = new Map<string, string>()
  for (const def of getAllBlockDefinitions()) {
    if (!def.satzWahl) continue
    map.set(def.tagName.toLowerCase(), (def.satzWahl.quelleProp ?? QUELLE_PROP).toLowerCase())
  }
  return map
}

// Der letzte Klick gewinnt: zeigen mehrere Bausteine dieselbe Quelle, gilt die
// juengste Auswahl. Frueher nahm diese Stelle den ersten Baustein in
// DOM-Reihenfolge — damit bestimmte bei zwei Tabellen derselben Quelle der
// Zufall des Aufbaus, welche Zeile geholt wurde. Wird die juengste Wahl
// abgewaehlt, faellt sie auf die naechstjuengere zurueck (ihr Eintrag ist weg).
// Die Wurzel ist uebergebbar wie bei applyPopupStep — so ist die Auswahl ohne
// Fenster pruefbar; im Produkt sucht sie im Dokument.
export function gewaehlteZeileDerQuelle(
  quelleId: string,
  attrJeTag: Map<string, string>,
  wurzel: ParentNode | undefined = typeof document === 'undefined' ? undefined : document,
): unknown {
  if (quelleId === '' || wurzel === undefined) return undefined
  let juengste: { zeile: unknown; nummer: number } | null = null
  for (const el of Array.from(wurzel.querySelectorAll('[data-ff-id]'))) {
    const attr = attrJeTag.get(el.tagName.toLowerCase())
    if (attr === undefined || el.getAttribute(attr) !== quelleId) continue
    const geberId = el.getAttribute('data-ff-id') ?? ''
    const zeile = auswahlFuer(geberId)
    if (zeile === undefined) continue
    const nummer = auswahlNummer(geberId)
    if (juengste === null || nummer > juengste.nummer) juengste = { zeile, nummer }
  }
  return juengste?.zeile
}

function pruefeHolendeQuellen(): void {
  const liste: unknown = seGlobal().FF_DATA_SOURCES
  if (!Array.isArray(liste)) return
  const attrJeTag = quelleAttrJeTag()
  for (const eintrag of liste) {
    if (!isRecord(eintrag) || typeof eintrag.id !== 'string') continue
    const quelle = findRuntimeDataSource(liste, eintrag.id)
    if (!quelle?.ladeRelation) continue
    const zeile = gewaehlteZeileDerQuelle(quelle.ladeRelation.geberQuelleId, attrJeTag)
    const abdruck = merkmalVon(zeile)
    if (letzterAbdruck.get(quelle.id) === abdruck) continue
    letzterAbdruck.set(quelle.id, abdruck)
    ladeZeilenPerRelation(quelle, quelle.ladeRelation, zeile)
  }
}

export function verdrahteHolendeQuellen(): void {
  if (verdrahtet) return
  verdrahtet = true
  aufAuswahlHoeren(pruefeHolendeQuellen)
  // Faellt die Auswahl komplett weg, muss der Abdruck mit weg: sonst gilt der
  // alte Stand weiter als "schon geholt" und es wird nichts mehr neu geholt.
  beimAuswahlZuruecksetzen(() => letzterAbdruck.clear())
}
