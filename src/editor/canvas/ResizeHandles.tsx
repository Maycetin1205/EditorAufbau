// ResizeHandles
// Acht kleine Quadrate an den Kanten und Ecken eines selektierten Blocks.
// Pointer-Down auf einem Handle startet einen Resize-Vorgang: window-Listener fangen
// pointermove/pointerup ab und schreiben live in editor.updateLayout.
// stopPropagation verhindert dass dnd-kit den Klick als Drag-Start interpretiert.

import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import type { BlockData } from '../../core/blocks/BlockData'
import { useEditor } from '../../state/useEditor'

type Direction = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

const MIN_SIZE = 30
const HANDLE_SIZE = 10
const HALF = HANDLE_SIZE / 2

const HANDLE_STYLES: Record<Direction, CSSProperties> = {
  nw: { top: -HALF, left: -HALF, cursor: 'nwse-resize' },
  n: { top: -HALF, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
  ne: { top: -HALF, right: -HALF, cursor: 'nesw-resize' },
  e: { top: '50%', right: -HALF, transform: 'translateY(-50%)', cursor: 'ew-resize' },
  se: { bottom: -HALF, right: -HALF, cursor: 'nwse-resize' },
  s: { bottom: -HALF, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
  sw: { bottom: -HALF, left: -HALF, cursor: 'nesw-resize' },
  w: { top: '50%', left: -HALF, transform: 'translateY(-50%)', cursor: 'ew-resize' },
}

const ALL_DIRECTIONS = Object.keys(HANDLE_STYLES) as Direction[]

interface ResizeHandlesProps {
  block: BlockData
}

export function ResizeHandles({ block }: ResizeHandlesProps) {
  const ed = useEditor()

  const startResize = (direction: Direction) => (e: ReactPointerEvent<HTMLDivElement>) => {
    // Drag von dnd-kit + onClick im Eltern-Div nicht ausloesen.
    e.stopPropagation()
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const start = { ...block.layout }

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      let x = start.x
      let y = start.y
      let width = start.width
      let height = start.height

      if (direction.includes('e')) width = start.width + dx
      if (direction.includes('w')) {
        width = start.width - dx
        x = start.x + dx
      }
      if (direction.includes('s')) height = start.height + dy
      if (direction.includes('n')) {
        height = start.height - dy
        y = start.y + dy
      }

      // Mindestgroesse: width/height clampen, x/y konsistent halten.
      if (width < MIN_SIZE) {
        width = MIN_SIZE
        if (direction.includes('w')) x = start.x + start.width - MIN_SIZE
      }
      if (height < MIN_SIZE) {
        height = MIN_SIZE
        if (direction.includes('n')) y = start.y + start.height - MIN_SIZE
      }
      // Canvas-Grenze links/oben: x,y nicht negativ. Wenn vorher gezogen wurde,
      // wird die "verlorene" Distanz von der Groesse abgezogen.
      if (x < 0) {
        width = width + x
        x = 0
      }
      if (y < 0) {
        height = height + y
        y = 0
      }

      ed.updateLayout(block.id, { x, y, width, height })
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <>
      {ALL_DIRECTIONS.map((dir) => (
        <div
          key={dir}
          onPointerDown={startResize(dir)}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            background: '#1971c2',
            border: '1px solid white',
            borderRadius: 2,
            zIndex: 10,
            ...HANDLE_STYLES[dir],
          }}
        />
      ))}
    </>
  )
}
