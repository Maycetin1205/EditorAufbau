// PopupSeite
// Die Popup-Seitenansicht des Canvas (P-A; Aufräumen A3 — wörtlich aus
// Canvas.tsx gezogen): das Popup-Element füllt die Fläche (Abdunklung +
// Fenster kommen aus dem Baustein selbst — 1 Render-Quelle); dazu
// Editor-Anfasser für breite/hoehe am zentrierten Fenster. Das Fenster ist
// zentriert, darum wächst es beim Ziehen um 2×delta (die Kante bleibt
// unter dem Zeiger).

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { POPUP_RAND } from '../../blocks/popup/PopupBlock'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { useEditor } from '../../state/useEditor'
import { BlockHost } from './BlockHost'
import { NodeList } from './CanvasNode'
import { isNewBlockDrag } from './dnd'
import { commitDrop, useDnd } from './dndState'

// Mindest- und Standardgröße des Popup-Fensters (Anfasser, P-A).
const POPUP_MIN_BREITE = 240
const POPUP_MIN_HOEHE = 160

function popupZahl(v: unknown, fallback: number): number {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export function PopupSeite({ popupId }: { popupId: string }) {
  const ed = useEditor()
  const dnd = useDnd()
  // Bühnengröße (die Fläche, in der das Fenster zentriert): das Fenster
  // begrenzt sich auf „Bühne minus 24px" (dieselbe Regel wie in der Maske,
  // s. PopupBlock max-width/height). Die Anfasser müssen an der SICHTBAREN
  // Kante sitzen — sonst wären sie bei eingeklemmtem Fenster außerhalb der
  // Fläche abgeschnitten und ein zu großes Popup ließe sich nie verkleinern.
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
  const node = ed.getNode(popupId)
  if (!node) return null
  const selected = ed.selectedId === node.id
  const breite = popupZahl(node.props.breite, 520)
  const hoehe = popupZahl(node.props.hoehe, 380)
  // EXAKT die Fenster-Regel des Bausteins (max: Fläche − POPUP_RAND, dieselbe
  // Konstante wie im PopupBlock-CSS — P-C) — nur ein kleiner Greif-
  // Mindestwert, damit die Anfasser nie zusammenfallen.
  const sichtbareBreite = stage ? Math.min(breite, Math.max(40, stage.b - POPUP_RAND)) : breite
  const sichtbareHoehe = stage ? Math.min(hoehe, Math.max(40, stage.h - POPUP_RAND)) : hoehe

  const startResize = (
    e: ReactPointerEvent<HTMLDivElement>,
    prop: 'breite' | 'hoehe',
    start: number,
    min: number,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    const startPos = prop === 'breite' ? e.clientX : e.clientY
    ed.beginTransaction()
    const onMove = (ev: PointerEvent) => {
      const pos = prop === 'breite' ? ev.clientX : ev.clientY
      ed.updateProperty(node.id, prop, Math.max(min, Math.round(start + (pos - startPos) * 2)))
    }
    const onUp = () => {
      ed.endTransaction()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const standard = getBlockDefinition(node.type)?.defaultProps ?? {}

  return (
    <div
      ref={wrapRef}
      style={{ position: 'absolute', inset: 0 }}
      onDragOver={(e) => {
        // Freie Fläche der Popup-Seite: Drop ans Ende des Popup-Rumpfs.
        if (dnd.dragId === null && !isNewBlockDrag(e.dataTransfer)) return
        e.preventDefault()
        dnd.setDropTarget({ parentId: node.id, index: ed.childNodesOf(node.id).length })
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
        <NodeList parentId={node.id} direction="column" />
      </BlockHost>
      {selected && (
        <>
          <div
            draggable={false}
            data-ff-editor-helper
            onPointerDown={(e) => startResize(e, 'breite', sichtbareBreite, POPUP_MIN_BREITE)}
            onDragStart={(e) => e.preventDefault()}
            onDoubleClick={(e) => {
              e.stopPropagation()
              ed.updateProperty(node.id, 'breite', standard.breite ?? 520)
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
            onPointerDown={(e) => startResize(e, 'hoehe', sichtbareHoehe, POPUP_MIN_HOEHE)}
            onDragStart={(e) => e.preventDefault()}
            onDoubleClick={(e) => {
              e.stopPropagation()
              ed.updateProperty(node.id, 'hoehe', standard.hoehe ?? 380)
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
