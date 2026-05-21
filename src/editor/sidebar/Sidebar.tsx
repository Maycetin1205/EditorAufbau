// Sidebar
// Linkes Editor-Organ. Enthaelt aktuell nur die Block-Palette.
// Migriert von Mantine auf src/ui (Tailwind + shadcn/ui-Style).

import { Panel } from '@/ui/panel'
import { BlockPalette } from './BlockPalette'

export function Sidebar() {
  return (
    <Panel title="Blocks">
      <BlockPalette />
    </Panel>
  )
}
