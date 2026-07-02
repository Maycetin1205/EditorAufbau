// Canvas
// Sichtbare Arbeitsfläche. Rendert den Block-Baum REKURSIV im Fluss:
// die Wurzel als Spalte, Container rendern ihre Kinder über BlockHost
// (Portal → Light-DOM → <slot> des Containers).
// Platzierung per Drag-and-Drop auf Wurzel-Ebene: Blöcke umsortieren, mit
// Einfüge-Linie als Vorschau. Klick auf leere Stelle = Auswahl aufheben.
// (Drop-Zonen zum Ziehen IN Container hinein folgen in Kap. 2.3.)

import { Fragment, useState, type DragEvent, type ReactNode } from 'react'
import type { BlockNode } from '../../core/blocks/BlockData'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { useEditor } from '../../state/useEditor'
import type { Editor } from '../../state/Editor'
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

// Rekursion: ein Knoten → BlockHost; Container bekommen ihre Kinder als
// React-Kinder mit (BlockHost portalt sie in den <slot> des Elements).
function renderNode(ed: Editor, node: BlockNode): ReactNode {
  const def = getBlockDefinition(node.type)
  const childNodes = def?.acceptsChildren ? ed.childNodesOf(node.id) : []
  return (
    <BlockHost
      key={node.id}
      block={node}
      selected={ed.selectedId === node.id}
      onSelect={() => ed.selectBlock(node.id)}
      hasChildren={childNodes.length > 0}
    >
      {childNodes.map((child) => renderNode(ed, child))}
    </BlockHost>
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
              style={{
                opacity: dragId === node.id ? 0.4 : 1,
                alignSelf: getBlockDefinition(node.type)?.acceptsChildren
                  ? 'stretch'
                  : undefined,
              }}
            >
              {renderNode(ed, node)}
            </div>
          </Fragment>
        ))}
        {dropIndex === nodes.length && <InsertionLine />}
      </div>
    </div>
  )
}
