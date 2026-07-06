// Sidebar
// Linkes Editor-Organ: Block-Palette in der gemeinsamen SidePanel-Hülle.

import { SidePanel } from '@/ui/molecules/side-panel'
import { BlockPalette } from './BlockPalette'

export function Sidebar() {
  return (
    <SidePanel title="Blöcke">
      <BlockPalette />
    </SidePanel>
  )
}
