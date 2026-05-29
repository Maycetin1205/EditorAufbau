// BlockPalette
// Zeigt die registrierten MVP-Blocks und legt per Klick neue BlockData an.

import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { getAllBlockDefinitions } from '../../core/blocks/blockRegistry'
import type { BlockCategory, BlockDefinition } from '../../core/blocks/BlockDefinition'
import { useEditor } from '../../state/useEditor'
import { cn } from '@/lib/utils'

const CATEGORY_LABEL: Record<BlockCategory, string> = {
  eingabe: 'Eingabe',
  anzeige: 'Anzeige',
}

const CATEGORY_ORDER: BlockCategory[] = ['eingabe', 'anzeige']

export function BlockPalette() {
  const ed = useEditor()
  const [query, setQuery] = useState('')
  const definitions = getAllBlockDefinitions()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return definitions.filter((d) => {
      if (!q) return true
      return d.displayName.toLowerCase().includes(q)
        || d.type.toLowerCase().includes(q)
        || d.tagName.toLowerCase().includes(q)
    })
  }, [definitions, query])

  const grouped = useMemo(() => {
    const acc: Record<BlockCategory, BlockDefinition[]> = {
      eingabe: [],
      anzeige: [],
    }
    for (const def of filtered) acc[def.category]?.push(def)
    return acc
  }, [filtered])

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

      <div className="flex flex-col gap-4">
        {CATEGORY_ORDER.map((cat) => {
          const items = grouped[cat]
          if (!items || items.length === 0) return null
          return (
            <section key={cat} className="flex flex-col gap-1.5">
              <h3 className="px-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {CATEGORY_LABEL[cat]}
              </h3>
              <div className="flex flex-col gap-1">
                {items.map((def) => (
                  <PaletteCard
                    key={def.type}
                    def={def}
                    onAdd={() => ed.addBlock(def.type)}
                  />
                ))}
              </div>
            </section>
          )
        })}
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
      className={cn(
        'group grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-border bg-card px-2.5 py-2 text-left text-xs',
        'transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground',
      )}
    >
      <span className="truncate font-medium">{def.displayName}</span>
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-muted-foreground group-hover:bg-background group-hover:text-foreground">
        <Plus size={13} />
      </span>
    </button>
  )
}
