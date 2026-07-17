// useBlockResize
// Größenziehen am Block (Aufräumen A3 — wörtlich aus BlockHost.tsx gezogen):
// Breite/Höhe ziehen (Anfasser rechts bzw. unten): eine Geste = eine
// Transaktion = 1 Undo. Die Geste selbst lebt seit dem Zieh-Mechanik-Paket
// (2026-07-17) in zieheGroesse — der Popup-Anfasser (PopupSeite) war der
// echte zweite Fall, der das Teilen erzwungen hat (Regel 10). Hier bleibt
// nur das Block-Spezifische: Ist-Größe messen, Achse aus der Prop.

import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'
import type { BlockNode } from '../../core/blocks/BlockData'
import type { Editor } from '../../state/Editor'
import { zieheGroesse } from './zieheGroesse'

export function useBlockResize(
  editor: Editor,
  blockRef: RefObject<BlockNode>,
  elementRef: RefObject<HTMLElement | null>,
) {
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

  return startResize
}
