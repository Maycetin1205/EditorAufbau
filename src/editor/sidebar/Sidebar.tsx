// Sidebar
// Linkes Editor-Organ. Schmaler Header + Suche+Palette.
// Bewusst ohne Panel-Rahmen, weil sich der Block-Bereich besser an die
// Editor-Shell anschmiegt (mehr Figma-/Linear-haft).

import { BlockPalette } from './BlockPalette'

export function Sidebar() {
  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <header className="flex flex-col gap-1 px-0.5">
        <h2 className="text-sm font-semibold">Blocks</h2>
        <p className="text-[11px] text-muted-foreground">Klick fuegt einen Block ein.</p>
      </header>
      <div className="min-h-0 flex-1 overflow-auto">
        <BlockPalette />
      </div>
    </div>
  )
}
