// CanvasNode
// Rekursive Knoten-Darstellung der Arbeitsfläche. Zwei Welten (V1-Schnitt,
// s. rasterLayout): OBERSTE EBENE (raster=true) liegt im CSS-Grid und wird per
// POINTER bewegt (rasterMove) — KEIN HTML5-draggable, das den Pointer-Zug
// verschlucken würde. INNERHALB von Containern (raster=false, Spalte/Karte/
// Zeile) gilt weiter der Fluss mit HTML5-Drag: umsortieren, in Bereiche hinein/
// heraus, Randzone = davor/dahinter, Einfüge-Linie als Vorschau — unverändert.

import { Fragment, type DragEvent } from 'react'
import type { BlockNode } from '../../core/blocks/BlockData'
import { canContain, getBlockDefinition } from '../../core/blocks/blockRegistry'
import {
  flowItemHeightStyle,
  flowItemStyle,
  parseFlowHeight,
  parseFlowWidth,
  resolveChildDirection,
  type FlowDirection,
} from '../../core/blocks/flowLayout'
import { istRandBaustein, randItemStyle } from '../../core/blocks/maskenRand'
import { parseRasterPos, rasterItemStyle } from '../../core/blocks/rasterLayout'
import { useEditor } from '../../state/useEditor'
import { BlockHost } from './BlockHost'
import { isNewBlockDrag, newBlockDragType } from './dnd'
import { commitDrop, useDnd } from './dndState'
import { ziehePosition } from './rasterMove'

// Randzonen-Breite in px: so nah am Rand eines Bereichs gilt der Drop als
// "davor/dahinter" (Geschwister), sonst als "hinein".
const CONTAINER_EDGE = 12

function InsertionLine({ direction }: { direction: FlowDirection }) {
  return (
    <div
      data-ff-editor-helper
      style={{
        background: 'hsl(var(--ring))',
        borderRadius: 2,
        ...(direction === 'column'
          ? { alignSelf: 'stretch', height: 2 }
          : { width: 2, alignSelf: 'stretch', minHeight: 24 }),
      }}
    />
  )
}

// Geordnete Kinder eines Containers inkl. Einfüge-Linie an der Vorschau-Stelle.
// `raster` = die Kinder liegen auf einer Rasterfläche (oberste Ebene): dort
// bestimmt die Zelle den Platz, nicht die Reihenfolge — es gibt keine Einfüge-
// Linie (die Zell-Vorschau „Geist" rendert der Canvas), nur die Fluss-Liste in
// Containern zeigt sie (kind:'flow').
export function NodeList(
  { parentId, direction, raster = false, nurRand = false }:
  { parentId: string; direction: FlowDirection; raster?: boolean; nurRand?: boolean },
) {
  const ed = useEditor()
  const dnd = useDnd()
  // nurRand: nur die Bausteine des Masken-RAHMENS. Der Canvas holt sie
  // zusaetzlich von der Hauptseite, wenn eine Ansicht offen ist — sie stehen
  // auf jeder Flaeche (maskenRand). Alles andere der Hauptseite bleibt aus.
  const alle = ed.childNodesOf(parentId)
  const nodes = nurRand ? alle.filter(istRandBaustein) : alle
  const lineAt = (i: number) =>
    !raster
    && dnd.dropTarget?.kind === 'flow'
    && dnd.dropTarget.parentId === parentId
    && dnd.dropTarget.index === i
  return (
    <>
      {nodes.map((node, i) => (
        <Fragment key={node.id}>
          {lineAt(i) && <InsertionLine direction={direction} />}
          <CanvasNode node={node} index={i} parentId={parentId} listDirection={direction} raster={raster} />
        </Fragment>
      ))}
      {lineAt(nodes.length) && <InsertionLine direction={direction} />}
    </>
  )
}

interface CanvasNodeProps {
  node: BlockNode
  index: number
  parentId: string
  listDirection: FlowDirection
  // true = der Block sitzt auf einer Rasterfläche (Zellen-Platzierung, Pointer-
  // Bewegen); false = im Fluss eines Containers (HTML5-Drag).
  raster?: boolean
}

