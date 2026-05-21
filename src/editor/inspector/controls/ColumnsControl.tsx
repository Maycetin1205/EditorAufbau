// ColumnsControl
// Editor fuer Tabellen-Spalten ({ key, label, field, width }).
// Add/Remove/Up/Down + 4 Felder pro Eintrag.

import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from '@tabler/icons-react'
import type { PropertyDescription } from '../../../core/blocks/PropertyDescription'
import { Panel } from '@/ui/panel'

export interface TableColumn {
  key: string
  label: string
  field: string
  width: number
}

interface ColumnsControlProps {
  property: PropertyDescription
  value: TableColumn[]
  onChange: (value: TableColumn[]) => void
}

const rowBtn = 'inline-flex items-center justify-center h-7 w-7 rounded text-slate-600 hover:bg-slate-100'
const dangerBtn = 'inline-flex items-center justify-center h-7 w-7 rounded text-red-600 hover:bg-red-50'

export function ColumnsControl({ property, value, onChange }: ColumnsControlProps) {
  const items: TableColumn[] = Array.isArray(value) ? value : []

  const setItem = (idx: number, patch: Partial<TableColumn>) => {
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }
  const removeItem = (idx: number) => onChange(items.filter((_, i) => i !== idx))
  const addItem = () => {
    const idx = items.length + 1
    onChange([...items, { key: `col_${idx}`, label: `Spalte ${idx}`, field: '', width: 120 }])
  }
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...items]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    const [it] = next.splice(idx, 1)
    next.splice(target, 0, it)
    onChange(next)
  }

  return (
    <Panel
      title={property.name}
      description={property.description}
      className="bg-slate-50"
      bodyClassName="p-2 flex flex-col gap-2"
    >
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground">Noch keine Spalten.</p>
      )}
      {items.map((it, idx) => (
        <div key={idx} className="flex flex-col gap-1 rounded border border-slate-200 bg-white p-2">
          <div className="flex items-center gap-1">
            <input
              value={it.label}
              placeholder="Label"
              onChange={(e) => setItem(idx, { label: e.currentTarget.value })}
              className="flex-1 h-7 rounded border border-input bg-background px-2 text-xs"
            />
            <button type="button" className={rowBtn} onClick={() => move(idx, -1)} aria-label="hoch">
              <IconArrowUp size={14} />
            </button>
            <button type="button" className={rowBtn} onClick={() => move(idx, 1)} aria-label="runter">
              <IconArrowDown size={14} />
            </button>
            <button type="button" className={dangerBtn} onClick={() => removeItem(idx)} aria-label="loeschen">
              <IconTrash size={14} />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <input
              value={it.field}
              placeholder="Feld (z.B. Vorname)"
              onChange={(e) => setItem(idx, { field: e.currentTarget.value })}
              className="flex-1 h-7 rounded border border-input bg-background px-2 text-xs"
            />
            <input
              type="number"
              min={40}
              value={it.width}
              onChange={(e) => {
                const n = e.currentTarget.valueAsNumber
                if (Number.isFinite(n)) setItem(idx, { width: n })
              }}
              className="w-20 h-7 rounded border border-input bg-background px-2 text-xs"
            />
            <span className="text-[10px] text-slate-500">px</span>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-1 self-start text-xs text-blue-700 hover:underline"
      >
        <IconPlus size={12} /> Spalte hinzufuegen
      </button>
    </Panel>
  )
}
