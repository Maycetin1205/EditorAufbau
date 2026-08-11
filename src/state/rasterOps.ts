// rasterOps — WO ein Baustein liegt: Bewegen (im Fluss wie an die Zelle),
// Größe, Einfügen an der Zelle.
// Verhaltensgleich herausgezogen aus Editor.ts:
// kein Zustand, kein DOM — alle Funktionen bekommen alles hereingereicht und
// geben den NEUEN Baum zurück (null = nichts zu tun). Wer den Baum übernimmt
// und wer meldet, bleibt allein Sache des Stores.
// Auch der Fluss-Umzug (verschiebeInContainer) wohnt hier: seine ganze
// Verwicklung IST die Rasterfläche — landet der Baustein auf einer, braucht er
// eine freie Zeile. `istRasterFlaeche` steht ohnehin nur hier.

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

// Wohin eine KOPIE gelegt wird (A5, 2026-08-11). Pixelgleich auf dem Original
// sieht Duplizieren aus wie „nichts passiert" — sichtbar wechselt nur der
// Inspector still auf die Kopie. Sie bekommt darum die freie Zeile ganz unten,
// dieselbe Rechnung wie ein neuer Baustein aus der Bibliothek (freieZeileAuf in
// addBlock); Spalte, Breite und Hoehe behaelt sie.
//
// NUR direkt auf der Hauptfläche (Wurzel). Die Popup-Innenfläche ist heute
// Fluss, kein Raster (s. Kopf von rasterLayout) — dort gibt es keine Position
// zu wählen; ihre Platzierung entscheidet der Popup-Rastervertrag (Plan C3.1).
export function freiePositionFuerKopie(
  tree: BlockTree,
  parentId: string,
  kopie: BlockNode,
): BlockNode {
  if (parentId !== ROOT_ID) return kopie
  const pos = parseRasterPos(kopie.props)
  const y = freieZeileAuf(tree, parentId)
  if (y === pos.y) return kopie
  return {
    ...kopie,
    props: { ...kopie.props, rasterX: pos.x, rasterY: y, rasterW: pos.w, rasterH: pos.h },
  }
}

// Zustandsabhängige Startgröße nachziehen (2026-08-06): manche Bausteine
// haben je nach Einstellung eine ANDERE sinnvolle Rastergröße — die senkrecht
// gestellte Trennlinie ist schmal und hoch, wo die waagerechte breit und flach
// ist. Wechselt eine Einstellung die Variante (rasterSpecOf), bekommt der
// Baustein deren Startgröße; sonst bleibt seine — auch eine gezogene — Größe
// unangetastet. Ohne das bliebe die umgestellte Trennlinie 24 Zellen breit und
// 1 hoch: ein senkrechter Strich in einem flachen Vollbreite-Kasten.
// Registry-getrieben (raster.varianten), kein `if type===` (Regel 2).
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

// Verschiebt einen Block auf eine feste Zelle (E2 „Bewegen", Nutzer-
// Entscheidung B 2026-07-23 „Bausteine bleiben stehen"): NUR der gezogene
// Umzug im FLUSS: Knoten in einen Container an eine Einfüge-Position. `index`
// bezieht sich auf die Kinderliste des Zielcontainers (inkl. des gezogenen
// Knotens, falls gleicher Container) — die Korrektur passiert hier.
// Landet der Block neu auf einer Rasterfläche, bekommt er eine freie Zeile ganz
// unten (keine Überlappung mit den vorhandenen Blöcken); seine Breite/Höhe
// behält er. Freies Verschieben auf der Fläche selbst macht `zelleneinzug`.
export function verschiebeInContainer(
  tree: BlockTree,
  id: string,
  newParentId: string,
  index: number,
): BlockTree | null {
  const node = tree[id]
  const newParent = tree[newParentId]
  if (!node || !newParent || id === ROOT_ID) return null
  // Niemals in den eigenen Teilbaum einhängen (Zyklus).
  if (collectSubtree(tree, id).includes(newParentId)) return null
  // Ziel muss den Typ aufnehmen (allowedChildTypes).
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
  const spec = rasterSpecOf(getBlockDefinition(node.type), node.props)
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
