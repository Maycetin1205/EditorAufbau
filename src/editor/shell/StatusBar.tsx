// StatusBar
// Schmaler Footer-Streifen mit Editor-Status: Blockanzahl und Auswahl.

import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { useEditor } from '../../state/useEditor'

export function StatusBar() {
  const ed = useEditor()
  const selected = ed.selectedNode
  const def = selected ? getBlockDefinition(selected.type) : null

  return (
    <footer className="flex h-7 shrink-0 items-center justify-between gap-3 border-t border-border bg-card px-3 text-[11px] text-muted-foreground">
      <div className="flex items-center gap-3">
        <span>
          Blöcke <strong className="text-foreground">{ed.blockCount}</strong>
        </span>
        {selected && (
          <span>
            Auswahl <strong className="text-foreground">{def?.displayName ?? selected.type}</strong>{' '}
            <code className="font-mono text-foreground/50">{selected.id.slice(0, 8)}</code>
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <a
          className="text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground"
          href="/project-map.html"
          target="_blank"
          rel="noreferrer"
        >
          Projektkarte
        </a>
        {ed.canUndo && <span>Undo</span>}
        {ed.canRedo && <span>Redo</span>}
      </div>
    </footer>
  )
}
