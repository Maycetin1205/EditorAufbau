// Canvas
// Sichtbare Arbeitsfläche. Rendert den Block-Baum REKURSIV im Fluss und
// trägt die komplette Drag-and-Drop-Platzierung:
//   - vorhandene Blöcke ziehen: umsortieren, in Bereiche hinein, heraus —
//     auf jeder Verschachtelungsebene, mit Einfüge-Linie als Vorschau.
//   - neue Blöcke aus der Bibliothek ziehen (MIME-Typ, siehe dnd.ts).
//   - Bereiche als Ziel: Randzone = davor/dahinter einsortieren,
//     Mitte = hinein ans Ende. Ein Bereich kann nie in sich selbst fallen.
// Klick auf leere Stelle = Auswahl aufheben.
//
// die Handgriffe wohnen in eigenen Dateien daneben —
// Knoten-Rekursion (CanvasNode), Dnd-Zustand (dndState), Seiten-Reiter
// (SeitenLeiste) und Popup-Seitenansicht (PopupSeite). Hier bleibt nur
// die Fläche selbst.

import { MousePointerClick } from '@/ui/zeichen'
import { useCallback, useMemo, useState, type DragEvent } from 'react'
import { ROOT_FLOW } from '../../core/blocks/flowLayout'
import { rasterFlaecheStyle, rasterItemStyle } from '../../core/blocks/rasterLayout'
import { useEditor } from '../../state/useEditor'
import { NodeList } from './CanvasNode'
import { isNewBlockDrag } from './dnd'
import { commitDrop, DndContext, gleichesZiel, type DndState, type DropTarget } from './dndState'
import { rasterZiel } from './rasterDnd'
import { PopupSeite } from './PopupSeite'

