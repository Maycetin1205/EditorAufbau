// DataSourcesView
// Liste aller Datenquellen + Edit-Formular fuer einen ausgewaehlten Eintrag.
// Hier passiert die ganze Verwaltung: Typ waehlen, Bezeichnung, Quell-ID, Felder, Freiselekt.

import { IconChevronRight, IconPlus, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import { catalog } from '../../../softengine/catalog/Catalog'
import { useCatalog } from '../../../softengine/catalog/useCatalog'
import type { SoftEngineFeld, SourceType } from '../../../softengine/catalog/types'
import {
  ALL_SOURCE_TYPES,
  getSourceIdLabel,
  getTypeLabel,
  getTypeShortBadge,
  supportsFreiselekt,
  supportsKey,
} from '../../../softengine/catalog/vorschlaege'

const inputCls =
  'w-full text-xs px-2 py-1 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500'
const labelCls = 'block text-xs font-medium text-slate-700 mb-1'
const btnCls =
  'inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
const btnSubtleRedCls =
  'inline-flex items-center gap-1 text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50'
const iconBtnCls =
  'inline-flex items-center justify-center w-6 h-6 rounded text-red-600 hover:bg-red-50'

export function DataSourcesView() {
  const cat = useCatalog()
  const [editId, setEditId] = useState<string | null>(null)

  if (editId) {
    const entry = cat.getEntry(editId)
    if (!entry) {
      // Eintrag inzwischen geloescht -> zurueck zur Liste.
      setEditId(null)
      return null
    }
    return <EntryEditor entryId={editId} onBack={() => setEditId(null)} />
  }

  return (
    <div className="flex flex-col gap-2 p-3">
      <button
        type="button"
        className={btnCls + ' self-start'}
        onClick={() => {
          const created = catalog.addEntry('idb')
          setEditId(created.id)
        }}
      >
        <IconPlus size={14} />
        Neue Datenquelle
      </button>

      {cat.entries.length === 0 && (
        <p className="text-sm text-slate-500">Noch keine Datenquellen. Lege eine neue an.</p>
      )}

      {cat.entries.map((e) => (
        <button
          type="button"
          key={e.id}
          onClick={() => setEditId(e.id)}
          className="w-full text-left px-2.5 py-2 rounded-md border border-slate-200 hover:bg-slate-50"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                {getTypeShortBadge(e.type)}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{e.alias || '(ohne Bezeichnung)'}</p>
                <p className="text-xs text-slate-500 truncate">
                  {e.sourceId || '(ohne ID)'} - {e.fields.length} Felder
                  {e.freiselektAktiv ? ' - Filter' : ''}
                </p>
              </div>
            </div>
            <IconChevronRight size={14} className="shrink-0 text-slate-400" />
          </div>
        </button>
      ))}
    </div>
  )
}

interface EntryEditorProps {
  entryId: string
  onBack: () => void
}

function EntryEditor({ entryId, onBack }: EntryEditorProps) {
  const cat = useCatalog()
  const entry = cat.getEntry(entryId)
  if (!entry) return null

  const updateField = (idx: number, patch: Partial<SoftEngineFeld>) => {
    const next = entry.fields.map((f, i) => (i === idx ? { ...f, ...patch } : f))
    catalog.updateEntry(entryId, { fields: next })
  }
  const removeField = (idx: number) => {
    const next = entry.fields.filter((_, i) => i !== idx)
    catalog.updateEntry(entryId, { fields: next })
  }
  const addField = () => {
    catalog.updateEntry(entryId, { fields: [...entry.fields, { name: '', field: '' }] })
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      <div>
        <label className={labelCls}>Bezeichnung</label>
        <input
          type="text"
          className={inputCls}
          value={entry.alias}
          onChange={(e) => catalog.updateEntry(entryId, { alias: e.currentTarget.value })}
        />
      </div>

      <div>
        <label className={labelCls}>Typ</label>
        <select
          className={inputCls}
          value={entry.type}
          onChange={(e) => catalog.changeEntryType(entryId, e.currentTarget.value as SourceType)}
        >
          {ALL_SOURCE_TYPES.map((t) => (
            <option key={t} value={t}>
              {getTypeLabel(t)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelCls}>{getSourceIdLabel(entry.type)}</label>
        <input
          type="text"
          className={inputCls}
          value={entry.sourceId}
          onChange={(e) => catalog.updateEntry(entryId, { sourceId: e.currentTarget.value })}
        />
      </div>

      {supportsKey(entry.type) && (
        <div>
          <label className={labelCls}>Key-Feld (POS_LEN)</label>
          <input
            type="text"
            className={inputCls}
            placeholder="z.B. 10_8"
            value={entry.key}
            onChange={(e) => catalog.updateEntry(entryId, { key: e.currentTarget.value })}
          />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-slate-700">Felder ({entry.fields.length})</span>
          <button type="button" className={btnCls} onClick={addField}>
            <IconPlus size={12} />
            Feld
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {entry.fields.map((f, i) => (
            <div key={i} className="flex items-end gap-1">
              <input
                type="text"
                className={inputCls + ' flex-1'}
                placeholder="Name"
                value={f.name}
                onChange={(e) => updateField(i, { name: e.currentTarget.value })}
              />
              <input
                type="text"
                className={inputCls + ' w-24'}
                placeholder="POS_LEN"
                value={f.field}
                onChange={(e) => updateField(i, { field: e.currentTarget.value })}
              />
              <button
                type="button"
                className={iconBtnCls}
                onClick={() => removeField(i)}
                aria-label="Feld löschen"
              >
                <IconTrash size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {supportsFreiselekt(entry.type) && (
        <div>
          <label className="flex items-center gap-2 text-xs text-slate-700">
            <input
              type="checkbox"
              className="w-3.5 h-3.5"
              checked={entry.freiselektAktiv}
              onChange={(e) =>
                catalog.updateEntry(entryId, { freiselektAktiv: e.currentTarget.checked })
              }
            />
            Freiselekt verwenden
          </label>
          {entry.freiselektAktiv && (
            <input
              type="text"
              className={inputCls + ' mt-1'}
              placeholder="z.B. ADR_0_3='K'"
              value={entry.freiselekt}
              onChange={(e) => catalog.updateEntry(entryId, { freiselekt: e.currentTarget.value })}
            />
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <button
          type="button"
          className={btnSubtleRedCls}
          onClick={() => {
            catalog.deleteEntry(entryId)
            onBack()
          }}
        >
          Löschen
        </button>
        <button type="button" className={btnCls} onClick={onBack}>
          Fertig
        </button>
      </div>
    </div>
  )
}
