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
// Bindungs-Picker (useBindingPicker), Größenziehen
// (useBlockResize) und die React↔Lit-Übergabestelle (useLitElement)
// wohnen in eigenen Hooks daneben.

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { MouseEvent as ReactMouseEvent } from 'react'
import type { BlockNode } from '../../core/blocks/BlockData'
import {
  bindingProp,
  type BindableSpot,
  type ListenBindung,
} from '../../core/blocks/BlockDefinition'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { rasterSpecOf } from '../../core/blocks/rasterLayout'
import { useEditorInstance } from '../../state/EditorContext'
import { useDataSources } from '../../state/useDataSources'
import { FieldPicker } from './FieldPicker'
import { bindingCode, useBindingPicker } from './useBindingPicker'
import { useBlockResize } from './useBlockResize'
import { useLitElement } from './useLitElement'

interface BlockHostProps {
  block: BlockNode
  selected?: boolean
  onSelect?: () => void
  // true = der Block sitzt auf einer Rasterfläche (oberste Ebene / Popup-Rumpf):
  // die Größe-Anfasser ziehen dann rasterW/rasterH mit Zellen-Snap statt der
  // Fluss-Maße width/height. INNERHALB von Containern (Fluss) false.
  raster?: boolean
  // Kind-Hosts (nur für Container-Blöcke; vom Canvas rekursiv erzeugt).
  children?: ReactNode
}

// Stabile leere Liste, damit der Props-Effekt nicht bei jedem Render neu
// läuft, nur weil `?? []` eine frische Referenz erzeugt hätte.
const KEINE_SPOTS: readonly BindableSpot[] = []

// --- Bindbare Listen, generisch (siehe ListenBindung) ---------------------
// Der BlockHost darf KEINEN Baustein importieren (Regel 2). Deshalb liest er
// die Liste hier ueber die im Registry-Eintrag genannten Schluessel statt
// ueber die Typen der Tabelle.

// Titel eines noch unbenannten Eintrags aus der Vorlage ('Spalte {n}').
function standardTitel(b: ListenBindung, index: number): string {
  return b.standardTitel.replace('{n}', String(index + 1))
}

// Die Listen-Prop defensiv als Eintragsliste lesen — alte Staende koennen
// reine Strings enthalten (der Baustein selbst faengt das ebenfalls ab).
function listeLesen(roh: unknown, b: ListenBindung): Record<string, unknown>[] {
  if (!Array.isArray(roh)) return []
  return roh.map((x, i) => {
    if (x && typeof x === 'object') return { ...(x as Record<string, unknown>) }
    return {
      [b.titelKey]: typeof x === 'string' ? x : standardTitel(b, i),
      [b.feldKey]: '',
    }
  })
}

