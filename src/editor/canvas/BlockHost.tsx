// BlockHost
// Bruecke zwischen serialisierbarem BlockData (Editor-State) und Lit Web Component (View).
// Aussen-Div: absolute Positionierung, Auswahl-Rahmen.
// Innen-Div: Container in den das Custom-Element imperativ gehaengt wird (so kommt
// die Lit-View nicht mit Reacts JSX-Diff in Konflikt).
//
// Datenfluss:
//   - props syncronisiert als DOM-Properties (Lit-Setter greifen).
//   - CustomEvent 'ff-prop-change' wird abgefangen und schreibt zurueck in
//     den Editor-Store (inline Doppelklick-Edit auf gerenderten Texten).

import { useEffect, useLayoutEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import type { BlockData } from '../../core/blocks/BlockData'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { editor } from '../../state/Editor'

interface BlockHostProps {
  block: BlockData
  selected?: boolean
  onSelect?: () => void
}

interface PropChangeDetail {
  attr: string
  value: unknown
}

export function BlockHost({ block, selected, onSelect }: BlockHostProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const elementRef = useRef<HTMLElement | null>(null)
  // Wir halten den aktuellen BlockData in einer Ref, damit Event-Listener
  // (registriert einmal beim Mount) immer mit dem aktuellen Stand laufen.
  const blockRef = useRef<BlockData>(block)
  useLayoutEffect(() => {
    blockRef.current = block
  })

  useEffect(() => {
    const def = getBlockDefinition(block.type)
    if (!def) {
      console.warn(`BlockHost: keine BlockDefinition fuer Typ "${block.type}"`)
      return
    }
    const container = containerRef.current
    if (!container) return
    const el = document.createElement(def.tagName)
    elementRef.current = el
    container.appendChild(el)

    // Inline-Doppelklick-Edit: Block emittiert 'ff-prop-change' mit
    // { attr, value } und der Host schreibt das in den Store. Damit bleibt
    // der Baustein editor-blind — er weiss nichts vom Store, nur vom Event.
    const onPropChange = (e: Event) => {
      const ce = e as CustomEvent<PropChangeDetail>
      const detail = ce.detail
      if (!detail || typeof detail.attr !== 'string') return
      editor.updateProperty(blockRef.current.id, detail.attr, detail.value)
    }
    el.addEventListener('ff-prop-change', onPropChange)

    return () => {
      el.removeEventListener('ff-prop-change', onPropChange)
      if (container.contains(el)) container.removeChild(el)
      elementRef.current = null
    }
  }, [block.type])

  useEffect(() => {
    const el = elementRef.current
    if (!el) return
    const elAny = el as unknown as Record<string, unknown>
    for (const [key, value] of Object.entries(block.props)) {
      elAny[key] = value
    }
    elAny.editable = !!selected
  }, [block.props, selected])

  // Verschieben per Maus/Stift. Wir nutzen die Store-Methode updateLayout (die
  // Architektur sah das Verschieben schon vor) und klammern die ganze Geste in
  // eine Transaktion, damit EIN Ziehen = EIN Undo-Schritt bleibt.
  // Reine Klicks (ohne Bewegung) erzeugen keinen Layout-/History-Eintrag, sodass
  // Auswaehlen und der Inline-Doppelklick-Edit unveraendert funktionieren.
  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return
    onSelect?.()

    const startX = e.clientX
    const startY = e.clientY
    const origX = blockRef.current.layout.x
    const origY = blockRef.current.layout.y
    const DRAG_THRESHOLD = 4
    let dragging = false

    const onMove = (ev: globalThis.PointerEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      if (!dragging) {
        if (Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return
        dragging = true
        editor.beginTransaction()
      }
      editor.updateLayout(blockRef.current.id, {
        x: Math.round(origX + dx),
        y: Math.round(origY + dy),
      })
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      if (dragging) editor.endTransaction()
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div
      onPointerDown={onPointerDown}
      style={{
        position: 'absolute',
        left: block.layout.x,
        top: block.layout.y,
        width: block.layout.width,
        height: block.layout.height,
        cursor: selected ? 'grab' : 'pointer',
        touchAction: 'none',
        border: selected ? '2px solid hsl(221 83% 53%)' : '2px solid transparent',
        borderRadius: 6,
        background: selected ? 'rgba(37,99,235,0.04)' : 'transparent',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}
    >
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
      />
    </div>
  )
}
