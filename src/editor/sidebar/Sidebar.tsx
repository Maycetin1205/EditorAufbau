// Sidebar
// Linkes Editor-Organ: oben die Baustein-Bibliothek, darunter die
// Datenquellen-Bibliothek (Kap. 5.1) und die Relation-Bibliothek (Kap. 5.5)
// — drei Panels in einer Spalte. Die beiden Vorlagen-Bibliotheken teilen
// sich den unteren Bereich (je scrollbar über SidePanel), damit die
// Baustein-Palette den meisten Platz behält.

import { SidePanel } from '@/ui/molecules/side-panel'
import { BlockPalette } from './BlockPalette'
import { DataSourceList } from './DataSourceList'
import { RelationList } from './RelationList'

export function Sidebar() {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <SidePanel title="Blöcke">
          <BlockPalette />
        </SidePanel>
      </div>
      <div className="min-h-0 max-h-[30%] shrink-0 border-t border-border">
        <SidePanel title="Datenquellen">
          <DataSourceList />
        </SidePanel>
      </div>
      <div className="min-h-0 max-h-[30%] shrink-0 border-t border-border">
        <SidePanel title="Relationen">
          <RelationList />
        </SidePanel>
      </div>
    </div>
  )
}
