// BlockPalette
// Zeigt die registrierten MVP-Blocks und legt per Klick neue BlockData an.

import { Component, Plus, Search, type Zeichen } from '@/ui/zeichen'
import { createElement, useState } from 'react'
import { ROOT_ID, ROOT_TYPE } from '../../core/blocks/BlockData'
import { canContain, getAllBlockDefinitions } from '../../core/blocks/blockRegistry'
import type { BlockCategory, BlockDefinition } from '../../core/blocks/BlockDefinition'
import { editorAngabenVon } from '../../core/blocks/editorAngaben'
import { setNewBlockDrag } from '../canvas/dnd'
import { useEditor } from '../../state/useEditor'
import { cn } from '@/lib/utils'

// Ersatz-Icon fuer Bausteine, die (noch) keines deklarieren: ein neutraler
// Baustein. Die Bibliothek bleibt so immer bedienbar.
const ERSATZ_SYMBOL = Component

// Das Symbol eines Bausteins, fertig zum Zeichnen.
//
// Hier steht die EINE Umdeutung von `BausteinSymbol` (dem frameworkfreien
// Vertrag der Registry) auf `Zeichen` (die echte React-Komponente). Sie ist der
// Preis dafuer, dass der fachliche Core keinen React-Typ kennt — Begruendung in
// core/blocks/editorAngaben. Gefahrlos, weil die einzigen Einsetzer die
// editorAngaben der Bausteine sind und die nichts anderes hineingeben als
// Symbole aus ui/zeichen.
function symbolVon(type: string): Zeichen {
  return (editorAngabenVon(type).symbol ?? ERSATZ_SYMBOL) as Zeichen
}

const CATEGORY_LABEL: Record<BlockCategory, string> = {
  layout: 'Layout',
  eingabe: 'Eingabe',
  anzeige: 'Anzeige',
}

const CATEGORY_ORDER: BlockCategory[] = ['layout', 'eingabe', 'anzeige']

