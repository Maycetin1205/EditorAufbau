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
