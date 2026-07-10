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
import type { BindableSpot } from '../../core/blocks/BlockDefinition'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { editor } from '../../state/Editor'
import { useDataSources } from '../../state/useDataSources'
import { FieldPicker } from './FieldPicker'

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

// Stabile leere Liste, damit der Props-Effekt nicht bei jedem Render neu
// läuft, nur weil `?? []` eine frische Referenz erzeugt hätte.
const KEINE_SPOTS: readonly BindableSpot[] = []

// Gebundener Feldcode einer Stelle ('' = ungebunden) — Bindung liegt per
// Konvention in der Prop `<prop>Field` (siehe BindableSpot).
function bindingCode(props: Record<string, unknown>, spot: BindableSpot): string {
  const code = props[`${spot.prop}Field`]
  return typeof code === 'string' ? code : ''
}

export function BlockHost({ block, selected, onSelect, children }: BlockHostProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  // Ref = Schreibziel für DOM-Properties; State = Render-Trigger fürs Portal
  // (das Portal-Ziel muss beim Rendern bekannt sein, eine Ref reicht dafür nicht).
  const elementRef = useRef<HTMLElement | null>(null)
  const [element, setElement] = useState<HTMLElement | null>(null)
  const def = getBlockDefinition(block.type)
  const isContainer = def?.acceptsChildren ?? false
  // Datenquelle in Reichweite (Kap. 5.2) — nur für Blöcke mit bindbaren
  // Stellen relevant. BlockHost rendert bei jeder Store-Änderung neu (Canvas
  // abonniert den Store) UND bei Vorlagen-Änderungen (Kap. 5.4: Bibliothek
  // ist editierbar — Beispielwerte/Klarnamen müssen sofort nachziehen).
  useDataSources()
  const bindableSpots = def?.bindableSpots ?? KEINE_SPOTS
  const dataSource = bindableSpots.length > 0 ? editor.dataSourceFor(block.id) : undefined
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
    // Editor-Kennung (Kap. 5.2): schaltet editor-exklusives Block-CSS frei
    // (Daten-Markierung gebundener Stellen). Der Export setzt sie nie.
    el.setAttribute('data-ff-editor', '')
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
    // Beispieldaten-Vorschau (Kap. 5.2): gebundene Stellen zeigen den
    // Beispielwert ihres Felds statt des statischen Texts — nur die ANZEIGE
    // (DOM-Properties), der Baum bleibt unberührt. Ist die Bindung nicht
    // auflösbar (keine Quelle in Reichweite / Feld nicht im Wörterbuch),
    // zeigt die Stelle ihren statischen Text ohne Markierung; die Bindung
    // selbst bleibt gespeichert und lebt wieder auf, sobald die Quelle
    // zurückkommt.
    for (const spot of bindableSpots) {
      const code = block.props[`${spot.prop}Field`]
      if (typeof code !== 'string' || code === '') continue
      const field = dataSource?.fields.find((f) => f.code === code)
      if (field) {
        elAny[spot.prop] = field.sample
      } else {
        elAny[`${spot.prop}Field`] = ''
      }
    }
    elAny.editable = !!selected
  }, [element, block.props, selected, bindableSpots, dataSource])

  // ---- Klick-auf-Stelle-Binding (Kap. 5.2, Bedienlogik 3) ----
  // Klick auf eine bindbare Stelle des SCHON selektierten Blocks öffnet den
  // Feld-Picker. Verzögert (Timer), damit ein Doppelklick (= Inline-Edit
  // einer ungebundenen Stelle) den Picker nicht zusätzlich aufreißt.
  const [picker, setPicker] = useState<{ spot: BindableSpot; top: number; left: number } | null>(null)
  const pickerTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearPickerTimer = () => {
    if (pickerTimer.current) {
      clearTimeout(pickerTimer.current)
      pickerTimer.current = null
    }
  }

  useEffect(() => clearPickerTimer, [])
  // Auswahl weg → Picker weg (State-Anpassung beim Rendern, kein Effect
  // nötig — react.dev "adjusting state when props change").
  if (!selected && picker !== null) setPicker(null)

  // Die angeklickte Stelle aus dem composedPath (Stellen liegen im Shadow
  // DOM des Blocks; der Block annotiert sie mit data-ff-spot=<prop>).
  function spotAt(e: ReactMouseEvent<HTMLDivElement>): { spot: BindableSpot; el: HTMLElement } | null {
    if (bindableSpots.length === 0) return null
    for (const t of e.nativeEvent.composedPath()) {
      if (t === e.currentTarget) return null
      if (t instanceof HTMLElement && t.hasAttribute('data-ff-spot')) {
        const spot = bindableSpots.find((s) => s.prop === t.getAttribute('data-ff-spot'))
        return spot ? { spot, el: t } : null
      }
    }
    return null
  }

  // Picker-Position: direkt unter der Stelle, relativ zum Host-Wrapper
  // (position:relative — der Absolut-Anker).
  function pickerPos(spotEl: HTMLElement): { top: number; left: number } | null {
    const rootRect = rootRef.current?.getBoundingClientRect()
    if (!rootRect) return null
    const spotRect = spotEl.getBoundingClientRect()
    return { top: spotRect.bottom - rootRect.top + 4, left: spotRect.left - rootRect.left }
  }

  function onClick(e: ReactMouseEvent<HTMLDivElement>) {
    e.stopPropagation() // Klick auf Elternteile / Canvas (= andere Auswahl) nicht auslösen
    onSelect?.()
    clearPickerTimer()
    // Erst selektieren, dann binden: der Picker öffnet nur am Block, der
    // beim Klick schon selektiert war — und nur mit Quelle in Reichweite.
    if (!selected || !dataSource) return
    if (e.detail > 1) return // Teil eines Doppelklicks — der entscheidet.
    const hit = spotAt(e)
    if (!hit) return
    const pos = pickerPos(hit.el)
    if (!pos) return
    pickerTimer.current = setTimeout(() => {
      pickerTimer.current = null
      if (editor.selectedId === blockRef.current.id) {
        setPicker({ spot: hit.spot, ...pos })
      }
    }, 300)
  }

  // Doppelklick auf eine GEBUNDENE Stelle: ihr Text kommt aus Daten, Inline-
  // Edit lässt das Event durch (BasicBlock) — stattdessen sofort den Picker.
  function onDoubleClick(e: ReactMouseEvent<HTMLDivElement>) {
    clearPickerTimer()
    if (!selected || !dataSource) return
    const hit = spotAt(e)
    if (!hit || bindingCode(blockRef.current.props, hit.spot) === '') return
    e.stopPropagation()
    const pos = pickerPos(hit.el)
    if (pos) setPicker({ spot: hit.spot, ...pos })
  }

  // Breite/Höhe ziehen (Anfasser rechts bzw. unten): eine Geste = eine
  // Transaktion = 1 Undo. Gemeinsame Mechanik, nur Achse + Prop wechseln.
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

  const resizable = def?.resizableWidth ?? true
  const heightResizable = def?.resizableHeight === true

  // Musterkarten-Markierung (P1.1): die Laufzeit-Vorlage des Boards
  // (templateChild in der Registry) dezent kennzeichnen — reine
  // Editor-Hilfe im Wrapper, taucht im Export nie auf.
  const templateMark = editor.templateMarkFor(block.id)

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
      ref={rootRef}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      data-block-id={block.id}
      style={{
        // Immer 'block': das gerenderte Element ist :host{display:block} —
        // ein inline-block-Wrapper würde in streckenden Containern
        // (Kanban-Spalte) schmaler sitzen als der Export (WYSIWYG-Bruch).
        display: 'block',
        position: 'relative',
        // height:100% reicht eine feste Höhe (P1.3) vom Canvas-Wrapper bis
        // zum Element durch (:host{height:100%} beim Kanban). Ohne feste
        // Höhe löst sich 100% zu auto auf — kein Block ändert sich.
        height: '100%',
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
          height: '100%',
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
          ? createPortal(children, element)
          : null}
      </div>
      {selected && picker && dataSource && (
        <FieldPicker
          spotLabel={picker.spot.label}
          sourceName={dataSource.name}
          fields={dataSource.fields}
          current={bindingCode(block.props, picker.spot)}
          top={picker.top}
          left={picker.left}
          onPick={(code) => {
            editor.updateProperty(blockRef.current.id, `${picker.spot.prop}Field`, code)
            setPicker(null)
          }}
          onClose={() => setPicker(null)}
        />
      )}
      {def?.addChildButton
        && editor.selectedId !== null
        && editor.isInSubtree(block.id, editor.selectedId) && (
        <AddChildButton
          label={def.addChildButton.label}
          childType={def.addChildButton.childType}
          parentId={block.id}
        />
      )}
      {templateMark && (
        <div
          style={{
            position: 'absolute',
            top: -8,
            left: 8,
            padding: '0 6px',
            borderRadius: 4,
            background: 'hsl(var(--ring))',
            color: '#fff',
            fontSize: 9.5,
            fontWeight: 700,
            lineHeight: '15px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            pointerEvents: 'none',
          }}
        >
          {templateMark}
        </div>
      )}
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
          onPointerDown={(e) => startResize(e, 'width', 40)}
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
      {selected && heightResizable && (
        <div
          draggable={false}
          onPointerDown={(e) => startResize(e, 'height', 120)}
          onDragStart={(e) => e.preventDefault()}
          title="Höhe ziehen"
          style={{
            position: 'absolute',
            bottom: -4,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 26,
            height: 7,
            borderRadius: 4,
            background: 'hsl(var(--ring))',
            cursor: 'ns-resize',
          }}
        />
      )}
    </div>
  )
}

