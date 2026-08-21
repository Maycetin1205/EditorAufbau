import type { BlockNode, BlockTree } from '../core/blocks/BlockData'
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
