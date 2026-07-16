// Canvas
// Sichtbare Arbeitsfläche. Rendert den Block-Baum REKURSIV im Fluss und
// trägt die komplette Drag-and-Drop-Platzierung (Kap. 2.3):
//   - vorhandene Blöcke ziehen: umsortieren, in Bereiche hinein, heraus —
//     auf jeder Verschachtelungsebene, mit Einfüge-Linie als Vorschau.
//   - neue Blöcke aus der Bibliothek ziehen (MIME-Typ, siehe dnd.ts).
//   - Bereiche als Ziel: Randzone = davor/dahinter einsortieren,
//     Mitte = hinein ans Ende. Ein Bereich kann nie in sich selbst fallen.
// Klick auf leere Stelle = Auswahl aufheben.
//
// Aufräumen A3: die Handgriffe wohnen in eigenen Dateien daneben —
// Knoten-Rekursion (CanvasNode), Dnd-Zustand (dndState), Seiten-Reiter
// (SeitenLeiste) und Popup-Seitenansicht (PopupSeite). Hier bleibt nur
// die Fläche selbst.

import { useMemo, useState, type DragEvent } from 'react'
import { ROOT_FLOW } from '../../core/blocks/flowLayout'
import { useEditor } from '../../state/useEditor'
import { NodeList } from './CanvasNode'
import { isNewBlockDrag } from './dnd'
import { commitDrop, DndContext, type DndState, type DropTarget } from './dndState'
import { PopupSeite } from './PopupSeite'
import { SeitenLeiste } from './SeitenLeiste'

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

  // Aktive Seite (P-A): Hauptseite = Wurzel-Fluss; Popup-Seite = das eine
  // Popup-Element über der abgedunkelten Maskenfläche (Seiten-Leiste oben).
  const hauptseite = ed.activePageId === ed.pages[0].id

  return (
    <DndContext.Provider value={dnd}>
      <div className="flex h-full w-full flex-col">
        <SeitenLeiste />
        <div
          onClick={() => ed.selectBlock(null)}
          className="relative min-h-0 w-full flex-1 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
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
            {hauptseite && <NodeList parentId={ed.rootId} direction="column" />}
          </div>
          {!hauptseite && <PopupSeite popupId={ed.activePageId} />}
        </div>
      </div>
    </DndContext.Provider>
  )
}

// Außen-Vertrag (Aufräumen A3): diese Namen waren immer von hier
// importierbar — sie wohnen jetzt in dndState, bleiben aber re-exportiert.
export type { DropTarget }
export { DndContext }
