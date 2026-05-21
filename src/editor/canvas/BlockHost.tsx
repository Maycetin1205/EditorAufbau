// BlockHost
// Bruecke zwischen serialisierbarem BlockData (Editor-State) und Lit Web Component (View).
// Aussen-Div: dnd-kit Drag-Target, absolute Positionierung, Auswahl-Rahmen.
// Innen-Div: Container in den das Custom-Element imperativ gehaengt wird (so kommt
// die Lit-View nicht mit Reacts JSX-Diff in Konflikt).
// ResizeHandles werden als Geschwister gerendert wenn der Block selektiert ist.

import { useDraggable } from '@dnd-kit/core'
import { useEffect, useRef } from 'react'
import type { BlockData } from '../../core/blocks/BlockData'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { ResizeHandles } from './ResizeHandles'

interface BlockHostProps {
  block: BlockData
  selected?: boolean
  onSelect?: () => void
}

export function BlockHost({ block, selected, onSelect }: BlockHostProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const elementRef = useRef<HTMLElement | null>(null)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.id,
  })

  // Custom-Element erzeugen + an Container haengen. Nur abhaengig vom Typ.
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
    return () => {
      if (container.contains(el)) container.removeChild(el)
      elementRef.current = null
    }
  }, [block.type])

  // Props synchronisieren bei jeder BlockData-Aenderung.
  useEffect(() => {
    const el = elementRef.current
    if (!el) return
    for (const [key, value] of Object.entries(block.props)) {
      ;(el as unknown as Record<string, unknown>)[key] = value
    }
  }, [block.props])

  // transform von dnd-kit waehrend des Drags. Null = nicht im Drag.
  const dragStyle = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : {}

  return (
    <div
      ref={setNodeRef}
      onClick={onSelect}
      {...listeners}
      {...attributes}
      style={{
        position: 'absolute',
        left: block.layout.x,
        top: block.layout.y,
        width: block.layout.width,
        height: block.layout.height,
        cursor: isDragging ? 'grabbing' : 'grab',
        border: selected ? '2px solid #1971c2' : '2px solid transparent',
        borderRadius: 4,
        background: isDragging ? 'rgba(25,113,194,0.05)' : 'transparent',
        boxSizing: 'border-box',
        userSelect: 'none',
        touchAction: 'none',
        ...dragStyle,
      }}
    >
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
      />
      {selected && <ResizeHandles block={block} />}
    </div>
  )
}
