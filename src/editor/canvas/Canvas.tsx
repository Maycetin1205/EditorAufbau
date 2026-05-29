// Canvas
// Sichtbare Arbeitsflaeche. Rendert BlockData[] absolut positioniert via BlockHost.
// Hintergrund: Punkt-Raster fuer Orientierung. Click auf leere Stelle = Selektion aufheben.

import { useEditor } from '../../state/useEditor'
import { BlockHost } from './BlockHost'

export function Canvas() {
  const ed = useEditor()

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) ed.selectBlock(null)
      }}
      className="relative h-full w-full overflow-auto rounded-lg border border-border bg-card shadow-sm"
      style={{
        backgroundImage:
          'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0',
        minHeight: 400,
      }}
    >
      {ed.blocks.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
          <p className="text-sm font-medium text-foreground">Leere Canvas</p>
          <p className="text-xs text-muted-foreground">
            Links einen Block waehlen, um zu starten.
          </p>
        </div>
      )}
      {ed.blocks.map((block) => (
        <BlockHost
          key={block.id}
          block={block}
          selected={ed.selectedId === block.id}
          onSelect={() => ed.selectBlock(block.id)}
        />
      ))}
    </div>
  )
}
