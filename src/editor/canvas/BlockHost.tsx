// BlockHost
// Bruecke zwischen serialisierbarem BlockData (Editor-State) und Lit Web Component (View).
// 1) Beim Mount: schaut tagName aus Registry, erzeugt das Custom-Element, haengt es in den Container.
// 2) Bei BlockData.props-Aenderung: syncronisiert alle Props auf das Element (Lit re-rendert intern).
// 3) Beim Unmount: entfernt das Element.

import { useEffect, useRef } from 'react'
import type { BlockData } from '../../core/blocks/BlockData'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'

interface BlockHostProps {
  block: BlockData
  selected?: boolean
  onSelect?: () => void
}

export function BlockHost({ block, selected, onSelect }: BlockHostProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const elementRef = useRef<HTMLElement | null>(null)

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

  // Props synchronisieren bei jeder BlockData-Aenderung (immutable Update -> neue Referenz).
  useEffect(() => {
    const el = elementRef.current
    if (!el) return
    for (const [key, value] of Object.entries(block.props)) {
      ;(el as unknown as Record<string, unknown>)[key] = value
    }
  }, [block.props])

  return (
    <div
      ref={containerRef}
      onClick={onSelect}
      style={{
        display: 'inline-block',
        cursor: 'pointer',
        padding: 4,
        margin: 4,
        border: selected ? '2px solid #1971c2' : '2px solid transparent',
        borderRadius: 4,
      }}
    />
  )
}
