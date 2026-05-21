// SectionsControl
// Editor fuer ff-detailkarte: Liste von Sektionen mit Titel + Felder.
// Jede Sektion enthaelt eine FieldList ({ label, field }).

import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from '@tabler/icons-react'
import type { PropertyDescription } from '../../../core/blocks/PropertyDescription'
import { Panel } from '@/ui/panel'
import type { FieldListItem } from './FieldListControl'

export interface DetailSection {
  id: string
  title: string
  fields: FieldListItem[]
}

interface SectionsControlProps {
  property: PropertyDescription
  value: DetailSection[]
  onChange: (value: DetailSection[]) => void
}

const rowBtn = 'inline-flex items-center justify-center h-7 w-7 rounded text-slate-600 hover:bg-slate-100'
const dangerBtn = 'inline-flex items-center justify-center h-7 w-7 rounded text-red-600 hover:bg-red-50'

export function SectionsControl({ property, value, onChange }: SectionsControlProps) {
  const sections: DetailSection[] = Array.isArray(value) ? value : []

  const setSection = (idx: number, patch: Partial<DetailSection>) => {
    onChange(sections.map((s, i) => (i === idx ? { ...s, ...patch } : s)))
  }
  const removeSection = (idx: number) => onChange(sections.filter((_, i) => i !== idx))
  const addSection = () =>
    onChange([
      ...sections,
      { id: crypto.randomUUID(), title: 'Neue Sektion', fields: [] },
    ])
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...sections]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    const [s] = next.splice(idx, 1)
    next.splice(target, 0, s)
    onChange(next)
  }

  const setField = (sIdx: number, fIdx: number, patch: Partial<FieldListItem>) => {
    const s = sections[sIdx]
    const fields = s.fields.map((f, i) => (i === fIdx ? { ...f, ...patch } : f))
    setSection(sIdx, { fields })
  }
  const removeField = (sIdx: number, fIdx: number) => {
    const s = sections[sIdx]
    setSection(sIdx, { fields: s.fields.filter((_, i) => i !== fIdx) })
  }
  const addField = (sIdx: number) => {
    const s = sections[sIdx]
    setSection(sIdx, { fields: [...s.fields, { label: 'Feld', field: '' }] })
  }

  return (
    <Panel
      title={property.name}
      description={property.description}
      className="bg-slate-50"
      bodyClassName="p-2 flex flex-col gap-2"
    >
      {sections.length === 0 && (
        <p className="text-xs text-muted-foreground">Noch keine Sektionen.</p>
      )}
      {sections.map((s, idx) => (
        <div key={s.id} className="flex flex-col gap-1 rounded border border-slate-200 bg-white p-2">
          <div className="flex items-center gap-1">
            <input
              value={s.title}
              placeholder="Sektionstitel"
              onChange={(e) => setSection(idx, { title: e.currentTarget.value })}
              className="flex-1 h-7 rounded border border-input bg-background px-2 text-xs font-semibold"
            />
            <button type="button" className={rowBtn} onClick={() => move(idx, -1)} aria-label="hoch">
              <IconArrowUp size={14} />
            </button>
            <button type="button" className={rowBtn} onClick={() => move(idx, 1)} aria-label="runter">
              <IconArrowDown size={14} />
            </button>
            <button type="button" className={dangerBtn} onClick={() => removeSection(idx)} aria-label="Sektion loeschen">
              <IconTrash size={14} />
            </button>
          </div>
          <div className="flex flex-col gap-1 pl-2">
            {s.fields.map((f, fIdx) => (
              <div key={fIdx} className="flex items-center gap-1">
                <input
                  value={f.label}
                  placeholder="Label"
                  onChange={(e) => setField(idx, fIdx, { label: e.currentTarget.value })}
                  className="flex-1 h-7 rounded border border-input bg-background px-2 text-xs"
                />
                <input
                  value={f.field}
                  placeholder="Feld"
                  onChange={(e) => setField(idx, fIdx, { field: e.currentTarget.value })}
                  className="flex-1 h-7 rounded border border-input bg-background px-2 text-xs"
                />
                <button type="button" className={dangerBtn} onClick={() => removeField(idx, fIdx)} aria-label="Feld loeschen">
                  <IconTrash size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addField(idx)}
              className="inline-flex items-center gap-1 self-start text-xs text-blue-700 hover:underline"
            >
              <IconPlus size={12} /> Feld
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addSection}
        className="inline-flex items-center gap-1 self-start text-xs text-blue-700 hover:underline"
      >
        <IconPlus size={12} /> Sektion hinzufuegen
      </button>
    </Panel>
  )
}
