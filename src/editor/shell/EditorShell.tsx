// EditorShell
// Erstes echtes Editor-Layout: links Sidebar, Mitte Canvas, rechts Inspector.
// Reines HTML + Tailwind; die Editor-Organe bleiben eigene Komponenten.

import { IconDatabase } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useKeyboardShortcuts } from '../../state/useKeyboardShortcuts'
import { Canvas } from '../canvas/Canvas'
import { Inspector } from '../inspector/Inspector'
import { CatalogPanel, type PanelPosition } from '../panels/CatalogPanel'
import { Sidebar } from '../sidebar/Sidebar'

const CATALOG_POS_KEY = 'aufbau_catalog_panel_pos_v1'
const DEFAULT_CATALOG_POS: PanelPosition = { x: 80, y: 80 }

function loadCatalogPos(): PanelPosition {
  try {
    const raw = localStorage.getItem(CATALOG_POS_KEY)
    if (!raw) return DEFAULT_CATALOG_POS
    const parsed = JSON.parse(raw) as Partial<PanelPosition>
    if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
      return { x: parsed.x, y: parsed.y }
    }
  } catch {
    // ignore
  }
  return DEFAULT_CATALOG_POS
}

export function EditorShell() {
  useKeyboardShortcuts()
  const [catalogOpen, setCatalogOpen] = useState(false)
  // Position lebt im Shell, ueberlebt Close/Open + Page-Refresh via localStorage.
  const [catalogPos, setCatalogPos] = useState<PanelPosition>(loadCatalogPos)
  useEffect(() => {
    try {
      localStorage.setItem(CATALOG_POS_KEY, JSON.stringify(catalogPos))
    } catch {
      // ignore
    }
  }, [catalogPos])
  return (
    <div className="flex h-screen w-screen flex-col bg-gray-50 text-gray-900">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
        <h1 className="text-lg font-semibold">Aufbau Editor</h1>
        {/* Toolbar-Slot: hier kommen weitere Werkzeug-Buttons rein. */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCatalogOpen((open) => !open)}
            className={
              'inline-flex items-center gap-1 rounded border px-2 py-1 text-xs transition-colors ' +
              (catalogOpen
                ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-100')
            }
          >
            <IconDatabase size={14} />
            Datenquellen
          </button>
          <span className="text-sm text-gray-500">SoftEngine HTML</span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="w-60 shrink-0 overflow-auto border-r border-gray-200 bg-white p-4">
          <Sidebar />
        </aside>

        <main className="min-w-0 flex-1 overflow-auto p-4">
          <Canvas />
        </main>

        <aside className="w-[340px] shrink-0 overflow-auto border-l border-gray-200 bg-white p-4">
          <Inspector />
        </aside>
      </div>

      {catalogOpen && (
        <CatalogPanel
          pos={catalogPos}
          onPosChange={setCatalogPos}
          onClose={() => setCatalogOpen(false)}
        />
      )}
    </div>
  )
}