export function Canvas() {
  const ed = useEditor()
  const [dragId, setDragId] = useState<string | null>(null)
  const [dropTarget, merkeDropTarget] = useState<DropTarget | null>(null)

  // Das Ziel nur bei ECHTEM Wechsel neu setzen. Die Melder (rasterMove,
  // rasterDnd, CanvasNode) bauen bei JEDEM Zeigerereignis ein frisches
  // Ziel-Objekt; ohne diesen Vergleich rechnet React jedes davon als Aenderung
  // und zeichnet die ganze Flaeche neu — beim Ziehen 60 bis 120 Mal je
  // Sekunde, obwohl der Geist meist ueber derselben Zelle steht. Gibt der
  // Aktualisierer denselben Stand zurueck, hoert React von selbst auf.
  const setDropTarget = useCallback((ziel: DropTarget | null) => {
    merkeDropTarget((vorher) => (gleichesZiel(vorher, ziel) ? vorher : ziel))
  }, [])

  const dnd = useMemo<DndState>(() => ({
    dragId,
    dropTarget,
    setDragId,
    setDropTarget,
    reset: () => {
      setDragId(null)
      setDropTarget(null)
    },
  }), [dragId, dropTarget, setDropTarget])

  // Rasterfläche: die Zielzelle unter dem Zeiger bestimmen (Bibliothek-Drag oder
  // Block aus einem Container) — das ersetzt die frühere Einfüge-Linie „ans Ende
  // der Wurzel". null = kein gültiges Ziel (Typ passt nicht). Das POINTER-Bewegen
  // vorhandener Rasterblöcke läuft NICHT hierüber (rasterMove).
  const onGridDragOver = (e: DragEvent) => {
    if (dragId === null && !isNewBlockDrag(e.dataTransfer)) return
    e.preventDefault()
    setDropTarget(rasterZiel(e, ed, dnd, ed.rootId, e.currentTarget as HTMLElement))
  }

  // Aktive Seite: Hauptseite = Wurzel-Fluss; Popup-Seite = das eine
  // Popup-Element über der abgedunkelten Maskenfläche (Seiten-Leiste oben).
  const hauptseite = ed.activePageId === ed.pages[0].id

  return (
    <DndContext.Provider value={dnd}>
      <div className="flex h-full w-full flex-col">
        <div
          onClick={() => ed.selectBlock(null)}
          // Das „Blatt": die Maske liegt sichtbar AUF dem Grund — Kante +
          // dreistufiger Schatten geben die Tiefe, der Inhalt selbst bleibt
          // unverändert Masken-Welt (--se-bg).
          //
          // Der Schatten ist bewusst kräftig (Nutzer 2026-07-25: „muss wow
          // sein, wenn ein Kunde die Masken sieht"): eine harte Nahkante,
          // ein mittlerer Absatz und ein weiter, warmer Wurf. Warm getönt
          // (nicht neutralschwarz), sonst wirkt er schmutzig auf dem
          // papierfarbenen Tisch.
          className="relative min-h-0 w-full flex-1 overflow-hidden rounded-md border border-border bg-card shadow-[0_1px_2px_rgba(40,30,20,0.10),0_6px_14px_-6px_rgba(40,30,20,0.16),0_26px_50px_-24px_rgba(40,30,20,0.38)]"
          // Blatt = Masken-Welt: Schrift/Größe/Zeilenhöhe/Farbe wie der
          // Export-body (WYSIWYG) — die Editor-Schrift (Inter) bleibt draußen.
          // Dieselben Tokens wie dort, Wert für Wert: exportMask.ts.
          style={{
            minHeight: 400,
            fontFamily: 'var(--se-font)',
            fontSize: 'var(--se-fs)',
            lineHeight: 'var(--se-lh)',
            color: 'var(--se-ink)',
          }}
        >
          <div
            // Wurzel = Rasterfläche (CSS-Grid): dieselben Werte benutzt der
            // Export (rasterFlaecheStyle) — WYSIWYG. Außen-Padding weiter aus
            // ROOT_FLOW. Hintergrund = Masken-Grundfarbe (--se-bg), NICHT
            // Editor-Chrome: die Fläche zeigt die Maske, wie sie exportiert wird.
            className="h-full min-h-0 overflow-auto"
            style={{
              ...rasterFlaecheStyle(),
              padding: ROOT_FLOW.padding,
              boxSizing: 'border-box',
              background: 'var(--se-bg)',
            }}
            onDragOver={onGridDragOver}
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
            {hauptseite && <NodeList parentId={ed.rootId} direction="column" raster />}
            {/* „Geist" (E2/E3): halbtransparente Vorschau der Zielzelle beim
                Bewegen (rasterMove) UND beim Einfügen aus der Bibliothek — rastet
                auf ganze Zellen. Reine Editor-Hilfe, nie Teil des Baums. */}
            {hauptseite && dropTarget?.kind === 'raster' && dropTarget.parentId === ed.rootId && (
              <div
                aria-hidden
                data-ff-editor-helper
                style={{
                  ...rasterItemStyle({
                    x: dropTarget.x,
                    y: dropTarget.y,
                    w: dropTarget.w,
                    h: dropTarget.h,
                  }),
                  pointerEvents: 'none',
                  background: 'hsl(var(--ring) / 0.16)',
                  border: '2px dashed hsl(var(--ring))',
                  borderRadius: 4,
                }}
              />
            )}
          </div>
          {/* Leerzustand (R1): sagt, was zu tun ist — reine Editor-Hilfe,
              nie Teil des Baums; pointer-events-none lässt Drops durch. */}
          {hauptseite && ed.blockCount === 0 && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-1.5 rounded-md border border-dashed border-border bg-card/70 px-8 py-6 text-center font-sans">
                <MousePointerClick size={18} className="text-muted-foreground/60" />
                <p className="text-[0.8125rem] font-medium text-foreground/80">Leere Maske</p>
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

// Außen-Vertrag: diese Namen waren immer von hier
// importierbar — sie wohnen jetzt in dndState, bleiben aber re-exportiert.
export type { DropTarget }
export { DndContext }
