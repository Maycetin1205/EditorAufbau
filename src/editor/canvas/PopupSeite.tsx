// PopupSeite
// Die Popup-Seitenansicht des Canvas (wörtlich aus
// Canvas.tsx gezogen): das Popup-Element füllt die Fläche (Abdunklung +
// Fenster kommen aus dem Baustein selbst — 1 Render-Quelle); dazu
// Editor-Anfasser für breite/hoehe am zentrierten Fenster. Das Fenster ist
// zentriert, darum wächst es beim Ziehen um 2×delta (die Kante bleibt
// unter dem Zeiger).
//
// Seit C2 (2026-08-16) ist der Popup-Rumpf eine RASTERFLÄCHE wie die
// Hauptfläche: dieselbe Zell-Platzierung, derselbe Geist, dieselben
// Anfasser — nur das Grid-Element liegt im Schatten des Bausteins und wird
// darum über `flaecheIn` gesucht statt über einen React-Ref.

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { DIALOG_RAND, DIALOG_SCHLIESSEN_EVENT } from '../../blocks/shared/DialogRahmen'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { rasterItemStyle } from '../../core/blocks/rasterLayout'
import { useEditor } from '../../state/useEditor'
import { BlockHost } from './BlockHost'
import { NodeList } from './CanvasNode'
import { isNewBlockDrag } from './dnd'
import { commitDrop, useDnd } from './dndState'
import { rasterZiel } from './rasterDnd'
import { flaecheIn } from './rasterFlaeche'
import { zieheGroesse } from './zieheGroesse'

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
  // s. DialogRahmen max-width/height). Die Anfasser müssen an der SICHTBAREN
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
  // Das Dialogkopf-X in der Editor-Vorschau (C1): der Baustein selbst tut
  // im Editor nichts (er kennt den Editor nicht) und lässt das
  // Schließen-Ereignis des DialogRahmens steigen (composed) — HIER heißt
  // „schließen" zurück zur Hauptseite. Gelöscht wird über das X nie.
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
  const breite = popupZahl(node.props.breite, 520)
  const hoehe = popupZahl(node.props.hoehe, 380)
  // EXAKT die Fenster-Regel des Rahmens (max: Fläche − DIALOG_RAND, dieselbe
  // Konstante wie im DialogRahmen-CSS, den das Popup seit C1 komponiert) —
  // nur ein kleiner Greif-Mindestwert, damit die Anfasser nie zusammenfallen.
  const sichtbareBreite = stage ? Math.min(breite, Math.max(40, stage.b - DIALOG_RAND)) : breite
  const sichtbareHoehe = stage ? Math.min(hoehe, Math.max(40, stage.h - DIALOG_RAND)) : hoehe

  // Dieselbe Geste wie am Block (zieheGroesse) — nur die Daten sind anders:
  // zentriertes Fenster => Faktor 2 (die Kante bleibt unter dem Zeiger).
  const startResize = (
    e: ReactPointerEvent<HTMLDivElement>,
    prop: 'breite' | 'hoehe',
    start: number,
    min: number,
  ) => {
    zieheGroesse(ed, e, {
      achse: prop === 'breite' ? 'x' : 'y',
      prop,
      getId: () => node.id,
      start,
      min,
      faktor: 2,
    })
  }

  const def = getBlockDefinition(node.type)
  const standard = def?.defaultProps ?? {}
  // Das Gitter des Popup-Rumpfs. Es liegt im Schatten des Bausteins, ist also
  // nicht per React-Ref zu haben — gefragt wird der Baustein selbst
  // (flaecheIn). Zum Zeitpunkt eines dragover steht er längst im DOM.
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
        // Popup-Rumpf = Rasterfläche: die Zielzelle unter dem Zeiger (rasterZiel
        // prüft dabei auch, ob das Popup den gezogenen Typ überhaupt aufnimmt —
        // ohne das zeigte die Fläche für eine Kanban-Karte oder -Spalte
        // (allowedParentTypes!) eine Vorschau, ed.moveNode/addBlock lehnten den
        // Drop danach still ab, und der Bediener sah seinen Baustein einfach
        // verschwinden; Regel 4: nichts scheitert still).
        if (dnd.dragId === null && !isNewBlockDrag(e.dataTransfer)) return
        const gridEl = rumpf()
        if (!gridEl) return
        e.preventDefault()
        dnd.setDropTarget(rasterZiel(e, ed, dnd, node.id, gridEl))
      }}
      onDragLeave={(e) => {
        // Nur zurücksetzen, wenn der Zeiger die Fläche wirklich verlässt
        // (gleiche Regel wie auf der Hauptfläche, Canvas).
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
        {/* „Geist": Vorschau der Zielzelle. Er gehört INS Gitter, wird also
            wie die Bausteine in den Rumpf geslottet (BlockHost-Kind) — läge er
            daneben, zeigte er auf die falschen Pixel. Reine Editor-Hilfe, nie
            Teil des Baums. */}
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
