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

import { MousePointerClick } from 'lucide-react'
import { useMemo, useState, type DragEvent } from 'react'
import { ROOT_FLOW } from '../../core/blocks/flowLayout'
import { useEditor } from '../../state/useEditor'
import { NodeList } from './CanvasNode'
import { isNewBlockDrag } from './dnd'
import { commitDrop, DndContext, type DndState, type DropTarget } from './dndState'
import { PopupSeite } from './PopupSeite'

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
        <div
          onClick={() => ed.selectBlock(null)}
          // Das „Blatt" (R1): die Maske liegt sichtbar AUF dem Grund —
          // Kante + zweistufiger Schatten geben die Tiefe, der Inhalt
          // selbst bleibt unverändert Masken-Welt (--se-bg).
          className="relative min-h-0 w-full flex-1 overflow-hidden rounded-md border border-border bg-card shadow-[0_1px_2px_rgba(16,24,40,0.07),0_12px_28px_-14px_rgba(16,24,40,0.25)]"
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
          {/* Leerzustand (R1): sagt, was zu tun ist — reine Editor-Hilfe,
              nie Teil des Baums; pointer-events-none lässt Drops durch. */}
          {hauptseite && ed.blockCount === 0 && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-1.5 rounded-md border border-dashed border-border bg-card/70 px-8 py-6 text-center">
                <MousePointerClick size={18} className="text-muted-foreground/60" />
                <p className="text-[13px] font-medium text-foreground/80">Leere Maske</p>
                <p className="text-xs text-muted-foreground">
                  Zieh einen Baustein aus der Bibliothek links hierher.
                </p>
              </div>
            </div>
          )}
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
