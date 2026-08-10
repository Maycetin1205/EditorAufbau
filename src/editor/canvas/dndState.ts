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

// Zwei Drop-Ziele INHALTLICH vergleichen.
//
// Warum es das braucht (2026-08-10): jedes `pointermove` beim Bewegen und
// jedes `dragover` beim Ziehen baut ein NEUES Ziel-Objekt (rasterMove,
// rasterDnd, CanvasNode). Ein neues Objekt heisst fuer React „hat sich
// geaendert", auch wenn dieselbe Zelle darinsteht — und weil der DnD-Zustand
// per Context an der ganzen Flaeche haengt, rendert bei 60 bis 120 Hz jedes
// Mal der komplette Baum neu. Gewechselt hat das Ziel aber nur, wenn eine
// seiner ZAHLEN anders ist.
function gleichesZiel(a: DropTarget | null, b: DropTarget | null): boolean {
  if (a === b) return true
  if (!a || !b) return false
  if (a.kind === 'raster' && b.kind === 'raster') {
    return a.parentId === b.parentId
      && a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h
  }
  if (a.kind === 'flow' && b.kind === 'flow') {
    return a.parentId === b.parentId && a.index === b.index
  }
  return false
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
export { commitDrop, DndContext, gleichesZiel, useDnd }
