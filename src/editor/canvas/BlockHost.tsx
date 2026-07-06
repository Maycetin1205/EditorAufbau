// BlockHost
// Brücke zwischen serialisierbarem BlockNode (Editor-State) und Lit Web Component (View).
// Flow-Modell: kein absolutes Positionieren mehr — der Block sitzt im Fluss
// seines Containers und nimmt seine natürliche Größe ein. Der Host umrahmt ihn
// nur für Auswahl/Hover.
//
// Datenfluss:
//   - props werden als DOM-Properties gesetzt (Lit-Setter greifen).
//   - CustomEvent 'ff-prop-change' wird abgefangen und schreibt zurück in den
//     Editor-Store (Inline-Doppelklick-Edit auf gerenderten Texten).
//
// Container (acceptsChildren): React-Kinder werden per Portal als Light-DOM in
// das Custom Element gelegt — der <slot> des Blocks nimmt sie auf. Damit
// rendert der Editor rekursiv verschachtelte Bäume, ohne dass der Baustein
// etwas vom Editor weiß. Gestrichelter Rahmen + Platzhalter sind reine
// Editor-Hilfen und leben hier, NICHT im Baustein (WYSIWYG).

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import type { BlockNode } from '../../core/blocks/BlockData'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { parseFlowWidth } from '../../core/blocks/flowLayout'
import { editor } from '../../state/Editor'

interface BlockHostProps {
  block: BlockNode
  selected?: boolean
  onSelect?: () => void
  // Kind-Hosts (nur für Container-Blöcke; vom Canvas rekursiv erzeugt).
  children?: ReactNode
}

interface PropChangeDetail {
  attr: string
  value: unknown
}

export function BlockHost({ block, selected, onSelect, children }: BlockHostProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const width = parseFlowWidth(block.props.width)
  // Ref = Schreibziel für DOM-Properties; State = Render-Trigger fürs Portal
  // (das Portal-Ziel muss beim Rendern bekannt sein, eine Ref reicht dafür nicht).
  const elementRef = useRef<HTMLElement | null>(null)
  const [element, setElement] = useState<HTMLElement | null>(null)
  const def = getBlockDefinition(block.type)
  const isContainer = def?.acceptsChildren ?? false
  // Gestrichelter Rahmen + Mindesthöhe nur für FREIE Container (Bereich):
  // sie haben kein eigenes Aussehen und wären sonst unsichtbar. Container
  // mit fester Kind-Typ-Liste (Kanban-Board/-Spalte) bringen ihr Design
  // selbst mit (WYSIWYG) — keine Editor-Hilfe darüberlegen.
  const showsContainerFrame = isContainer && def?.allowedChildTypes === null
  // Aktuellen Knoten in einer Ref halten, damit einmal registrierte
  // Event-Listener immer mit dem aktuellen Stand laufen.
  const blockRef = useRef<BlockNode>(block)
  useLayoutEffect(() => {
    blockRef.current = block
  })

  useEffect(() => {
    const def = getBlockDefinition(block.type)
    if (!def) {
      console.warn(`BlockHost: keine BlockDefinition für Typ "${block.type}"`)
      return
    }
    const container = containerRef.current
    if (!container) return
    const el = document.createElement(def.tagName)
    container.appendChild(el)
    elementRef.current = el
    setElement(el)

    // Inline-Doppelklick-Edit: Block emittiert 'ff-prop-change' { attr, value },
    // der Host schreibt das in den Store. Der Baustein bleibt editor-blind.
    // 'ff-prop-change' ist bubbles+composed; in verschachtelten Bereichen
    // erreicht das Event eines Kindes auch die Listener der Eltern-Hosts.
    // Nur das eigene Element behandeln, sonst schreibt der Bereich die
    // Prop des Kindes zusätzlich auf sich selbst.
    const onPropChange = (e: Event) => {
      if (e.target !== el) return
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
      setElement(null)
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
  }, [element, block.props, selected])

  function onClick(e: ReactMouseEvent<HTMLDivElement>) {
    e.stopPropagation() // Klick auf Elternteile / Canvas (= andere Auswahl) nicht auslösen
    onSelect?.()
  }

  // Breite ziehen (Anfasser rechts): eine Geste = eine Transaktion = 1 Undo.
  function onResizeStart(e: ReactPointerEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    const host = elementRef.current
    if (!host) return
    const startX = e.clientX
    const startWidth = host.getBoundingClientRect().width
    editor.beginTransaction()
    const onMove = (ev: PointerEvent) => {
      const next = Math.max(40, Math.round(startWidth + ev.clientX - startX))
      editor.updateProperty(blockRef.current.id, 'width', next)
    }
    const onUp = () => {
      editor.endTransaction()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const resizable = def?.resizableWidth ?? true

  // Kreuzchen (Bedienlogik 5): Entfernen direkt am Baustein — mit Rückfrage,
  // wenn er belegt ist. Nur an Containern; einfache Blöcke laufen über die
  // Toolbar (dort ohne Rückfrage, Undo reicht als Netz).
  function onRemove(e: ReactMouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    const count = blockRef.current.childIds.length
    if (count > 0) {
      const name = def?.displayName ?? blockRef.current.type
      const ok = window.confirm(
        `„${name}" enthält ${count} Element${count === 1 ? '' : 'e'} — wirklich löschen?`,
      )
      if (!ok) return
    }
    editor.removeBlock(blockRef.current.id)
  }

  return (
    <div
      onClick={onClick}
      data-block-id={block.id}
      style={{
        display: isContainer || width !== 'auto' ? 'block' : 'inline-block',
        position: 'relative',
        cursor: selected ? 'default' : 'pointer',
        outline: selected ? '2px solid hsl(var(--ring))' : '2px solid transparent',
        outlineOffset: 1,
        borderRadius: 6,
        userSelect: 'none',
      }}
    >
      <div
        ref={containerRef}
        style={{
          pointerEvents: 'auto',
          // Editor-Hilfe für freie Container: Fläche sichtbar + treffbar machen.
          // Bewusst OHNE Erklärtext und OHNE eigenes Padding — die Kinder
          // sollen exakt dort sitzen, wo sie im Export sitzen (WYSIWYG).
          ...(showsContainerFrame
            ? {
                border: '1.5px dashed hsl(220 13% 78%)',
                borderRadius: 4,
                minHeight: 40,
              }
            : null),
        }}
      >
        {element && isContainer && children != null
          ? createPortal(children, element)
          : null}
      </div>
      {selected && isContainer && (
        <button
          type="button"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          onClick={onRemove}
          aria-label="Entfernen"
          title="Entfernen"
          style={{
            position: 'absolute',
            right: -8,
            top: -8,
            width: 18,
            height: 18,
            borderRadius: 9,
            border: 'none',
            background: 'hsl(var(--destructive))',
            color: 'hsl(var(--destructive-foreground))',
            font: '700 11px/1 system-ui, sans-serif',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            padding: 0,
          }}
        >
          ×
        </button>
      )}
      {selected && resizable && (
        <div
          draggable={false}
          onPointerDown={onResizeStart}
          onDragStart={(e) => e.preventDefault()}
          title="Breite ziehen"
          style={{
            position: 'absolute',
            right: -4,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 7,
            height: 26,
            borderRadius: 4,
            background: 'hsl(var(--ring))',
            cursor: 'ew-resize',
          }}
        />
      )}
    </div>
  )
}
