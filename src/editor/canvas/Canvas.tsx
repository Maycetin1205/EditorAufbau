import { useCallback, useMemo, useState, type DragEvent } from 'react'
import { ROOT_ID } from '../../core/blocks/BlockData'
import { ROOT_FLOW } from '../../core/blocks/flowLayout'
import { randPlatzLinks } from '../../core/blocks/maskenRand'
import { rasterFlaecheStyle, rasterItemStyle } from '../../core/blocks/rasterLayout'
import { useEditor } from '../../state/useEditor'
import { NodeList } from './CanvasNode'
import { LeerHinweis } from './LeerHinweis'
import { isNewBlockDrag } from './dnd'
import { commitDrop, DndContext, gleichesZiel, type DndState, type DropTarget } from './dndState'
import { rasterZiel } from './rasterDnd'
import { PopupSeite } from './PopupSeite'

export function Canvas() {
  const ed = useEditor()
  const [dragId, setDragId] = useState<string | null>(null)
  const [dropTarget, merkeDropTarget] = useState<DropTarget | null>(null)

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

  const onGridDragOver = (e: DragEvent) => {
    if (dragId === null && !isNewBlockDrag(e.dataTransfer)) return
    e.preventDefault()
    setDropTarget(rasterZiel(e, ed, dnd, ed.rootId, e.currentTarget as HTMLElement))
  }

  const aktiveSeite = ed.pages.find((p) => p.id === ed.activePageId)
  const flaeche = aktiveSeite?.istFlaeche ?? true

  const randLinks = randPlatzLinks(ed.tree)

  return (
    <DndContext.Provider value={dnd}>
      <div className="flex h-full w-full flex-col">
        <div
          onClick={() => ed.selectBlock(null)}

          className="relative min-h-0 w-full flex-1 overflow-hidden rounded-md border border-border bg-card shadow-[0_1px_2px_rgba(40,30,20,0.10),0_6px_14px_-6px_rgba(40,30,20,0.16),0_26px_50px_-24px_rgba(40,30,20,0.38)]"

          style={{
            minHeight: 400,
            fontFamily: 'var(--se-font)',
            fontSize: 'var(--se-fs)',
            lineHeight: 'var(--se-lh)',
            color: 'var(--se-ink)',
          }}
        >
          <div

            className="h-full min-h-0 overflow-auto"
            style={{
              ...rasterFlaecheStyle(),
              padding: ROOT_FLOW.padding,
              paddingLeft: ROOT_FLOW.padding + randLinks,
              boxSizing: 'border-box',
              background: 'var(--se-bg)',
            }}
            onDragOver={onGridDragOver}
            onDrop={(e) => {
              e.preventDefault()
              commitDrop(e, ed, dnd)
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                setDropTarget(null)
              }
            }}
          >
            {flaeche && <NodeList parentId={ed.rootId} direction="column" raster />}

            {flaeche && ed.rootId !== ROOT_ID && (
              <NodeList parentId={ROOT_ID} direction="column" raster nurRand />
            )}

            {flaeche && dropTarget?.kind === 'raster' && dropTarget.parentId === ed.rootId && (
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

          {flaeche && ed.childNodesOf(ed.rootId).length === 0 && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <LeerHinweis
                titel={aktiveSeite?.istHauptseite ? 'Leere Maske' : `Leere Seite „${aktiveSeite?.name ?? ''}“`}
              />
            </div>
          )}
          {!flaeche && <PopupSeite popupId={ed.activePageId} />}
        </div>
      </div>
    </DndContext.Provider>
  )
}

export type { DropTarget }
export { DndContext }
