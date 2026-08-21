import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { DIALOG_RAND, DIALOG_SCHLIESSEN_EVENT } from '../../blocks/shared/DialogRahmen'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { editorAngabenVon } from '../../core/blocks/editorAngaben'
import { rasterItemStyle } from '../../core/blocks/rasterLayout'
import { useEditor } from '../../state/useEditor'
import { BlockHost } from './BlockHost'
import { NodeList } from './CanvasNode'
import { LeerHinweis } from './LeerHinweis'
import { isNewBlockDrag } from './dnd'
import { commitDrop, useDnd } from './dndState'
import { rasterZiel } from './rasterDnd'
import { flaecheIn } from './rasterFlaeche'
import { zieheGroesse } from './zieheGroesse'

function popupZahl(v: unknown, fallback: number): number {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

function imRumpf(gridEl: HTMLElement, x: number, y: number): boolean {
  const r = gridEl.getBoundingClientRect()
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
}

export function PopupSeite({ popupId }: { popupId: string }) {
  const ed = useEditor()
  const dnd = useDnd()

  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [stage, setStage] = useState<{ b: number; h: number } | null>(null)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const beobachter = new ResizeObserver(() =>
      setStage({ b: el.clientWidth, h: el.clientHeight }))
    beobachter.observe(el)
    return () => beobachter.disconnect()
  }, [])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const zurHauptseite = (): void => { ed.setActivePage(ed.pages[0].id) }
    el.addEventListener(DIALOG_SCHLIESSEN_EVENT, zurHauptseite)
    return () => el.removeEventListener(DIALOG_SCHLIESSEN_EVENT, zurHauptseite)
  }, [ed])
  const node = ed.getNode(popupId)
  if (!node) return null
  const selected = ed.selectedId === node.id

  const def = getBlockDefinition(node.type)
  const standard = def?.defaultProps ?? {}

  // Wie dieser Seiten-Baustein gezogen wird, sagt er selbst. Diese Datei
  // rendert JEDE Fenster-Seitenart — Canvas.tsx entscheidet nur ueber
  // `istFlaeche` — und darf die Eigenschaftsnamen eines einzelnen Bausteins
  // nicht auswendig kennen (Regel 2). Bis 2026-08-21 standen hier `breite`,
  // `hoehe` und die vier Masse 240/160/520/380 direkt im Code, die zwei
  // Mindestmasse ein zweites Mal neben denen des Dialog-Rahmens.
  const zieh = editorAngabenVon(node.type).ziehbareGroesse

  const gesetzteGroesse = (prop: string, min: number): number =>
    popupZahl(node.props[prop], popupZahl(standard[prop], min))
  const aufFlaecheGeklemmt = (mass: number, flaeche: number | undefined): number =>
    flaeche === undefined ? mass : Math.min(mass, Math.max(40, flaeche - DIALOG_RAND))

  const sichtbareBreite = zieh
    ? aufFlaecheGeklemmt(gesetzteGroesse(zieh.breiteProp, zieh.minBreite), stage?.b)
    : 0
  const sichtbareHoehe = zieh
    ? aufFlaecheGeklemmt(gesetzteGroesse(zieh.hoeheProp, zieh.minHoehe), stage?.h)
    : 0

  const startResize = (
    e: ReactPointerEvent<HTMLDivElement>,
    achse: 'x' | 'y',
    prop: string,
    min: number,
    start: number,
  ) => {
    zieheGroesse(ed, e, { achse, prop, getId: () => node.id, start, min, faktor: zieh?.faktor })
  }

  const rumpf = (): HTMLElement | null =>
    flaecheIn(def ? wrapRef.current?.querySelector(def.tagName) : null)
  const geist = dnd.dropTarget?.kind === 'raster' && dnd.dropTarget.parentId === node.id
    ? dnd.dropTarget
    : null

  return (
    <div
      ref={wrapRef}
      style={{ position: 'absolute', inset: 0 }}
      onDragOver={(e) => {
        if (dnd.dragId === null && !isNewBlockDrag(e.dataTransfer)) return
        const gridEl = rumpf()
        if (!gridEl || !imRumpf(gridEl, e.clientX, e.clientY)) {
          dnd.setDropTarget(null)
          return
        }
        e.preventDefault()
        dnd.setDropTarget(rasterZiel(e, ed, dnd, node.id, gridEl))
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          dnd.setDropTarget(null)
        }
      }}
      onDrop={(e) => {
        e.preventDefault()
        commitDrop(e, ed, dnd)
      }}
    >
      <BlockHost
        block={node}
        selected={selected}
        onSelect={() => ed.selectBlock(node.id)}
      >
        <NodeList parentId={node.id} direction="column" raster />

        {geist && (
          <div
            aria-hidden
            data-ff-editor-helper
            style={{
              ...rasterItemStyle(geist),
              pointerEvents: 'none',
              background: 'hsl(var(--ring) / 0.16)',
              border: '2px dashed hsl(var(--ring))',
              borderRadius: 4,
            }}
          />
        )}
      </BlockHost>

      {ed.childNodesOf(node.id).length === 0 && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 20 }}
        >
          <LeerHinweis titel={`Leeres Fenster „${String(node.props.name ?? '')}“`} />
        </div>
      )}
      {selected && zieh && (
        <>
          <div
            draggable={false}
            data-ff-editor-helper
            onPointerDown={(e) =>
              startResize(e, 'x', zieh.breiteProp, zieh.minBreite, sichtbareBreite)}
            onDragStart={(e) => e.preventDefault()}
            onDoubleClick={(e) => {
              e.stopPropagation()
              ed.updateProperty(node.id, zieh.breiteProp, standard[zieh.breiteProp] ?? zieh.minBreite)
            }}
            title="Breite ziehen · Doppelklick: Standard"
            style={{
              position: 'absolute',
              left: `calc(50% + ${sichtbareBreite / 2}px - 3px)`,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 7,
              height: 26,
              borderRadius: 4,
              background: 'hsl(var(--ring))',
              cursor: 'ew-resize',
              zIndex: 20,
            }}
          />
          <div
            draggable={false}
            data-ff-editor-helper
            onPointerDown={(e) =>
              startResize(e, 'y', zieh.hoeheProp, zieh.minHoehe, sichtbareHoehe)}
            onDragStart={(e) => e.preventDefault()}
            onDoubleClick={(e) => {
              e.stopPropagation()
              ed.updateProperty(node.id, zieh.hoeheProp, standard[zieh.hoeheProp] ?? zieh.minHoehe)
            }}
            title="Höhe ziehen · Doppelklick: Standard"
            style={{
              position: 'absolute',
              left: '50%',
              top: `calc(50% + ${sichtbareHoehe / 2}px - 3px)`,
              transform: 'translateX(-50%)',
              width: 26,
              height: 7,
              borderRadius: 4,
              background: 'hsl(var(--ring))',
              cursor: 'ns-resize',
              zIndex: 20,
            }}
          />
        </>
      )}
    </div>
  )
}
