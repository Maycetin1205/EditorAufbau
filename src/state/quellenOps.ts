import type { BlockNode, BlockTree } from '../core/blocks/BlockData'
import {
  eintragsQuellenWahlWert,
  listeLesen,
  zerlegeBindung,
} from '../core/blocks/BlockDefinition'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { propertySichtbar } from '../core/blocks/PropertyDescription'
import { quellenIdsInKettenVon, traegtEigeneQuelle } from '../core/blocks/treeQuery'
import type { DataSource } from '../core/data/dataSources'
import {
  quellenAufloesen,
  weitereQuellenAus,
  WEITERE_QUELLEN_PROP,
  type QuelleInReichweite,
} from '../core/data/sourceLinks'

export function quellenTraeger(tree: BlockTree, id: string): BlockNode | undefined {
  let cur: BlockNode | undefined = tree[id]
  while (cur) {
    if (traegtEigeneQuelle(cur)) return cur
    cur = cur.parentId ? tree[cur.parentId] : undefined
  }
  return undefined
}

export function quellenInReichweite(
  tree: BlockTree,
  id: string,
  bibliothek: readonly DataSource[],
): QuelleInReichweite[] {
  const traeger = quellenTraeger(tree, id)
  if (!traeger) return []
  return quellenAufloesen(traeger.props.source, traeger.props[WEITERE_QUELLEN_PROP], bibliothek)
}

export function bausteineMitQuelle(tree: BlockTree, quelleId: string): BlockNode[] {
  if (quelleId === '') return []
  return Object.values(tree).filter((n) => nutztQuelle(n, quelleId))
}

function nutztQuelle(n: BlockNode, quelleId: string): boolean {
  if (traegtEigeneQuelle(n)) {
    if (n.props.source === quelleId) return true
    if (weitereQuellenAus(n.props[WEITERE_QUELLEN_PROP]).some((q) => q.quelleId === quelleId)) {
      return true
    }
  }
  const def = getBlockDefinition(n.type)

  for (const prop of def?.customProperties ?? []) {
    if (prop.kind !== 'quelle' || !propertySichtbar(prop.visibleWhen, n.props)) continue
    if (n.props[prop.attributeName] === quelleId) return true
  }

  // Die Quellen, die eine LISTE am Baustein nennt — bei der Tabelle sind das
  // ihre Spalten: „Sucht beim Erfassen in <Hilfstabelle>" und eine Bindung,
  // die ihre Quelle beim Namen nennt (`quelle::code`).
  // Bis 2026-08-21 fehlte dieser Zweig hier. Folge: eine Datenquelle, die NUR
  // von Tabellenspalten benutzt wurde, galt als unbenutzt — der Lösch-Hinweis
  // im Datencenter blieb aus, und sie war mit einem Klick weg, obwohl die
  // Maske sie braucht.
  //
  // ⚠ Diese Frage ist NICHT dieselbe wie `collectDataSources` in
  // export/benutzteQuellen.ts, auch wenn sie sich fast gleich liest: dort
  // heisst sie „liefert diese Quelle auch etwas?" und wirft unvollstaendige
  // Verknüpfungen weg (`quelleBrauchbar`); hier heisst sie „wird sie
  // überhaupt erwähnt?" und zählt sie mit — beim Löschen ist die breitere
  // Frage die richtige. Die beiden zusammenzulegen ist ein eigenes Paket
  // (R8, Doppelungen); ein gemeinsamer Helfer müsste den Unterschied
  // ausdrücklich tragen, sonst verliert eine der beiden Seiten ihre Bedeutung.
  const listen = def?.listenBindung
  if (listen) {
    for (const eintrag of listeLesen(n.props[listen.prop], listen)) {
      if (listen.eintragsQuellenWahl
        && eintragsQuellenWahlWert(listen.eintragsQuellenWahl, eintrag) === quelleId) {
        return true
      }
      if (zerlegeBindung(String(eintrag[listen.feldKey] ?? '')).quelleId === quelleId) {
        return true
      }
    }
  }

  return quellenIdsInKettenVon(n).includes(quelleId)
}

export function ersteQuelleInReichweite(
  tree: BlockTree,
  id: string,
  bibliothek: readonly DataSource[],
): DataSource | undefined {
  const traeger = quellenTraeger(tree, id)
  if (!traeger || typeof traeger.props.source !== 'string') return undefined
  return bibliothek.find((s) => s.id === traeger.props.source)
}
