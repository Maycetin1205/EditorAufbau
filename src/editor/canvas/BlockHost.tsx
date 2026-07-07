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

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import type { BlockNode } from '../../core/blocks/BlockData'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { resolveChildDirection, type FlowDirection } from '../../core/blocks/flowLayout'
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
  // Ref = Schreibziel für DOM-Properties; State = Render-Trigger fürs Portal
  // (das Portal-Ziel muss beim Rendern bekannt sein, eine Ref reicht dafür nicht).
  const elementRef = useRef<HTMLElement | null>(null)
  const [element, setElement] = useState<HTMLElement | null>(null)
  const def = getBlockDefinition(block.type)
  const isContainer = def?.acceptsChildren ?? false
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

  // Kreuzchen (Bedienlogik 5): Entfernen direkt am Block, Rückfrage nur wenn
  // er Inhalte trägt.
  function onRemoveClick(e: ReactMouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    const node = blockRef.current
    const n = node.childIds.length
    if (
      n > 0
      && !window.confirm(
        `„${def?.displayName ?? node.type}" mit ${n} ${n === 1 ? 'Element' : 'Elementen'} darin löschen?`,
      )
    ) return
    editor.removeBlock(node.id)
  }

  return (
    <div
      onClick={onClick}
      data-block-id={block.id}
      style={{
        // Immer 'block': das gerenderte Element ist :host{display:block} —
        // ein inline-block-Wrapper würde in streckenden Containern
        // (Kanban-Spalte) schmaler sitzen als der Export (WYSIWYG-Bruch).
        display: 'block',
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
          // Editor-Hilfe für Container: Fläche sichtbar + treffbar machen.
          // Bewusst OHNE Erklärtext und OHNE eigenes Padding — die Kinder
          // sollen exakt dort sitzen, wo sie im Export sitzen (WYSIWYG).
          // Blöcke mit eigenem sichtbarem Rahmen (Kanban) schalten die
          // Hilfe per containerHint=false ab.
          ...(isContainer && def?.containerHint !== false
            ? {
                border: '1.5px dashed hsl(220 13% 78%)',
                borderRadius: 4,
                minHeight: 40,
              }
            : null),
        }}
      >
        {element && isContainer && children != null
          ? createPortal(
              <>
                {children}
                {def?.addChildButton && (
                  <AddChildButton
                    label={def.addChildButton.label}
                    childType={def.addChildButton.childType}
                    direction={resolveChildDirection(def, block.props)}
                    parentId={block.id}
                  />
                )}
              </>,
              element,
            )
          : null}
      </div>
      {selected && (
        <button
          type="button"
          aria-label="Entfernen"
          title="Entfernen"
          onClick={onRemoveClick}
          onPointerDown={(e) => e.stopPropagation()}
          onDragStart={(e) => { e.preventDefault(); e.stopPropagation() }}
          style={{
            position: 'absolute',
            top: -9,
            right: -9,
            width: 18,
            height: 18,
            padding: 0,
            border: 'none',
            borderRadius: 9999,
            background: 'hsl(var(--ring))',
            color: '#fff',
            fontSize: 12,
            lineHeight: '16px',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
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

// Editor-Hilfe "Plus-Knopf" (Bedienlogik 5, aus der Registry: addChildButton).
// Liegt als Light-DOM-Kind im Slot des Containers, ist aber KEIN Block:
// data-ff-editor-helper hält ihn aus Zählern (Kanban-Spalte) und dem Export
// heraus. Aussehen nach Zielbild (stilprobe: .zb-add / .zb-addcol) — im
// Zeilen-Fluss (Board) als gestrichelte Spalten-Kachel, im Spalten-Fluss als
// flacher Knopf in voller Breite.
interface AddChildButtonProps {
  label: string
  childType: string
  direction: FlowDirection
  parentId: string
}

function AddChildButton({ label, childType, direction, parentId }: AddChildButtonProps) {
  const row = direction === 'row'
  const style: CSSProperties = row
    ? {
        flex: '0 0 180px',
        border: '1.5px dashed var(--se-line)',
        borderRadius: 'var(--se-r-lg)',
        background: 'transparent',
        color: 'var(--se-faint)',
        padding: '14px 0',
      }
    : {
        width: '100%',
        border: '1px solid var(--se-line)',
        borderRadius: 'var(--se-r-sm)',
        background: 'var(--se-panel)',
        color: 'var(--se-muted)',
        padding: '6px 0',
      }
  return (
    <button
      type="button"
      data-ff-editor-helper
      draggable={false}
      onClick={(e) => {
        e.stopPropagation()
        editor.addBlock(childType, parentId)
      }}
      onDragStart={(e) => { e.preventDefault(); e.stopPropagation() }}
      style={{
        ...style,
        fontFamily: 'var(--se-font)',
        fontSize: 11.5,
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        textAlign: 'center',
        cursor: 'pointer',
      }}
    >
      ＋ {label}
    </button>
  )
}
