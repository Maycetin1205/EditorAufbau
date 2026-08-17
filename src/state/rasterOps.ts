import { ROOT_ID, type BlockNode, type BlockTree } from '../core/blocks/BlockData'
import { createBlockSubtree } from '../core/blocks/blockFactory'
import { canContain, getBlockDefinition } from '../core/blocks/blockRegistry'
import { istRandBaustein } from '../core/blocks/maskenRand'
import {
  naechsteFreieZeile,
  parseRasterPos,
  RASTER,
  rasterSpecOf,
} from '../core/blocks/rasterLayout'
import { istSeitenBaustein, kinderImFluss } from './pageOps'
import { collectSubtree } from './treeOps'

export function istRasterFlaeche(node: BlockNode): boolean {
  return node.id === ROOT_ID || istSeitenBaustein(node)
}

export function freieZeileAuf(tree: BlockTree, parentId: string): number {
  return naechsteFreieZeile(
    kinderImFluss(tree, parentId)
      .filter((n) => !istRandBaustein(n))
      .map((n) => parseRasterPos(n.props)),
  )
}

export function freiePositionFuerKopie(
  tree: BlockTree,
  parentId: string,
  kopie: BlockNode,
): BlockNode {
  const eltern = tree[parentId]
  if (!eltern || !istRasterFlaeche(eltern)) return kopie
  const pos = parseRasterPos(kopie.props)
  const y = freieZeileAuf(tree, parentId)
  if (y === pos.y) return kopie
  return {
    ...kopie,
    props: { ...kopie.props, rasterX: pos.x, rasterY: y, rasterW: pos.w, rasterH: pos.h },
  }
}

export function startgroesseNachziehen(
  def: Parameters<typeof rasterSpecOf>[0],
  vorherProps: Record<string, unknown>,
  node: BlockNode,
): BlockNode {
  const vorher = rasterSpecOf(def, vorherProps)
  const nachher = rasterSpecOf(def, node.props)
  if (vorher.startW === nachher.startW && vorher.startH === nachher.startH) return node
  return {
    ...node,
    props: { ...node.props, rasterW: nachher.startW, rasterH: nachher.startH },
  }
}

export function verschiebeInContainer(
  tree: BlockTree,
  id: string,
  newParentId: string,
  index: number,
): BlockTree | null {
  const node = tree[id]
  const newParent = tree[newParentId]
  if (!node || !newParent || id === ROOT_ID) return null

  if (collectSubtree(tree, id).includes(newParentId)) return null

  if (!canContain(newParent.type, node.type)) return null
  const oldParentId = node.parentId
  if (!oldParentId) return null
  const oldParent = tree[oldParentId]

  const next: BlockTree = { ...tree }

  if (oldParentId === newParentId) {
    const arr = oldParent.childIds.filter((c) => c !== id)
    const oldIndex = oldParent.childIds.indexOf(id)
    let target = oldIndex < index ? index - 1 : index
    target = Math.max(0, Math.min(target, arr.length))
    arr.splice(target, 0, id)
    next[oldParentId] = { ...oldParent, childIds: arr }
  } else {
    next[oldParentId] = { ...oldParent, childIds: oldParent.childIds.filter((c) => c !== id) }
    const arr = [...newParent.childIds]
    const target = Math.max(0, Math.min(index, arr.length))
    arr.splice(target, 0, id)
    next[newParentId] = { ...newParent, childIds: arr }
    next[id] = { ...node, parentId: newParentId }
    if (istRasterFlaeche(newParent)) {
      const pos = parseRasterPos(node.props)
      const y = freieZeileAuf(tree, newParentId)
      next[id] = { ...next[id], props: { ...node.props, rasterX: 0, rasterY: y, rasterW: pos.w, rasterH: pos.h } }
    }
  }
  return next
}

export function zelleneinzug(
  tree: BlockTree,
  id: string,
  parentId: string,
  x: number,
  y: number,
): BlockTree | null {
  const node = tree[id]
  const parent = tree[parentId]
  if (!node || !parent || id === ROOT_ID) return null
  if (!istRasterFlaeche(parent)) return null
  if (!canContain(parent.type, node.type)) return null

  if (collectSubtree(tree, id).includes(parentId)) return null
  const gleicheFlaeche = node.parentId === parentId
  const cur = parseRasterPos(node.props)
  const spec = rasterSpecOf(getBlockDefinition(node.type), node.props)
  const w = gleicheFlaeche ? cur.w : spec.startW
  const h = gleicheFlaeche ? cur.h : spec.startH
  const nx = Math.max(0, Math.min(x, RASTER.spalten - w))
  const ny = Math.max(0, y)

  if (gleicheFlaeche && nx === cur.x && ny === cur.y && w === cur.w && h === cur.h) return null
  const next: BlockTree = { ...tree }
  if (!gleicheFlaeche && node.parentId && next[node.parentId]) {
    next[node.parentId] = {
      ...next[node.parentId],
      childIds: next[node.parentId].childIds.filter((c) => c !== id),
    }
    next[parentId] = { ...next[parentId], childIds: [...next[parentId].childIds, id] }
  }
  next[id] = {
    ...node,
    parentId,
    props: { ...node.props, rasterX: nx, rasterY: ny, rasterW: w, rasterH: h },
  }
  return next
}

export function zellenGroesse(
  tree: BlockTree,
  id: string,
  achse: 'x' | 'y',
  value: number,
): BlockTree | null {
  const node = tree[id]
  if (!node || !node.parentId) return null
  const parent = tree[node.parentId]
  if (!parent || !istRasterFlaeche(parent)) return null
  const cur = parseRasterPos(node.props)
  const w = achse === 'x' ? Math.max(1, Math.min(value, RASTER.spalten - cur.x)) : cur.w
  const h = achse === 'y' ? Math.max(1, value) : cur.h
  if (w === cur.w && h === cur.h) return null
  return {
    ...tree,
    [id]: { ...node, props: { ...node.props, rasterW: w, rasterH: h } },
  }
}

export function neuerBlockAnZelle(
  tree: BlockTree,
  type: string,
  parentId: string,
  x: number,
  y: number,
): { tree: BlockTree; node: BlockNode } | null {
  const parent = tree[parentId]
  if (!parent || !istRasterFlaeche(parent) || !canContain(parent.type, type)) return null
  const { nodes, rootId } = createBlockSubtree(type)
  const node = nodes[rootId]
  node.parentId = parent.id
  const spec = rasterSpecOf(getBlockDefinition(type), node.props)
  const nx = Math.max(0, Math.min(x, RASTER.spalten - spec.startW))
  const ny = Math.max(0, y)
  node.props = { ...node.props, rasterX: nx, rasterY: ny, rasterW: spec.startW, rasterH: spec.startH }
  return {
    tree: {
      ...tree,
      ...nodes,
      [parent.id]: { ...parent, childIds: [...parent.childIds, node.id] },
    },
    node,
  }
}