// Editor-Hilfe "Plus-Knopf" (Bedienlogik 5, aus der Registry: addChildButton).
// P1.1b (Nutzer-Beschwerde 2026-07-10): kein Platzfresser mehr IM Baustein
// (die alte 180px-Kachel stahl den Kanban-Spalten Breite — WYSIWYG-Bruch).
// Jetzt ein kleiner Anstecker am Wrapper-Rand (Muster Kreuzchen), sichtbar
// NUR wenn die Auswahl im Teilbaum des Containers liegt — ein unselektierter
// Baustein sieht im Editor exakt aus wie im Export.
interface AddChildButtonProps {
  label: string
  childType: string
  parentId: string
}

function AddChildButton({ label, childType, parentId }: AddChildButtonProps) {
  return (
    <button
      type="button"
      data-ff-editor-helper
      draggable={false}
      onClick={(e) => {
        e.stopPropagation()
        editor.addBlock(childType, parentId)
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onDragStart={(e) => { e.preventDefault(); e.stopPropagation() }}
      style={{
        position: 'absolute',
        top: -9,
        right: 14,
        height: 18,
        padding: '0 8px',
        border: 'none',
        borderRadius: 9999,
        background: 'hsl(var(--ring))',
        color: '#fff',
        fontSize: 10,
        fontWeight: 700,
        lineHeight: '18px',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        cursor: 'pointer',
      }}
    >
      ＋ {label}
    </button>
  )
}
