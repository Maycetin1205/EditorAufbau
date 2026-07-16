// CanvasNode
// Rekursive Knoten-Darstellung der Arbeitsfläche (Aufräumen A3 — wörtlich
// aus Canvas.tsx gezogen): geordnete Kinderliste mit Einfüge-Linie als
// Drop-Vorschau und der Drag-Logik je Knoten (umsortieren, in Bereiche
// hinein/heraus, Randzone = davor/dahinter, Mitte = hinein ans Ende).

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
import { useEditor } from '../../state/useEditor'
import { BlockHost } from './BlockHost'
import { isNewBlockDrag, newBlockDragType } from './dnd'
import { commitDrop, useDnd } from './dndState'

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
export function NodeList({ parentId, direction }: { parentId: string; direction: FlowDirection }) {
  const ed = useEditor()
  const dnd = useDnd()
  const nodes = ed.childNodesOf(parentId)
  const lineAt = (i: number) =>
    dnd.dropTarget?.parentId === parentId && dnd.dropTarget.index === i
  return (
    <>
      {nodes.map((node, i) => (
        <Fragment key={node.id}>
          {lineAt(i) && <InsertionLine direction={direction} />}
          <CanvasNode node={node} index={i} parentId={parentId} listDirection={direction} />
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
}

function CanvasNode({ node, index, parentId, listDirection }: CanvasNodeProps) {
  const ed = useEditor()
  const dnd = useDnd()
  const def = getBlockDefinition(node.type)
  const isContainer = def?.acceptsChildren ?? false
  const childDirection = resolveChildDirection(def, node.props)

  // Ziel ungültig, wenn ein Block in seinen eigenen Teilbaum fallen würde.
  const invalidTarget = (targetParentId: string) =>
    dnd.dragId !== null && ed.isInSubtree(dnd.dragId, targetParentId)

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
    // Erlaubte Kind-Typen (Kap. 4K.4): nur dort eine Einfüge-Vorschau
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
        dnd.setDropTarget({ parentId: node.id, index: ed.childNodesOf(node.id).length })
        return
      }
      if (invalidTarget(parentId) || !allowedIn(parentType)) return dnd.setDropTarget(null)
      dnd.setDropTarget({ parentId, index: before ? index : index + 1 })
      return
    }

    if (invalidTarget(parentId) || !allowedIn(parentType)) return dnd.setDropTarget(null)
    const after = listDirection === 'row'
      ? e.clientX > rect.left + rect.width / 2
      : e.clientY > rect.top + rect.height / 2
    dnd.setDropTarget({ parentId, index: after ? index + 1 : index })
  }

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
        // Breite + Höhe im Fluss: dieselbe Logik, die der Export benutzt.
        ...flowItemStyle(parseFlowWidth(node.props.width), listDirection, def?.lockedWidth),
        ...flowItemHeightStyle(parseFlowHeight(node.props.height), listDirection),
      }}
    >
      <BlockHost
        block={node}
        selected={ed.selectedId === node.id}
        onSelect={() => ed.selectBlock(node.id)}
      >
        {isContainer && <NodeList parentId={node.id} direction={childDirection} />}
      </BlockHost>
    </div>
  )
}
