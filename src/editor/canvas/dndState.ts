// dndState
// Geteilter Drag-and-Drop-Zustand des Canvas (wörtlich aus
// Canvas.tsx gezogen): Context + Hook + der eine Drop-Vollzug. Die Fläche
// (Canvas) stellt den Provider, Knotenliste und Popup-Seite lesen ihn.
//
// Zwei Ziel-Arten (E2 „Bewegen"): auf einer RASTERFLÄCHE bestimmt die Zelle den
// Platz (kind:'raster' — x/y/w/h in Zellen, Nachbarn bleiben stehen); INNERHALB von
// Containern gilt weiter die Einfüge-Position (kind:'flow' — parentId+index).

import { createContext, useContext, type DragEvent } from 'react'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import type { useEditor } from '../../state/useEditor'
import { isNewBlockDrag, NEW_BLOCK_MIME } from './dnd'

// Fluss-Ziel: davor/dahinter/hinein an einer Einfüge-Position (Container).
// Raster-Ziel: eine Zelle samt Zellmaß des Gezogenen (Vorschau + Drop).
type DropTarget =
  | { kind: 'flow'; parentId: string; index: number }
  | { kind: 'raster'; parentId: string; x: number; y: number; w: number; h: number }

interface DndState {
  // id des gezogenen vorhandenen Blocks: bei HTML5-Drag aus einem Container auf
  // die Rasterfläche (dann via commitDrop) UND — als Dim-Markierung — beim
  // POINTER-Bewegen eines Rasterblocks (rasterMove setzt/löscht sie). null =
  // Palette-Drag / kein Drag.
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

// Führt den Drop aus. Raster-Ziel: an die Zelle setzen (Nachbarn bleiben stehen) —
// vorhandener Block → moveNodeToCell, Palette-Block → addBlockAtCell. Fluss-
// Ziel (Container, unverändert): moveNode bzw. addBlock an die Einfüge-Position.
function commitDrop(
  e: DragEvent,
  ed: ReturnType<typeof useEditor>,
  dnd: DndState,
): void {
  const target = dnd.dropTarget
  if (target?.kind === 'raster') {
    if (dnd.dragId !== null) {
      ed.moveNodeToCell(dnd.dragId, target.parentId, target.x, target.y)
    } else if (isNewBlockDrag(e.dataTransfer)) {
      const type = e.dataTransfer.getData(NEW_BLOCK_MIME)
      if (getBlockDefinition(type)) ed.addBlockAtCell(type, target.parentId, target.x, target.y)
    }
  } else if (target) {
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
