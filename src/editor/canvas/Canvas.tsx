// Canvas
// Sichtbare Arbeitsfläche. Rendert die Kinder der Wurzel im FLUSS (Spalte).
// Platzierung per Drag-and-Drop: Blöcke umsortieren, mit Einfüge-Linie als
// Vorschau, wo der Block landet. Klick auf leere Stelle = Auswahl aufheben.
// (Verschachtelte Container folgen im nächsten Schritt.)

import { Fragment, useState, type DragEvent } from 'react'
import { useEditor } from '../../state/useEditor'
import { BlockHost } from './BlockHost'

function InsertionLine() {
  return (
    <div
      style={{
        alignSelf: 'stretch',
        height: 2,
        borderRadius: 2,
        background: 'hsl(221 83% 53%)',
      }}
    />
  )
}

export function Canvas() {
  const ed = useEditor()
  const nodes = ed.childNodesOf(ed.rootId)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  const resetDrag = () => {
    setDragId(null)
    setDropIndex(null)
  }

  const onItemDragOver = (e: DragEvent, index: number) => {
    if (dragId === null) return
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const after = e.clientY > rect.top + rect.height / 2
    setDropIndex(after ? index + 1 : index)
  }

  const onContainerDragOver = (e: DragEvent) => {
    if (dragId === null) return
    e.preventDefault()
    setDropIndex(nodes.length) // unter dem letzten Block
  }

  const onDrop = () => {
    if (dragId !== null && dropIndex !== null) {
      ed.moveNode(dragId, ed.rootId, dropIndex)
    }
    resetDrag()
  }

  return (
    <div
      onClick={() => ed.selectBlock(null)}
      className="relative h-full w-full overflow-auto rounded-lg border border-border bg-card shadow-sm"
      style={{ minHeight: 400 }}
    >
      {nodes.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
          <p className="text-sm font-medium text-foreground">Leere Canvas</p>
          <p className="text-xs text-muted-foreground">
            Links einen Block wählen, um zu starten.
          </p>
        </div>
      )}
      <div
        className="flex min-h-full flex-col items-start gap-3 p-4"
        onDragOver={onContainerDragOver}
        onDrop={onDrop}
      >
        {nodes.map((node, i) => (
          <Fragment key={node.id}>
            {dropIndex === i && <InsertionLine />}
            <div
              draggable
              onDragStart={(e) => {
                setDragId(node.id)
                e.dataTransfer.effectAllowed = 'move'
              }}
              onDragOver={(e) => onItemDragOver(e, i)}
              onDragEnd={resetDrag}
              style={{ opacity: dragId === node.id ? 0.4 : 1 }}
            >
              <BlockHost
                block={node}
                selected={ed.selectedId === node.id}
                onSelect={() => ed.selectBlock(node.id)}
              />
            </div>
          </Fragment>
        ))}
        {dropIndex === nodes.length && <InsertionLine />}
      </div>
    </div>
  )
}
