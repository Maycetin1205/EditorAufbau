// RelationsView
// Syntax-Import-Feld + Liste aller Relations + Detail-Anzeige.
// User klebt GET_RELATION[...] / PUT_RELATION[...] / PUTADD_RELATION[...] ein,
// parseRelationSyntax + addRelation erledigen Rest.

import { IconChevronRight, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import { catalog } from '../../../softengine/catalog/Catalog'
import { useCatalog } from '../../../softengine/catalog/useCatalog'

const inputCls =
  'w-full text-xs px-2 py-1 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500'
const labelCls = 'block text-xs font-medium text-slate-700 mb-1'
const btnCls =
  'inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
const iconBtnCls =
  'inline-flex items-center justify-center w-7 h-7 rounded text-red-600 hover:bg-red-50'

function badgeColor(kind: string, variant: 'light' | 'outline' = 'light'): string {
  if (variant === 'outline') {
    return 'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border border-slate-300 text-slate-600'
  }
  if (kind === 'GET' || kind === 'variable') {
    return 'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700'
  }
  return 'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-50 text-orange-700'
}

export function RelationsView() {
  const cat = useCatalog()
  const [syntaxInput, setSyntaxInput] = useState('')
  const [parseError, setParseError] = useState('')
  const [editId, setEditId] = useState<string | null>(null)

  if (editId) {
    const rel = cat.getRelation(editId)
    if (!rel) {
      setEditId(null)
      return null
    }
    return <RelationDetail relationId={editId} onBack={() => setEditId(null)} />
  }

  const handleImport = () => {
    const created = catalog.importRelationFromSyntax(syntaxInput)
    if (!created) {
      setParseError('Ungültige Syntax. Format: GET_RELATION[NR!P1!P2!...] oder PUT_RELATION[...]')
      return
    }
    setParseError('')
    setSyntaxInput('')
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      <div>
        <label className={labelCls}>Relation per Syntax</label>
        <textarea
          className={inputCls + ' font-mono'}
          rows={2}
          placeholder={'GET_RELATION[666!1!2!L!!IDBID0005]\nPUT_RELATION[174!1!2!L!!IDBID0005!STATUS]'}
          value={syntaxInput}
          onChange={(e) => {
            setSyntaxInput(e.currentTarget.value)
            setParseError('')
          }}
        />
        <div className="flex items-center justify-between mt-1">
          <button
            type="button"
            className={btnCls}
            onClick={handleImport}
            disabled={!syntaxInput.trim()}
          >
            Importieren
          </button>
          {parseError && <span className="text-xs text-red-600">{parseError}</span>}
        </div>
      </div>

      {cat.relations.length === 0 && (
        <p className="text-sm text-slate-500">Noch keine Relations.</p>
      )}

      {cat.relations.map((r) => (
        <button
          type="button"
          key={r.id}
          onClick={() => setEditId(r.id)}
          className="w-full text-left px-2.5 py-2 rounded-md border border-slate-200 hover:bg-slate-50"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className={badgeColor(r.kind)}>{r.kind}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{r.name}</p>
                <p className="text-xs text-slate-500 truncate">{r.syntax}</p>
              </div>
            </div>
            <IconChevronRight size={14} className="shrink-0 text-slate-400" />
          </div>
        </button>
      ))}
    </div>
  )
}

interface RelationDetailProps {
  relationId: string
  onBack: () => void
}

function RelationDetail({ relationId, onBack }: RelationDetailProps) {
  const cat = useCatalog()
  const r = cat.getRelation(relationId)
  if (!r) return null

  // Vorlage ist read-only bzgl. Syntax. Konkrete Parameter-Werte werden
  // erst bei Nutzung (Aktionsschritt) belegt, nicht hier.
  return (
    <div className="flex flex-col gap-3 p-3">
      <div>
        <label className={labelCls}>Name</label>
        <input
          type="text"
          className={inputCls}
          value={r.name}
          onChange={(e) => catalog.updateRelation(relationId, { name: e.currentTarget.value })}
        />
      </div>

      <div>
        <span className="block text-xs font-medium text-slate-700 mb-0.5">Vorlage-Syntax</span>
        <p className="text-xs font-mono break-all px-2 py-1.5 bg-slate-100 rounded">{r.syntax}</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-xs font-medium text-slate-700">
            Platzhalter ({r.syntaxParams.length})
          </span>
          {r.syntaxParams.length === 0 && (
            <span className="text-xs text-slate-500">keine — Vorlage ohne Variable</span>
          )}
        </div>
        {r.syntaxParams.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {r.syntaxParams.map((p) => (
              <span
                key={p.key}
                className={badgeColor(p.source, p.source === 'variable' ? 'light' : 'outline')}
                title={p.source === 'variable' ? 'wird bei Nutzung belegt' : 'fester Wert in Vorlage'}
              >
                {p.source === 'variable' ? `{${p.key}}` : p.value}
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-500 mt-1">
          Platzhalter werden bei Nutzung im Aktionsschritt mit konkreten Werten gefüllt.
        </p>
      </div>

      <div>
        <label className={labelCls}>Beschreibung</label>
        <textarea
          className={inputCls}
          rows={2}
          value={r.description}
          onChange={(e) =>
            catalog.updateRelation(relationId, { description: e.currentTarget.value })
          }
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <button
          type="button"
          className={iconBtnCls}
          onClick={() => {
            catalog.deleteRelation(relationId)
            onBack()
          }}
          aria-label="Relation löschen"
        >
          <IconTrash size={14} />
        </button>
        <button type="button" className={btnCls} onClick={onBack}>
          Fertig
        </button>
      </div>
    </div>
  )
}
