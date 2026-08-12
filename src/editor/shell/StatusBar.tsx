// StatusBar
// Schmaler Footer-Streifen mit Editor-Status: Blockanzahl, Auswahl und
// aktive Seite. R1 (2026-07-21): Undo/Redo-Gezappel raus, dafür die Seite —
// ruhige, feste Information statt blinkender Zustandsanzeigen.

import { bausteinName } from '../../core/blocks/bausteinName'
import { useEditor } from '../../state/useEditor'

export function StatusBar() {
  const ed = useEditor()
  const selected = ed.selectedNode
  const page = ed.pages.find((p) => p.id === ed.activePageId)

  return (
    <footer className="flex h-6 shrink-0 items-center justify-between gap-3 border-t border-border bg-card px-3 text-[0.6875rem] text-muted-foreground">
      <div className="flex items-center gap-3">
        {/* „alle Seiten" steht dabei, weil `Editor.blockCount` JEDEN Knoten des
            Baums zaehlt — auch den Inhalt der Popup-Seiten, die hier gar nicht
            zu sehen sind. Bis U2 (2026-08-12) hiess die Zahl nur „Blöcke" und
            log damit ueber die offene Seite. Bewusst der kleine Weg: die Zahl
            bleibt, was sie ist (sie steuert auch „Alle Blöcke löschen" und den
            Export-Knopf), nur ihre Beschriftung sagt die Wahrheit. */}
        <span>
          Blöcke (alle Seiten){' '}
          <strong className="font-semibold text-foreground">{ed.blockCount}</strong>
        </span>
        {selected && (
          <span>
            Auswahl{' '}
            {/* Der Klarname des Bausteins (bausteinName) — NICHT der Typname:
                bei fuenf Formularfeldern in einer Maske sagt „Formularfeld"
                nichts darueber, welches gerade ausgewaehlt ist. */}
            <strong className="font-semibold text-foreground">
              {bausteinName(selected)}
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
