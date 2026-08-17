import { bausteinName } from '../../core/blocks/bausteinName'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'

export function StatusBar() {
  const ed = useEditor()
  const quellen = useDataSources().list
  const selected = ed.selectedNode
  const page = ed.pages.find((p) => p.id === ed.activePageId)

  return (
    <footer className="flex h-6 shrink-0 items-center justify-between gap-3 border-t border-border bg-card px-3 text-[0.6875rem] text-muted-foreground">
      <div className="flex items-center gap-3">

        <span>
          Blöcke (alle Seiten){' '}
          <strong className="font-semibold text-foreground">{ed.blockCount}</strong>
        </span>
        {selected && (
          <span>
            Auswahl{' '}

            <strong className="font-semibold text-foreground">
              {bausteinName(selected, quellen)}
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
