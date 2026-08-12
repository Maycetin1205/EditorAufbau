// Sidebar
// Linkes Editor-Organ: die Baustein-Bibliothek — sonst nichts. Der in R2
// zwischenzeitlich erprobte Baustein-Baum wurde auf Nutzer-Entscheidung
// 2026-07-21 wieder RESTLOS entfernt. Die Datenquellen- und Relationen-
// Bibliotheken sind seit Z1 (2026-07-11) in die Kommandozentrale umgezogen
// (Toolbar „Datencenter"): EIN übersichtlicher Pflegeort statt zweier
// Restflächen.

import { SidePanel } from '@/ui/molecules/side-panel'
import { BlockPalette } from './BlockPalette'

export function Sidebar() {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <SidePanel title="Blöcke">
          <BlockPalette />
        </SidePanel>
      </div>
    </div>
  )
}
