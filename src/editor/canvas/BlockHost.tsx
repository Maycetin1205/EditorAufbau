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
//
// Aufräumen A3: Bindungs-Picker (useBindingPicker) und Größenziehen
// (useBlockResize) wohnen in eigenen Hooks daneben.

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { MouseEvent as ReactMouseEvent } from 'react'
import type { BlockNode } from '../../core/blocks/BlockData'
import type { BindableSpot } from '../../core/blocks/BlockDefinition'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { useEditorInstance } from '../../state/EditorContext'
import { useDataSources } from '../../state/useDataSources'
import { FieldPicker } from './FieldPicker'
import { bindingCode, useBindingPicker } from './useBindingPicker'
import { useBlockResize } from './useBlockResize'

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

export function BlockHost({ block, selected, onSelect, children }: BlockHostProps) {
  // A2 (Aufräum.md): Instanz aus dem Versorger statt Weltvariable — bewusst
  // OHNE Abo (useEditorInstance): der Host rendert wie bisher über den
  // Canvas neu, exakt die alte Semantik des direkten Imports.
  const editor = useEditorInstance()
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
  // ist editierbar — die Klarnamen-Vorschau muss sofort nachziehen).
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
    // editor ist app-lebenslang stabil (Provider) — der Effekt läuft
    // weiterhin nur bei Typwechsel.
  }, [block.type, editor])

  useEffect(() => {
    const el = elementRef.current
    if (!el) return
    const elAny = el as unknown as Record<string, unknown>
    for (const [key, value] of Object.entries(block.props)) {
      elAny[key] = value
    }
    // Bindungs-Vorschau (Kap. 5.2, revidiert 2026-07-10): gebundene Stellen
    // zeigen den KLARNAMEN ihres Felds statt des statischen Texts — keine
    // erfundenen Beispielwerte. Nur die ANZEIGE (DOM-Properties), der Baum
    // bleibt unberührt. Ist die Bindung nicht auflösbar (keine Quelle in
    // Reichweite / Feld nicht im Wörterbuch), zeigt die Stelle ihren
    // statischen Text ohne Markierung; die Bindung selbst bleibt gespeichert
    // und lebt wieder auf, sobald die Quelle zurückkommt.
    for (const spot of bindableSpots) {
      const code = block.props[`${spot.prop}Field`]
      if (typeof code !== 'string' || code === '') continue
      const field = dataSource?.fields.find((f) => f.code === code)
      if (field) {
        elAny[spot.prop] = field.label
      } else {
        elAny[`${spot.prop}Field`] = ''
      }
    }
    elAny.editable = !!selected
  }, [element, block.props, selected, bindableSpots, dataSource])

  // ---- Klick-auf-Stelle-Binding (Kap. 5.2, Bedienlogik 3) ----
  const { picker, closePicker, onClick, onDoubleClick } = useBindingPicker({
    editor,
    blockRef,
    selected,
    bindableSpots,
    dataSource,
    onSelect,
  })

  // Breite/Höhe ziehen (Anfasser rechts bzw. unten) — useBlockResize.
  const startResize = useBlockResize(editor, blockRef, elementRef)

  const resizable = def?.resizableWidth ?? true
  const heightResizable = def?.resizableHeight === true

  // Musterkarte (P1.1, templateChild in der Registry): KEIN sichtbares
  // Etikett mehr (Nutzer-Entscheidung 2026-07-16 — der frühere
  // „Muster"-Anstecker ist raus). Die Markierung steuert nur noch das
  // Kreuzchen: die Musterkarte hat keins (Löschschutz, s. onRemoveClick).
  const templateMark = editor.templateMarkFor(block.id)

  // Kreuzchen (Bedienlogik 5): Entfernen direkt am Block, Rückfrage nur wenn
  // er Inhalte trägt. Die Musterkarte selbst zeigt gar kein Kreuzchen (s. u.);
  // ein Teilbaum, der sie enthält (Spalte), erklärt den Schutz statt still
  // nichts zu tun — der Store erzwingt ihn zusätzlich (removeBlock).
  function onRemoveClick(e: ReactMouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    const node = blockRef.current
    if (editor.isRemoveProtected(node.id)) {
      window.alert(
        'Hier liegt die Musterkarte — aus ihr entstehen die Datenkarten, sie kann nicht gelöscht werden. Ziehe sie erst in eine andere Spalte.',
      )
      return
    }
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
            closePicker()
          }}
          onClose={closePicker}
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
      {selected && !templateMark && (
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
          onDoubleClick={(e) => {
            // Zurück zur Standard-Breite des Bausteins direkt am Anfasser —
            // die Breite hat seit 2026-07-14 KEIN Inspector-Feld mehr
            // (Nutzer-Anweisung + Bedienlogik 6: nur was sich nicht zeigen
            // lässt, steht im Inspector). Ohne das Zurücksetzen käme ein
            // einmal gezogener Block nie wieder auf "Füllen"/"Automatisch".
            e.stopPropagation()
            const standard = getBlockDefinition(blockRef.current.type)?.defaultProps.width ?? 'auto'
            editor.updateProperty(blockRef.current.id, 'width', standard)
          }}
          title="Breite ziehen · Doppelklick: Standard"
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
          onDoubleClick={(e) => {
            // Zurück zum Block-Standard direkt am Anfasser — die Höhe hat
            // BEWUSST kein Inspector-Feld (Kanban-Standard = fill).
            e.stopPropagation()
            const standard = getBlockDefinition(blockRef.current.type)?.defaultProps.height ?? 'auto'
            editor.updateProperty(blockRef.current.id, 'height', standard)
          }}
          title="Höhe ziehen · Doppelklick: Standard"
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
  const editor = useEditorInstance()
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
