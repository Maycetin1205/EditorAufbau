import { getAllBlockDefinitions } from '../../core/blocks/blockRegistry'
import { QUELLE_PROP } from '../../core/blocks/treeQuery'
import { seGlobal } from '../../softengine/bridge'
import { findRuntimeDataSource, isRecord } from '../../softengine/data'
import { ladeZeilenPerRelation } from '../../softengine/relationLader'
import { aufAuswahlHoeren, auswahlFuer, merkmalVon } from './auswahl'

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

function gewaehlteZeileDerQuelle(quelleId: string, attrJeTag: Map<string, string>): unknown {
  if (quelleId === '' || typeof document === 'undefined') return undefined
  for (const el of Array.from(document.querySelectorAll('[data-ff-id]'))) {
    const attr = attrJeTag.get(el.tagName.toLowerCase())
    if (attr === undefined || el.getAttribute(attr) !== quelleId) continue
    const zeile = auswahlFuer(el.getAttribute('data-ff-id') ?? '')
    if (zeile !== undefined) return zeile
  }
  return undefined
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
}
