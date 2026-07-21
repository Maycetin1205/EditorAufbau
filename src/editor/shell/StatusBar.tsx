// StatusBar
// Schmaler Footer-Streifen mit Editor-Status: Blockanzahl, Auswahl und
// aktive Seite. R1 (2026-07-21): Undo/Redo-Gezappel raus, dafür die Seite —
// ruhige, feste Information statt blinkender Zustandsanzeigen.

import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { useEditor } from '../../state/useEditor'

export function StatusBar() {
  const ed = useEditor()
  const selected = ed.selectedNode
  const def = selected ? getBlockDefinition(selected.type) : null
  const page = ed.pages.find((p) => p.id === ed.activePageId)

  return (
    <footer className="flex h-6 shrink-0 items-center justify-between gap-3 border-t border-border bg-card px-3 text-[11px] text-muted-foreground">
      <div className="flex items-center gap-3">
        <span>
          Blöcke <strong className="font-semibold text-foreground">{ed.blockCount}</strong>
        </span>
        {selected && (
          <span>
            Auswahl{' '}
            <strong className="font-semibold text-foreground">
              {def?.displayName ?? selected.type}
            </strong>
          </span>
        )}
      </div>
      {page && (
        <span>
          Seite <strong className="font-semibold text-foreground">{page.name}</strong>
        </span>
      )}
    </footer>
  )
}
