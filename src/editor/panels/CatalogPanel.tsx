// CatalogPanel
// Floating Werkzeug-Panel fuer SoftEngine-Datenquellen-Catalog.
// Position via Pointer-Drag am Header verschiebbar.
// Drei Ansichten: overview (2 Slots) -> list (Datenquellen / Relations) -> edit (Formular).

import { IconChevronLeft, IconChevronRight, IconGripVertical, IconX } from '@tabler/icons-react'
import { useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useCatalog } from '../../softengine/catalog/useCatalog'
import { DataSourcesView } from './catalog/DataSourcesView'
import { RelationsView } from './catalog/RelationsView'

export interface PanelPosition {
  x: number
  y: number
}

interface CatalogPanelProps {
  pos: PanelPosition
  onPosChange: (pos: PanelPosition) => void
  onClose: () => void
}

type View = 'overview' | 'sources' | 'relations'

const PANEL_WIDTH = 420
const PANEL_HEIGHT = 560

const iconBtnCls =
  'inline-flex items-center justify-center w-7 h-7 rounded text-slate-600 hover:bg-slate-200'

export function CatalogPanel({ pos, onPosChange, onClose }: CatalogPanelProps) {
  const cat = useCatalog()
  const [view, setView] = useState<View>('overview')

  const startDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const start = { ...pos }

    const onMove = (ev: PointerEvent) => {
      const nx = Math.max(0, start.x + (ev.clientX - startX))
      const ny = Math.max(0, start.y + (ev.clientY - startY))
      onPosChange({ x: nx, y: ny })
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const headerTitle =
    view === 'overview' ? 'Datenquellen' : view === 'sources' ? 'Datenquellen' : 'Relations'

  return (
    <div
      className="fixed z-[1000] flex flex-col overflow-hidden rounded-md border border-slate-300 bg-white shadow-lg"
      style={{
        left: pos.x,
        top: pos.y,
        width: PANEL_WIDTH,
        height: PANEL_HEIGHT,
      }}
    >
      {/* Header: Drag-Griff + Zurueck-Button + Titel + Schliessen */}
      <div
        className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-200 bg-slate-100 select-none cursor-grab"
        onPointerDown={startDrag}
      >
        <div className="flex items-center gap-2">
          <IconGripVertical size={16} className="text-slate-500" />
          {view !== 'overview' && (
            <button
              type="button"
              className={iconBtnCls}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setView('overview')}
              aria-label="Zurück zur Übersicht"
            >
              <IconChevronLeft size={14} />
            </button>
          )}
          <h5 className="text-sm font-semibold text-slate-800">{headerTitle}</h5>
        </div>
        <button
          type="button"
          className={iconBtnCls}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onClose}
          aria-label="Panel schließen"
        >
          <IconX size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {view === 'overview' && (
          <div className="flex flex-col gap-2 p-3">
            <SlotButton
              label="Datenquellen"
              hint="Variable / IDB / Beleg / Stamm / MEMTAB / Frei"
              count={cat.entries.length}
              onClick={() => setView('sources')}
            />
            <SlotButton
              label="Relations"
              hint="GET / PUT / PUTADD (Laufzeit)"
              count={cat.relations.length}
              onClick={() => setView('relations')}
            />
          </div>
        )}
        {view === 'sources' && <DataSourcesView />}
        {view === 'relations' && <RelationsView />}
      </div>
    </div>
  )
}

interface SlotButtonProps {
  label: string
  hint: string
  count: number
  onClick: () => void
}

function SlotButton({ label, hint, count, onClick }: SlotButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-3 py-2.5 rounded-md border border-slate-200 hover:bg-slate-50"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-slate-500">{hint}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className={'text-sm ' + (count > 0 ? 'text-blue-600' : 'text-slate-400')}>
            {count}
          </span>
          <IconChevronRight size={14} className="text-slate-400" />
        </div>
      </div>
    </button>
  )
}
