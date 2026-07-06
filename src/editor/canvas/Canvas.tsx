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
  childFlowDirection,
  flowItemStyle,
  parseFlowWidth,
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
// Container mit fester Kind-Typ-Liste (Kanban-Board/-Spalte) bekommen am
// Listenende Plus-Knöpfe für jeden erlaubten Typ ("+ Karte" / "+ Spalte") —
// generisch aus der Registry, kein `if type===`.
function NodeList({ parentId, direction }: { parentId: string; direction: FlowDirection }) {
  const ed = useEditor()
  const dnd = useDnd()
  const nodes = ed.childNodesOf(parentId)
  const lineAt = (i: number) =>
    dnd.dropTarget?.parentId === parentId && dnd.dropTarget.index === i
  const parentNode = ed.getNode(parentId)
  const parentDef = parentNode ? getBlockDefinition(parentNode.type) : undefined
  return (
    <>
      {nodes.map((node, i) => (
        <Fragment key={node.id}>
          {lineAt(i) && <InsertionLine direction={direction} />}
          <CanvasNode node={node} index={i} parentId={parentId} listDirection={direction} />
        </Fragment>
      ))}
      {lineAt(nodes.length) && <InsertionLine direction={direction} />}
      {parentDef?.allowedChildTypes?.map((childType) => (
        <AddChildButton key={childType} parentId={parentId} childType={childType} direction={direction} />
      ))}
    </>
  )
}

// Editor-Hilfe (nicht Teil des Exports): legt einen neuen erlaubten
// Kind-Block ans Ende des Containers, Beschriftung aus der Registry.
function AddChildButton({ parentId, childType, direction }: {
  parentId: string
  childType: string
  direction: FlowDirection
}) {
  const ed = useEditor()
  const def = getBlockDefinition(childType)
  if (!def) return null
  return (
    <button
      type="button"
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      onClick={(e) => {
        e.stopPropagation()
        ed.addBlock(childType, parentId)
      }}
      style={{
        border: '1.5px dashed hsl(220 13% 78%)',
        borderRadius: 4,
        background: 'transparent',
        color: 'hsl(215 15% 55%)',
        font: '700 11px system-ui, sans-serif',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        ...(direction === 'row'
          ? { flex: '0 0 140px', padding: '14px 0' } // natürliche Höhe (Zielbild .zb-addcol)
          : { alignSelf: 'stretch', padding: '6px 0' }),
      }}
    >
      ＋ {def.displayName}
    </button>
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
  const childDirection = childFlowDirection(def, node.props)

  // Typ des gezogenen Blocks: vorhandener Block aus dem Store, Palette-Block
  // aus dem MIME-Marker (getData ist während dragover gesperrt, siehe dnd.ts).
  const dragTypeOf = (e: DragEvent): string | null =>
    dnd.dragId !== null
      ? ed.getNode(dnd.dragId)?.type ?? null
      : newBlockDragType(e.dataTransfer)

  // Ziel ungültig, wenn ein Block in seinen eigenen Teilbaum fallen würde
  // ODER der Ziel-Container den Typ nicht erlaubt (Spalte nimmt nur Karten).
  const invalidTarget = (targetParentId: string, e: DragEvent): boolean => {
    if (dnd.dragId !== null && ed.isInSubtree(dnd.dragId, targetParentId)) return true
    const dragType = dragTypeOf(e)
    const targetParent = ed.getNode(targetParentId)
    if (!dragType || !targetParent) return false // unbekannt → Store prüft beim Drop
    return !canContain(targetParent.type, dragType)
  }

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

    if (isContainer && !invalidTarget(node.id, e)) {
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
      if (invalidTarget(parentId, e)) return dnd.setDropTarget(null)
      dnd.setDropTarget({ parentId, index: before ? index : index + 1 })
      return
    }

    if (invalidTarget(parentId, e)) return dnd.setDropTarget(null)
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
        // Breite im Fluss: dieselbe Logik, die später der Export benutzt.
        ...flowItemStyle(parseFlowWidth(node.props.width), listDirection),
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
        className="relative h-full w-full overflow-auto rounded-lg border border-border bg-card shadow-sm"
        style={{ minHeight: 400 }}
      >
        <div
          // Wurzel-Fluss aus ROOT_FLOW — dieselben Werte benutzt der Export.
          // Hintergrund = Masken-Grundfarbe (--se-bg), NICHT Editor-Chrome:
          // die Fläche zeigt die Maske, wie sie exportiert wird (WYSIWYG).
          className="flex min-h-full flex-col items-start"
          style={{
            gap: ROOT_FLOW.gap,
            padding: ROOT_FLOW.padding,
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