export function BlockPalette() {
  const ed = useEditor()
  const [query, setQuery] = useState('')
  // showInPalette=false versteckt Bausteine, die nur in ihrem Organismus
  // entstehen (Kanban-Spalte über "+ Spalte" am Board).
  const definitions = getAllBlockDefinitions().filter((d) => d.showInPalette !== false)

  // Beides stand in einem useMemo — nur trug keines: `definitions` ist bei jedem
  // Render ein neues Array und stand in den Abhaengigkeiten, also rechneten
  // beide Memos ohnehin jedes Mal neu (und die Palette rendert ueber useEditor
  // bei JEDER Store-Aenderung). Ballast, der Stabilitaet vortaeuschte: ein
  // Filter ueber ein Dutzend Registry-Eintraege kostet nichts.
  const q = query.trim().toLowerCase()
  const filtered = definitions.filter((d) => {
    if (!q) return true
    return d.displayName.toLowerCase().includes(q)
      || d.type.toLowerCase().includes(q)
      || d.tagName.toLowerCase().includes(q)
  })

  const grouped: Record<BlockCategory, BlockDefinition[]> = {
    layout: [],
    eingabe: [],
    anzeige: [],
  }
  for (const def of filtered) grouped[def.category]?.push(def)

  // Einfüge-Ziel beim Klick: vom ausgewählten Block aufwärts der NÄCHSTE
  // Container, der den Typ aufnimmt (canContain) — ist eine Karte
  // in einer Kanban-Spalte gewählt, landet "Karte" in der Spalte; passt
  // nichts, fällt die Suche auf die Wurzel zurück.
  const insertParentFor = (type: string): string | undefined => {
    let cur = ed.selectedId ? ed.getNode(ed.selectedId) : null
    while (cur) {
      if (canContain(cur.type, type)) return cur.id
      cur = cur.parentId ? ed.getNode(cur.parentId) : null
    }
    // Ohne Ziel landet der Baustein auf der AKTIVEN Seite (addBlock ohne
    // parentId). Nimmt die ihn nicht auf, die echte Wurzel aber schon, dann
    // ausdruecklich dorthin: sonst taete der Bibliotheks-Klick STUMM nichts,
    // sobald eine Ansicht offen ist (addBlock gibt null zurueck). Betrifft
    // alles, was nur an die Wurzel darf — heute die Navi.
    const aktiveSeite = ed.getNode(ed.rootId)
    if (aktiveSeite && !canContain(aktiveSeite.type, type) && canContain(ROOT_TYPE, type)) {
      return ROOT_ID
    }
    return undefined
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="relative flex items-center">
        <Search size={14} className="absolute left-2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder="Blöcke suchen…"
          className={cn(
            'h-8 w-full rounded-md border border-input bg-background pl-7 pr-2 text-xs shadow-sm',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        />
      </label>

      {filtered.length === 0 && (
        <p className="text-xs text-muted-foreground">Keine Treffer.</p>
      )}

      {/* Kategorien deutlich voneinander abtrennen (Nutzer-Wunsch 2026-07-21):
          feine Trennlinie + etwas mehr Abstand zwischen den Bloecken, gleiches
          Muster wie die Trennlinien im Inspector (border-t border-border). Leere
          Kategorien fallen vorher raus, damit die Linie nie ins Leere zeigt. */}
      <div className="flex flex-col">
        {CATEGORY_ORDER.filter((cat) => (grouped[cat]?.length ?? 0) > 0).map((cat, i) => (
          <section
            key={cat}
            className={cn(
              'flex flex-col gap-1.5',
              i > 0 && 'mt-4 border-t border-border pt-4',
            )}
          >
            <h3 className="px-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">
              {CATEGORY_LABEL[cat]}
            </h3>
            <div className="flex flex-col gap-1">
              {grouped[cat].map((def) => (
                <PaletteCard
                  key={def.type}
                  def={def}
                  onAdd={() => ed.addBlock(def.type, insertParentFor(def.type))}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

interface PaletteCardProps {
  def: BlockDefinition
  onAdd: () => void
}

function PaletteCard({ def, onAdd }: PaletteCardProps) {
  // Icon aus der Registry — deklariert vom Baustein selbst in
  // blocks/<x>/editorAngaben.ts (Regel 2: kein Sondercode je Bausteintyp
  // hier). Der Text bleibt der EINZIGE Textknoten im Knopf — die Icons tragen
  // keinen Textwert, der zugaengliche Name bleibt exakt der Klarname (Vertrag:
  // `getByRole('button', { name: 'Zeile', exact: true })`).
  //
  // createElement statt JSX-Tag: die Icon-Komponente kommt als WERT aus der
  // Registry, so entsteht beim Rendern kein neuer Komponenten-Wert
  // (react-hooks/static-components).
  return (
    <button
      type="button"
      onClick={onAdd}
      draggable
      onDragStart={(e) => {
        // Neuer Block reist als MIME-Eintrag zum Canvas (siehe canvas/dnd.ts).
        setNewBlockDrag(e.dataTransfer, def.type)
        e.dataTransfer.effectAllowed = 'copy'
      }}
      className={cn(
        'group grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5 text-left text-xs',
        'transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground',
      )}
    >
      {/* Das Symbol steht BLANK da — einfarbig über currentColor, wie überall
          sonst im Editor (Inspector, Datencenter, Toolbar). Bis 2026-08-05 saß
          es in einer getönten 24er-Kachel mit eigener Farbe, die beim Zeigen
          umschlug: neben dem Kachel-Rahmen des Knopfs die zweite Umrandung um
          dasselbe Ding, und als einzige Icon-Stelle des Editors zweifarbig.
          Die feste 24er-Breite bleibt — sie hält die Klarnamen in einer
          Spalte, gleich wie breit ein Symbol zeichnet. */}
      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-muted-foreground group-hover:text-foreground">
        {createElement(symbolVon(def.type), { size: 16 })}
      </span>
      <span className="truncate font-medium">{def.displayName}</span>
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
        <Plus size={13} />
      </span>
    </button>
  )
}