function CanvasNode({ node, index, parentId, listDirection, raster = false }: CanvasNodeProps) {
  const ed = useEditor()
  const dnd = useDnd()
  const def = getBlockDefinition(node.type)
  const isContainer = def?.acceptsChildren ?? false
  const childDirection = resolveChildDirection(def, node.props)

  // Ziel ungültig, wenn ein Block in seinen eigenen Teilbaum fallen würde.
  const invalidTarget = (targetParentId: string) =>
    dnd.dragId !== null && ed.isInSubtree(dnd.dragId, targetParentId)

  // --- Fluss-Drag (nur in Containern, raster=false) — unverändert HTML5 ---
  const onDragStart = (e: DragEvent) => {
    e.stopPropagation()
    dnd.setDragId(node.id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', node.id)
  }

  const onDragOver = (e: DragEvent) => {
    if (dnd.dragId === null && !isNewBlockDrag(e.dataTransfer)) return
    e.preventDefault()
    e.stopPropagation()
    if (dnd.dragId === node.id) return dnd.setDropTarget(null)
    const rect = e.currentTarget.getBoundingClientRect()

    // Typ des gezogenen Blocks: vorhandener Knoten oder Palette-Drag (Typ
    // reist im MIME-Namen mit, Daten sind bei dragover nicht lesbar).
    const draggedType = dnd.dragId !== null
      ? ed.getNode(dnd.dragId)?.type ?? null
      : newBlockDragType(e.dataTransfer)
    // Erlaubte Kind-Typen: nur dort eine Einfüge-Vorschau
    // anbieten, wo der Container den Typ auch aufnimmt.
    const allowedIn = (containerType: string) =>
      draggedType !== null && canContain(containerType, draggedType)
    const parentType = ed.getNode(parentId)?.type ?? ''

    if (isContainer && !invalidTarget(node.id) && allowedIn(node.type)) {
      // Randzone → Geschwister-Position, Mitte → hinein ans Ende.
      const before = listDirection === 'row'
        ? e.clientX < rect.left + CONTAINER_EDGE
        : e.clientY < rect.top + CONTAINER_EDGE
      const after = listDirection === 'row'
        ? e.clientX > rect.right - CONTAINER_EDGE
        : e.clientY > rect.bottom - CONTAINER_EDGE
      if (!before && !after) {
        dnd.setDropTarget({ kind: 'flow', parentId: node.id, index: ed.childNodesOf(node.id).length })
        return
      }
      if (invalidTarget(parentId) || !allowedIn(parentType)) return dnd.setDropTarget(null)
      dnd.setDropTarget({ kind: 'flow', parentId, index: before ? index : index + 1 })
      return
    }

    if (invalidTarget(parentId) || !allowedIn(parentType)) return dnd.setDropTarget(null)
    const after = listDirection === 'row'
      ? e.clientX > rect.left + rect.width / 2
      : e.clientY > rect.top + rect.height / 2
    dnd.setDropTarget({ kind: 'flow', parentId, index: after ? index + 1 : index })
  }

  // Der Baustein selbst (BlockHost) + rekursive Kinder — in beiden Welten gleich.
  // Auswahl am Ding (U8): ein Klick wählt DIESEN Baustein, ein weiterer auf
  // denselben geht eine Ebene nach außen (Regel siehe selectionOps).
  const inhalt = (
    <BlockHost
      block={node}
      selected={ed.selectedId === node.id}
      onSelect={(aufStelle) => ed.waehleGetroffenen(node.id, aufStelle)}
      raster={raster}
    >
      {isContainer && <NodeList parentId={node.id} direction={childDirection} />}
    </BlockHost>
  )

  // Rasterfläche: Zelle bestimmt Platz+Größe (rasterItemStyle, DIESELBE Quelle
  // wie der Export). Bewegt wird per Pointer (ziehePosition) — KEIN draggable.
  //
  // AUSNAHME Rand-Baustein (maskenRand, N2.1): er liegt nicht in einer Zelle,
  // sondern am Rand der Fläche (randItemStyle, ebenfalls DIESELBE Quelle wie
  // der Export). Sein Platz ist damit vergeben — er lässt sich nicht ziehen,
  // und ein Zug-Versuch täuschte eine Freiheit vor, die es nicht gibt.
  if (raster) {
    const rand = istRandBaustein(node)
    return (
      <div
        onPointerDown={rand ? undefined : (e) => ziehePosition(ed, dnd, e, node, parentId)}
        style={{
          opacity: dnd.dragId === node.id ? 0.4 : 1,
          ...(rand ? randItemStyle() : rasterItemStyle(parseRasterPos(node.props))),
        }}
      >
        {inhalt}
      </div>
    )
  }

  // Fluss (in Containern): Breite + Höhe wie bisher, HTML5-Drag unverändert.
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={(e) => {
        e.preventDefault()
        e.stopPropagation()
        commitDrop(e, ed, dnd)
      }}
      onDragEnd={dnd.reset}
      style={{
        opacity: dnd.dragId === node.id ? 0.4 : 1,
        ...flowItemStyle(parseFlowWidth(node.props.width), listDirection, def?.lockedWidth),
        ...flowItemHeightStyle(parseFlowHeight(node.props.height), listDirection),
      }}
    >
      {inhalt}
    </div>
  )
}
