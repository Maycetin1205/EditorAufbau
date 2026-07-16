// useBlockResize
// Größenziehen am Block (Aufräumen A3 — wörtlich aus BlockHost.tsx gezogen):
// Breite/Höhe ziehen (Anfasser rechts bzw. unten): eine Geste = eine
// Transaktion = 1 Undo. Gemeinsame Mechanik, nur Achse + Prop wechseln.
// (Der Popup-Fenster-Anfasser in PopupSeite bleibt bewusst eigenständig —
// zentriertes Fenster, 2×delta — bis ein echter zweiter Fall das Teilen
// erzwingt, Regel 10.)

import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'
import type { BlockNode } from '../../core/blocks/BlockData'
import type { Editor } from '../../state/Editor'

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
    e.preventDefault()
    e.stopPropagation()
    const host = elementRef.current
    if (!host) return
    const startPos = prop === 'width' ? e.clientX : e.clientY
    const startSize = host.getBoundingClientRect()[prop]
    editor.beginTransaction()
    const onMove = (ev: PointerEvent) => {
      const pos = prop === 'width' ? ev.clientX : ev.clientY
      const next = Math.max(min, Math.round(startSize + pos - startPos))
      editor.updateProperty(blockRef.current.id, prop, next)
    }
    const onUp = () => {
      editor.endTransaction()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return startResize
}
