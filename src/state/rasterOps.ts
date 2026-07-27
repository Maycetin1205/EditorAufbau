// rasterOps — Regeln der Rasterfläche (Bewegen, Größe, Einfügen an der Zelle).
// Verhaltensgleich herausgezogen aus Editor.ts:
// kein Zustand, kein DOM — alle Funktionen bekommen alles hereingereicht und
// geben den NEUEN Baum zurück (null = nichts zu tun). Wer den Baum übernimmt
// und wer meldet, bleibt allein Sache des Stores.

import { ROOT_ID, type BlockNode, type BlockTree } from '../core/blocks/BlockData'
import { createBlockSubtree } from '../core/blocks/blockFactory'
import { canContain, getBlockDefinition } from '../core/blocks/blockRegistry'
import {
  naechsteFreieZeile,
  parseRasterPos,
  RASTER,
  rasterSpecOf,
} from '../core/blocks/rasterLayout'
import { istSeitenBaustein, kinderImFluss } from './pageOps'
import { collectSubtree } from './treeOps'

// Rasterfläche = die oberste Ebene (Wurzel) oder ein Popup-Rumpf: dort liegen
// die Blöcke im Raster, nicht im Fluss.
export function istRasterFlaeche(node: BlockNode): boolean {
  return node.id === ROOT_ID || istSeitenBaustein(node)
}

// Freie Zeile ganz unten auf einer Rasterfläche — sonst lägen alle neuen
// Blöcke aufeinander in Zeile 0.
export function freieZeileAuf(tree: BlockTree, parentId: string): number {
  return naechsteFreieZeile(kinderImFluss(tree, parentId).map((n) => parseRasterPos(n.props)))
}

// Verschiebt einen Block auf eine feste Zelle (E2 „Bewegen", Nutzer-
// Entscheidung B 2026-07-23 „Bausteine bleiben stehen"): NUR der gezogene
// Block wandert — KEIN Ausweichen, die Nachbarn bleiben EXAKT stehen. Legt man
// zwei übereinander, überlappen sie bewusst. Kommt der Block von einer ANDEREN
// Fläche / aus einem Container, bekommt er die Registry-Startgröße (nie
// Vollbreite); auf DERSELBEN Fläche behält er seine Größe.
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
  // Niemals in den eigenen Teilbaum einhängen (Zyklus).
  if (collectSubtree(tree, id).includes(parentId)) return null
  const gleicheFlaeche = node.parentId === parentId
  const cur = parseRasterPos(node.props)
  const spec = rasterSpecOf(getBlockDefinition(node.type))
  const w = gleicheFlaeche ? cur.w : spec.startW
  const h = gleicheFlaeche ? cur.h : spec.startH
  const nx = Math.max(0, Math.min(x, RASTER.spalten - w))
  const ny = Math.max(0, y)
  // Nichts zu tun: gleiche Fläche, gleiche Zelle, gleiche Größe (reiner Klick).
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

// Größe auf der Rasterfläche ändern (Anfasser rechts/unten) — die NACHBARN
// bleiben stehen (Nutzer-Entscheidung B: nichts weicht aus, ein wachsender
// Block überlappt bewusst). Breite nie über den rechten Rand hinaus; Höhe darf
// beliebig wachsen. Mindestens EINE Zelle.
// `achse` 'x' = Breite (rasterW), 'y' = Höhe (rasterH).
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

// Neuer Block aus der Bibliothek an eine feste Zelle (E3 „Einfügen an der
// Zelle"): Startgröße aus der Registry an der Drop-Zelle, vorhandene Bausteine
// bleiben stehen. Verweigert Typen, die die Fläche nicht aufnimmt.
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
  const spec = rasterSpecOf(getBlockDefinition(type))
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
