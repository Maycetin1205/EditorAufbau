// BlockHost
// Brücke zwischen serialisierbarem BlockNode (Editor-State) und Lit Web Component (View).
// Der Host umrahmt den Block nur für Auswahl/Hover; positioniert wird nie
// absolut in Pixeln.
//
// ZWEI Lagen, je nachdem wo der Block hängt (bis 2026-08-10 nannte dieser
// Kopf nur die erste, obwohl die Datei seit dem Raster `rasterSpecOf`
// importiert):
//   - im Fluss seines Containers, mit natürlicher Größe — Popup-Inhalt,
//     Zeile, Gruppe, Karte, Kanban;
//   - auf der Rasterfläche der obersten Ebene, mit Zellen aus rasterLayout.
// Welche der beiden gilt, entscheidet heute die Elternschaft. Eine zentrale
// Abfrage dafür gibt es noch nicht — sie ist Etappe C2.
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
// Feld-Bindung (useFeldBindung — beide Picker), Größenziehen
// (useBlockResize) und die React↔Lit-Übergabestelle (useLitElement)
// wohnen in eigenen Dateien daneben.

import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { MouseEvent as ReactMouseEvent } from 'react'
import type { BlockNode } from '../../core/blocks/BlockData'
import {
  quellenAufloesen,
  WEITERE_QUELLEN_PROP,
  type QuelleInReichweite,
} from '../../core/data/sourceLinks'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { rasterSpecOf } from '../../core/blocks/rasterLayout'
import { bindbareStellenVon, traegtEigeneQuelle } from '../../core/blocks/treeQuery'
import { useEditorInstance } from '../../state/EditorContext'
import { loescheBaustein } from '../../state/loescheBaustein'
import { quellenTraeger } from '../../state/quellenOps'
import { useDataSources } from '../../state/useDataSources'
import { useFeldBindung } from './FeldBindung'
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

