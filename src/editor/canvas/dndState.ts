// dndState
// Geteilter Drag-and-Drop-Zustand des Canvas (Aufräumen A3 — wörtlich aus
// Canvas.tsx gezogen): Context + Hook + der eine Drop-Vollzug. Die Fläche
// (Canvas) stellt den Provider, Knotenliste und Popup-Seite lesen ihn.

import { createContext, useContext, type DragEvent } from 'react'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import type { useEditor } from '../../state/useEditor'
import { isNewBlockDrag, NEW_BLOCK_MIME } from './dnd'

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

export type { DndState, DropTarget }
export { commitDrop, DndContext, useDnd }
