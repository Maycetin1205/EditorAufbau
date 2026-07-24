// useBlockResize
// Größenziehen am Block (wörtlich aus BlockHost.tsx gezogen):
// Breite/Höhe ziehen (Anfasser rechts bzw. unten): eine Geste = eine
// Transaktion = 1 Undo. Die Geste selbst lebt seit dem Zieh-Mechanik-Paket
// (2026-07-17) in zieheGroesse — der Popup-Anfasser (PopupSeite) war der
// echte zweite Fall, der das Teilen erzwungen hat (Regel 10). Hier bleibt
// nur das Block-Spezifische: Ist-Größe messen, Achse aus der Prop.

import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'
import type { BlockNode } from '../../core/blocks/BlockData'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { RASTER, parseRasterPos, rasterSpecOf } from '../../core/blocks/rasterLayout'
import type { Editor } from '../../state/Editor'
import { zieheGroesse } from './zieheGroesse'

export function useBlockResize(
  editor: Editor,
  blockRef: RefObject<BlockNode>,
  elementRef: RefObject<HTMLElement | null>,
  rootRef: RefObject<HTMLElement | null>,
) {
  // Fluss-Modus (unverändert): Ist-Größe des Elements in px messen, px ziehen.
  function startResize(
    e: ReactPointerEvent<HTMLDivElement>,
    prop: 'width' | 'height',
    min: number,
  ) {
    const host = elementRef.current
    if (!host) return
    zieheGroesse(editor, e, {
      achse: prop === 'width' ? 'x' : 'y',
      prop,
      getId: () => blockRef.current.id,
      start: host.getBoundingClientRect()[prop],
      min,
    })
  }

  // Raster-Modus (E3, E1-Nachtrag Fix 2): der Anfasser rastet auf GANZE Zellen
  // (rasterW/rasterH). Der Zielwert ist eine Zellenzahl, nicht px. Als Zell-
  // Pitch (schritt) dient die GEMESSENE Ist-Größe je Zelle des Blocks: rootRef
  // füllt die Grid-Zelle in beiden Achsen (display:block + height:100%), also
  // ist pitch = (Ist-Maß + gap) / aktuelle Zellenzahl. Das Messen bleibt auch
  // bei fester Spaltenbreite korrekt (misst die Ist-Größe des Blocks direkt).
  // Untergrenze aus der Registry.
  function startRasterResize(e: ReactPointerEvent<HTMLDivElement>, achse: 'x' | 'y') {
    const el = rootRef.current
    if (!el) return
    const node = blockRef.current
    const pos = parseRasterPos(node.props)
    const spec = rasterSpecOf(getBlockDefinition(node.type))
    const rect = el.getBoundingClientRect()
    if (achse === 'x') {
      zieheGroesse(editor, e, {
        achse: 'x',
        prop: 'rasterW',
        getId: () => blockRef.current.id,
        start: pos.w,
        min: Math.max(1, spec.minW),
        schritt: (rect.width + RASTER.gapPx) / pos.w,
        // Breiter-Ziehen setzt die Zellbreite; Nachbarn bleiben stehen (Entscheidung B).
        anwenden: (id, wert) => editor.resizeNodeToCells(id, 'x', wert),
      })
    } else {
      zieheGroesse(editor, e, {
        achse: 'y',
        prop: 'rasterH',
        getId: () => blockRef.current.id,
        start: pos.h,
        min: Math.max(1, spec.minH),
        schritt: (rect.height + RASTER.gapPx) / pos.h,
        // Höher-Ziehen setzt die Zellhöhe; Nachbarn bleiben stehen (Entscheidung B).
        anwenden: (id, wert) => editor.resizeNodeToCells(id, 'y', wert),
      })
    }
  }

  return { startResize, startRasterResize }
}
