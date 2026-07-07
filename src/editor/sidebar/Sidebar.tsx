// Sidebar
// Linkes Editor-Organ: oben die Baustein-Bibliothek, darunter die
// Datenquellen-Bibliothek (Kap. 5.1) — zwei Panels in einer Spalte.

import { SidePanel } from '@/ui/molecules/side-panel'
import { BlockPalette } from './BlockPalette'
import { DataSourceList } from './DataSourceList'

export function Sidebar() {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <SidePanel title="Blöcke">
          <BlockPalette />
        </SidePanel>
      </div>
      <div className="shrink-0 border-t border-border">
        <SidePanel title="Datenquellen">
          <DataSourceList />
        </SidePanel>
      </div>
    </div>
  )
}