export function BlockHost({ block, selected, onSelect, raster = false, children }: BlockHostProps) {
  // Instanz aus dem Versorger statt Weltvariable — bewusst
  // OHNE Abo (useEditorInstance): der Host rendert wie bisher über den
  // Canvas neu, exakt die alte Semantik des direkten Imports.
  const editor = useEditorInstance()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const def = getBlockDefinition(block.type)
  const isContainer = def?.acceptsChildren ?? false
  // Datenquelle in Reichweite — nur für Blöcke mit bindbaren
  // Stellen relevant. BlockHost rendert bei jeder Store-Änderung neu (Canvas
  // abonniert den Store) UND bei Vorlagen-Änderungen (die Bibliothek
  // ist editierbar — die Klarnamen-Vorschau muss sofort nachziehen).
  useDataSources()
  const bindableSpots = def?.bindableSpots ?? KEINE_SPOTS
  const dataSource = (bindableSpots.length > 0 || def?.acceptsDataSource)
    ? editor.dataSourceFor(block.id)
    : undefined
  // Aktuellen Knoten in einer Ref halten, damit einmal registrierte
  // Event-Listener immer mit dem aktuellen Stand laufen.
  const blockRef = useRef<BlockNode>(block)
  useLayoutEffect(() => {
    blockRef.current = block
  })

  // React↔Lit-Übergabestelle: Erzeugen/Props/Aufräumen — useLitElement.
  const { containerRef, elementRef, element } = useLitElement({
    editor,
    blockRef,
    block,
    selected,
    bindableSpots,
    dataSource,
    raster,
  })

  // ---- Klick-auf-Stelle-Binding ----
  const { picker, closePicker, onClick, onDoubleClick } = useBindingPicker({
    editor,
    blockRef,
    selected,
    bindableSpots,
    dataSource,
    onSelect,
  })

  // ---- Feld-Picker fuer bindbare LISTEN ----
  // Ein Baustein mit `listenBindung` (Registry) meldet per Custom Event
  // `ff-listen-bind`, dass der Bediener einen Listen-Eintrag an ein Feld
  // binden will — die Tabelle tut das an ihren Spaltenkoepfen. Der BlockHost
  // kennt WEDER die Tabelle NOCH „Spalten": er liest Prop-Name und Schluessel
  // aus dem Registry-Eintrag (Regel 2 — Faehigkeiten sind Registry-Eintraege).
  const listenBindung = def?.listenBindung
  const [listenPicker, setListenPicker] = useState<{
    index: number
    top: number
    left: number
  } | null>(null)
  const closeListenPicker = useCallback(() => setListenPicker(null), [])
  if (!selected && listenPicker !== null) setListenPicker(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el || !listenBindung) return
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        prop?: string
        index?: number
        top?: number
        left?: number
      }
      // Nur die eigene Liste bedienen (ein Baustein koennte spaeter mehrere haben).
      if (detail?.prop !== listenBindung.prop || typeof detail.index !== 'number') return
      setListenPicker({
        index: detail.index,
        top: Math.max(8, detail.top ?? 0),
        left: Math.max(8, Math.min(detail.left ?? 0, window.innerWidth - 248)),
      })
    }
    el.addEventListener('ff-listen-bind', handler)
    return () => el.removeEventListener('ff-listen-bind', handler)
  }, [containerRef, listenBindung])

  // Breite/Höhe ziehen (Anfasser rechts bzw. unten) — useBlockResize.
  // startResize = Fluss (px, misst das Element); startRasterResize = Raster
  // (Zellen-Snap, misst den Grid-Platz über rootRef).
  const { startResize, startRasterResize } = useBlockResize(editor, blockRef, elementRef, rootRef)

  const resizable = def?.resizableWidth ?? true
  const heightResizable = def?.resizableHeight === true

  // Musterkarte (templateChild in der Registry): KEIN sichtbares
  // Etikett (docs/decisions/2026-07-16-karte-empfang-anatomie.md). Die
  // Markierung steuert nur das Kreuzchen: die Musterkarte hat keins
  // (Löschschutz, s. onRemoveClick).
  const templateMark = editor.templateMarkFor(block.id)

  // Kreuzchen: Entfernen direkt am Block, Rückfrage nur wenn
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
        // height:100% reicht eine feste Höhe vom Canvas-Wrapper bis
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
            editor.updateProperty(blockRef.current.id, bindingProp(picker.spot.prop), code)
            closePicker()
          }}
          onClose={closePicker}
        />
      )}
      {selected && listenPicker && dataSource && listenBindung && (() => {
        const liste = listeLesen(block.props[listenBindung.prop], listenBindung)
        const eintrag = liste[listenPicker.index]
        if (!eintrag) return null
        const titelJetzt = String(eintrag[listenBindung.titelKey] ?? '')
        return (
          <FieldPicker
            spotLabel={titelJetzt}
            sourceName={dataSource.name}
            fields={dataSource.fields}
            current={String(eintrag[listenBindung.feldKey] ?? '')}
            top={listenPicker.top}
            left={listenPicker.left}
            onPick={(code) => {
              const next = listeLesen(block.props[listenBindung.prop], listenBindung)
              const ziel = next[listenPicker.index]
              if (ziel) {
                // Der Titel des Bedieners ist heilig: nur ein NIE angefasster
                // Titel (exakt die Standard-Vorlage) darf zum Feld-Klarnamen
                // werden. Wer „Kunde" getippt hat, behaelt „Kunde" — auch nach
                // dem Binden. (Fehler der Erstfassung: sie ueberschrieb immer.)
                const standard = standardTitel(listenBindung, listenPicker.index)
                const unberuehrt = titelJetzt === '' || titelJetzt === standard
                if (unberuehrt) {
                  ziel[listenBindung.titelKey] = code === ''
                    ? standard
                    : dataSource.fields.find((f) => f.code === code)?.label ?? code
                }
                ziel[listenBindung.feldKey] = code
                editor.updateProperty(block.id, listenBindung.prop, next)
              }
              closeListenPicker()
            }}
            onClose={closeListenPicker}
          />
        )
      })()}
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
      {/* Raster-Anfasser (E1-Nachtrag Fix 2): auf der Rasterfläche ziehen
          rechts = Breite, unten = Höhe je in GANZEN Zellen (rasterW/rasterH),
          Doppelklick setzt die Startgröße des Bausteins. Alle Blöcke sind hier
          in Breite UND Höhe ziehbar — das ist der Sinn des Rasters; die
          Fluss-Beschränkungen (resizableWidth/Height) gelten nur im Fluss. */}
      {selected && raster && (
        <>
          <div
            draggable={false}
            onPointerDown={(e) => startRasterResize(e, 'x')}
            onDragStart={(e) => e.preventDefault()}
            onDoubleClick={(e) => {
              e.stopPropagation()
              const spec = rasterSpecOf(getBlockDefinition(blockRef.current.type))
              editor.updateProperty(blockRef.current.id, 'rasterW', spec.startW)
            }}
            title="Breite ziehen (rastet auf Zellen) · Doppelklick: Startgröße"
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
          <div
            draggable={false}
            onPointerDown={(e) => startRasterResize(e, 'y')}
            onDragStart={(e) => e.preventDefault()}
            onDoubleClick={(e) => {
              e.stopPropagation()
              const spec = rasterSpecOf(getBlockDefinition(blockRef.current.type))
              editor.updateProperty(blockRef.current.id, 'rasterH', spec.startH)
            }}
            title="Höhe ziehen (rastet auf Zellen) · Doppelklick: Startgröße"
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
        </>
      )}
      {selected && !raster && resizable && (
        <div
          draggable={false}
          onPointerDown={(e) => startResize(e, 'width', 40)}
          onDragStart={(e) => e.preventDefault()}
          onDoubleClick={(e) => {
            // Zurück zur Standard-Breite des Bausteins direkt am Anfasser —
            // die Breite hat seit 2026-07-14 KEIN Inspector-Feld mehr
            // (Nutzer-Anweisung: nur was sich nicht zeigen
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
      {selected && !raster && heightResizable && (
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

// Editor-Hilfe "Plus-Knopf" (aus der Registry: addChildButton).
// Ein kleiner Anstecker am Wrapper-Rand (Muster Kreuzchen), bewusst NIE im
// Baustein selbst (er stähle dem Baustein Platz — WYSIWYG-Bruch; Herkunft:
// docs/decisions/2026-07-10-editor-hilfen.md), sichtbar NUR wenn die
// Auswahl im Teilbaum des Containers liegt — ein unselektierter Baustein
// sieht im Editor exakt aus wie im Export.
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
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        padding: '0 7px',
        border: '1px solid hsl(var(--border))',
        borderRadius: 4,
        background: 'hsl(var(--card))',
        color: 'hsl(var(--muted-foreground))',
        fontSize: 11,
        fontWeight: 500,
        lineHeight: 1,
        cursor: 'pointer',
        boxShadow: '0 1px 2px hsl(var(--foreground) / 0.06)',
      }}
    >
      + {label}
    </button>
  )
}
