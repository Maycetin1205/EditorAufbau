// Canvas
// Editor-Organ fuer die sichtbare Arbeitsflaeche.
// Rendert alle BlockData-Eintraege ueber BlockHost mit absoluter Positionierung.
// Drag-End rechnet das Delta des dnd-kit-Events auf die gespeicherte Layout-Position um.

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useEditor } from '../../state/useEditor'
import { BlockHost } from './BlockHost'

export function Canvas() {
  const ed = useEditor()

  // PointerSensor mit Distanz-Schwelle: Drag startet erst nach 4px Bewegung.
  // Ohne diese Schwelle frisst dnd-kit jeden Klick weg und der onClick-Handler
  // im BlockHost wird nie aufgerufen -> Auswahl per Klick funktioniert nicht.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  // dnd-kit liefert event.delta (Pixel-Differenz seit Drag-Start).
  // Wir addieren auf den aktuellen layout.x/y. Negativ wird auf 0 geklemmt,
  // damit der Block nicht aus der Canvas links/oben rausrutscht.
  const handleDragEnd = (event: DragEndEvent) => {
    const id = String(event.active.id)
    const block = ed.blocks.find((b) => b.id === id)
    if (!block) return
    const nextX = Math.max(0, block.layout.x + event.delta.x)
    const nextY = Math.max(0, block.layout.y + event.delta.y)
    ed.updateLayout(id, { x: nextX, y: nextY })
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div
        onClick={(e) => {
          // Nur wenn der Klick wirklich auf dem Canvas-Hintergrund landet,
          // nicht wenn er von einem Block hochblubbert.
          if (e.target === e.currentTarget) ed.selectBlock(null)
        }}
        style={{
          position: 'relative',
          minHeight: 400,
          padding: 8,
          border: '1px dashed #888',
          borderRadius: 4,
          background: '#fafafa',
          overflow: 'hidden',
        }}
      >
        {ed.blocks.map((block) => (
          <BlockHost
            key={block.id}
            block={block}
            selected={ed.selectedId === block.id}
            onSelect={() => ed.selectBlock(block.id)}
          />
        ))}
      </div>
    </DndContext>
  )
}
