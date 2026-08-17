import { Component, Plus, Search, type Zeichen } from '@/ui/zeichen'
import { createElement, useState } from 'react'
import { ROOT_ID, ROOT_TYPE } from '../../core/blocks/BlockData'
import { canContain, getAllBlockDefinitions } from '../../core/blocks/blockRegistry'
import type { BlockCategory, BlockDefinition } from '../../core/blocks/BlockDefinition'
import { editorAngabenVon } from '../../core/blocks/editorAngaben'
import { setNewBlockDrag } from '../canvas/dnd'
import { useEditor } from '../../state/useEditor'
import { cn } from '@/lib/utils'

const ERSATZ_SYMBOL = Component

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

  const definitions = getAllBlockDefinitions().filter((d) => d.showInPalette !== false)

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

  const insertParentFor = (type: string): string | undefined => {
    let cur = ed.selectedId ? ed.getNode(ed.selectedId) : null
    while (cur) {
      if (canContain(cur.type, type)) return cur.id
      cur = cur.parentId ? ed.getNode(cur.parentId) : null
    }

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
  return (
    <button
      type="button"
      onClick={onAdd}
      draggable
      onDragStart={(e) => {
        setNewBlockDrag(e.dataTransfer, def.type)
        e.dataTransfer.effectAllowed = 'copy'
      }}
      className={cn(
        'group grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5 text-left text-xs',
        'transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground',
      )}
    >

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
