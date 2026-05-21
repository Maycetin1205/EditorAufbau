// FieldListControl
// Editor fuer eine Liste von { label, field } Eintraegen (ff-feldliste).
// Add/Remove/Up/Down + 2 Felder pro Eintrag.

import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from '@tabler/icons-react'
import type { PropertyDescription } from '../../../core/blocks/PropertyDescription'
import { Panel } from '@/ui/panel'

export interface FieldListItem {
  label: string
  field: string
}

interface FieldListControlProps {
  property: PropertyDescription
  value: FieldListItem[]
  onChange: (value: FieldListItem[]) => void
}

const rowBtn = 'inline-flex items-center justify-center h-7 w-7 rounded text-slate-600 hover:bg-slate-100'
const dangerBtn = 'inline-flex items-center justify-center h-7 w-7 rounded text-red-600 hover:bg-red-50'

export function FieldListControl({ property, value, onChange }: FieldListControlProps) {
  const items: FieldListItem[] = Array.isArray(value) ? value : []

  const setItem = (idx: number, patch: Partial<FieldListItem>) => {
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }
  const removeItem = (idx: number) => onChange(items.filter((_, i) => i !== idx))
  const addItem = () => onChange([...items, { label: 'Neues Feld', field: '' }])
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
        <p className="text-xs text-muted-foreground">Noch keine Eintraege.</p>
      )}
      {items.map((it, idx) => (
        <div key={idx} className="flex items-center gap-1">
          <input
            value={it.label}
            placeholder="Label"
            onChange={(e) => setItem(idx, { label: e.currentTarget.value })}
            className="flex-1 h-7 rounded border border-input bg-background px-2 text-xs"
          />
          <input
            value={it.field}
            placeholder="Feld"
            onChange={(e) => setItem(idx, { field: e.currentTarget.value })}
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
      ))}
      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-1 self-start text-xs text-blue-700 hover:underline"
      >
        <IconPlus size={12} /> Feld hinzufuegen
      </button>
    </Panel>
  )
}
