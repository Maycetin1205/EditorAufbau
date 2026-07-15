// Canvas
// Sichtbare Arbeitsfläche. Rendert den Block-Baum REKURSIV im Fluss und
// trägt die komplette Drag-and-Drop-Platzierung (Kap. 2.3):
//   - vorhandene Blöcke ziehen: umsortieren, in Bereiche hinein, heraus —
//     auf jeder Verschachtelungsebene, mit Einfüge-Linie als Vorschau.
//   - neue Blöcke aus der Bibliothek ziehen (MIME-Typ, siehe dnd.ts).
//   - Bereiche als Ziel: Randzone = davor/dahinter einsortieren,
//     Mitte = hinein ans Ende. Ein Bereich kann nie in sich selbst fallen.
// Klick auf leere Stelle = Auswahl aufheben.

import {
  createContext,
  Fragment,
  useContext,
  useMemo,
  useState,
  type DragEvent,
} from 'react'
import type { BlockNode } from '../../core/blocks/BlockData'
import { canContain, getBlockDefinition } from '../../core/blocks/blockRegistry'
import {
  flowItemHeightStyle,
  flowItemStyle,
  parseFlowHeight,
  parseFlowWidth,
  resolveChildDirection,
  ROOT_FLOW,
  type FlowDirection,
} from '../../core/blocks/flowLayout'
import { useEditor } from '../../state/useEditor'
import { BlockHost } from './BlockHost'
import { isNewBlockDrag, newBlockDragType, NEW_BLOCK_MIME } from './dnd'

interface DropTarget {
  parentId: string
  index: number
}

interface DndState {
  // id des gezogenen vorhandenen Blocks (null bei Palette-Drag / kein Drag)
  dragId: string | null
  dropTarget: DropTarget | null
  setDragId: (id: string | null) => void
  setDropTarget: (t: DropTarget | null) => void
  reset: () => void
}

const DndContext = createContext<DndState | null>(null)

function useDnd(): DndState {
  const dnd = useContext(DndContext)
  if (!dnd) throw new Error('DndContext fehlt (nur innerhalb des Canvas nutzbar)')
  return dnd
}

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
function NodeList({ parentId, direction }: { parentId: string; direction: FlowDirection }) {
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

// Führt den Drop aus: vorhandener Block → moveNode, Palette-Block → addBlock.
function commitDrop(
  e: DragEvent,
  ed: ReturnType<typeof useEditor>,
  dnd: DndState,
): void {
  const target = dnd.dropTarget
  if (target) {
    if (dnd.dragId !== null) {
      ed.moveNode(dnd.dragId, target.parentId, target.index)
      ed.selectBlock(dnd.dragId)
    } else if (isNewBlockDrag(e.dataTransfer)) {
      const type = e.dataTransfer.getData(NEW_BLOCK_MIME)
      if (getBlockDefinition(type)) ed.addBlock(type, target.parentId, target.index)
    }
  }
  dnd.reset()
}

export function Canvas() {
  const ed = useEditor()
  const [dragId, setDragId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)

  const dnd = useMemo<DndState>(() => ({
    dragId,
    dropTarget,
    setDragId,
    setDropTarget,
    reset: () => {
      setDragId(null)
      setDropTarget(null)
    },
  }), [dragId, dropTarget])

  // Freie Fläche unter den Blöcken: Drop ans Ende der Wurzel.
  const onCanvasDragOver = (e: DragEvent) => {
    if (dragId === null && !isNewBlockDrag(e.dataTransfer)) return
    e.preventDefault()
    setDropTarget({ parentId: ed.rootId, index: ed.childNodesOf(ed.rootId).length })
  }

  return (
    <DndContext.Provider value={dnd}>
      <div
        onClick={() => ed.selectBlock(null)}
        className="relative h-full w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm"
        style={{ minHeight: 400 }}
      >
        <div
          // Wurzel-Fluss aus ROOT_FLOW — dieselben Werte benutzt der Export.
          // Hintergrund = Masken-Grundfarbe (--se-bg), NICHT Editor-Chrome:
          // die Fläche zeigt die Maske, wie sie exportiert wird (WYSIWYG).
          className="flex h-full min-h-0 flex-col items-start overflow-auto"
          style={{
            gap: ROOT_FLOW.gap,
            padding: ROOT_FLOW.padding,
            boxSizing: 'border-box',
            background: 'var(--se-bg)',
          }}
          onDragOver={onCanvasDragOver}
          onDrop={(e) => {
            e.preventDefault()
            commitDrop(e, ed, dnd)
          }}
          onDragLeave={(e) => {
            // Nur zurücksetzen, wenn der Zeiger die Fläche wirklich verlässt.
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setDropTarget(null)
            }
          }}
        >
          <NodeList parentId={ed.rootId} direction="column" />
        </div>
      </div>
    </DndContext.Provider>
  )
}

export type { DropTarget }
export { DndContext }