const KEINE_QUELLEN: readonly QuelleInReichweite[] = []

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
  const quellenBibliothek = useDataSources()
  // Die Stellen, die an DIESEM Baustein gerade bindbar sind
  // (bindbareStellenVon): am Nachschlage-Feld gehört seine Wert-Stelle nicht
  // dazu — dort entsteht der Wert im Fenster, ein Klick darauf dürfte keinen
  // Bindungs-Picker öffnen.
  //
  // Gemerkt am KNOTEN: die Liste haengt allein an Typ und Props dieses
  // Bausteins, und der Baum ersetzt beim Aendern genau den einen Knoten. Ein
  // Tastendruck in einem ANDEREN Baustein laesst diese Liste damit in Ruhe —
  // und weil sie in den Abhaengigkeiten des Props-Effekts (useLitElement)
  // steht, laeuft der Effekt dann auch nicht mehr mit.
  const bindableSpots = useMemo(() => bindbareStellenVon(block), [block])
  // ALLE Quellen in Reichweite (erste zuerst) — der Picker bietet die Felder
  // jeder davon an, die Vorschau löst gegen die genannte auf.
  //
  // Gemerkt am TRAEGER, nicht am Baum: die Quellen eines Bausteins haengen an
  // genau zwei Dingen — dem naechsten Vorfahr mit eigener Quelle
  // (quellenTraeger) und der Bibliothek. Beide werden beim Aendern ERSETZT,
  // nie in sich veraendert; ihre Identitaet ist also ein ehrliches „hat sich
  // wirklich geaendert". Der Baum selbst taugte dafuer NICHT: den ersetzt jeder
  // Tastendruck irgendwo, und die Liste wuerde ueberall neu gerechnet.
  // Darum steht hier auch nicht editor.quellenFor — nur die beiden Bausteine
  // dieser Rechnung einzeln lassen sich als Abhaengigkeit hinschreiben.
  const traeger = quellenTraeger(editor.tree, block.id)
  const braucht = bindableSpots.length > 0 || traegtEigeneQuelle(block)
  const bibliothek = quellenBibliothek.list
  const quellen = useMemo(
    () => (braucht && traeger
      ? quellenAufloesen(traeger.props.source, traeger.props[WEITERE_QUELLEN_PROP], bibliothek)
      : KEINE_QUELLEN),
    [braucht, traeger, bibliothek],
  )
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
    quellen,
    raster,
  })

  // ---- Feld-Bindung: beide Picker + ihre Klick-Behandler (FeldBindung) ----
  const { onClick, onDoubleClick, pickers } = useFeldBindung({
    editor,
    blockRef,
    block,
    selected,
    bindableSpots,
    listenBindung: def?.listenBindung,
    quellen,
    containerRef,
    onSelect,
  })

  // Breite/Höhe ziehen (Anfasser rechts bzw. unten) — useBlockResize.
  // startResize = Fluss (px, misst das Element); startRasterResize = Raster
  // (Zellen-Snap, misst den Grid-Platz über rootRef).
  const { startResize, startRasterResize } = useBlockResize(editor, blockRef, elementRef, rootRef)

  const resizable = def?.resizableWidth ?? true
  const heightResizable = def?.resizableHeight === true
  // Raster-Angaben zum AKTUELLEN Zustand des Bausteins (Startgröße,
  // Breiten-Anfasser). Zustandsabhängig deklariert der Baustein selbst
  // (raster.varianten) — hier steht kein Wissen über einen Bausteintyp.
  const rasterSpec = rasterSpecOf(def, block.props)

  // Musterkarte (templateChild in der Registry): KEIN sichtbares
  // Etikett (docs/decisions/2026-07-16-karte-empfang-anatomie.md). Die
  // Markierung steuert nur das Kreuzchen: die Musterkarte hat keins
  // (Löschschutz, s. onRemoveClick).
  const templateMark = editor.templateMarkFor(block.id)

  // Kreuzchen: Entfernen direkt am Block, OHNE Rückfrage. Die Musterkarte
  // selbst zeigt gar kein Kreuzchen (s. u.); ein Teilbaum, der sie enthält
  // (Spalte), erklärt den Schutz statt still nichts zu tun — der Store
  // erzwingt ihn zusätzlich (removeBlock).
  //
  // Bis U2 (2026-08-12) fragte dieser Weg nach, wenn der Baustein Inhalte
  // trug — Entf-Taste und Inspector-Papierkorb nicht. Derselbe Baustein
  // verschwand also je Weg anders. Jetzt verhalten sich alle drei gleich, das
  // Netz ist Strg+Z (Nutzer-Entscheidung U0-3).
  function onRemoveClick(e: ReactMouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    // Schutz-Erklaerung + Entfernen liegen in loescheBaustein — dieselbe
    // Stelle wie Inspector-Knopf und Entf-Taste.
    loescheBaustein(editor, blockRef.current.id)
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
      {pickers}
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
          Doppelklick setzt die Startgröße des Bausteins. Blöcke sind hier
          grundsätzlich in Breite UND Höhe ziehbar — das ist der Sinn des
          Rasters; die Fluss-Beschränkungen (resizableWidth/Height) gelten nur
          im Fluss. Ein Baustein, dessen Breite in seinem AKTUELLEN Zustand
          keine Bedeutung hat, schaltet den Breiten-Anfasser über seine
          Raster-Angaben ab (rasterSpec.breiteZiehbar — die senkrechte
          Trennlinie ist ein Strich, kein Kasten). Registry-Daten, kein
          `if typ ===` (Regel 2). */}
      {selected && raster && rasterSpec.breiteZiehbar && (
        <div
          draggable={false}
          onPointerDown={(e) => startRasterResize(e, 'x')}
          onDragStart={(e) => e.preventDefault()}
          onDoubleClick={(e) => {
            e.stopPropagation()
            const node = blockRef.current
            const spec = rasterSpecOf(getBlockDefinition(node.type), node.props)
            editor.updateProperty(node.id, 'rasterW', spec.startW)
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
      )}
      {selected && raster && (
        <div
          draggable={false}
          onPointerDown={(e) => startRasterResize(e, 'y')}
          onDragStart={(e) => e.preventDefault()}
          onDoubleClick={(e) => {
            e.stopPropagation()
            const node = blockRef.current
            const spec = rasterSpecOf(getBlockDefinition(node.type), node.props)
            editor.updateProperty(node.id, 'rasterH', spec.startH)
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
