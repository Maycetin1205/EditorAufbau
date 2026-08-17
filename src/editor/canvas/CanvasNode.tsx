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

export function NodeList(
  { parentId, direction, raster = false, nurRand = false }:
  { parentId: string; direction: FlowDirection; raster?: boolean; nurRand?: boolean },
) {
  const ed = useEditor()
  const dnd = useDnd()

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

  raster?: boolean
}

function CanvasNode({ node, index, parentId, listDirection, raster = false }: CanvasNodeProps) {
  const ed = useEditor()
  const dnd = useDnd()
  const def = getBlockDefinition(node.type)
  const isContainer = def?.acceptsChildren ?? false
  const childDirection = resolveChildDirection(def, node.props)

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

    const draggedType = dnd.dragId !== null
      ? ed.getNode(dnd.dragId)?.type ?? null
      : newBlockDragType(e.dataTransfer)

    const allowedIn = (containerType: string) =>
      draggedType !== null && canContain(containerType, draggedType)
    const parentType = ed.getNode(parentId)?.type ?? ''

    if (isContainer && !invalidTarget(node.id) && allowedIn(node.type)) {
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
