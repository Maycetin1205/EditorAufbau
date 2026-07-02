// Toolbar
// Werkzeugleiste im Header. Loest die wenigen MVP-Editor-Befehle aus.

import {
  Copy,
  Download,
  Redo2,
  Trash,
  Trash2,
  Undo2,
} from 'lucide-react'
import { exportMask } from '../../export/exportMask'
import { failedChecks, validateMaskHtml } from '../../export/validator'
import { useEditor } from '../../state/useEditor'
import { IconButton } from '@/ui/atoms/icon-button'

function downloadFile(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export function Toolbar() {
  const ed = useEditor()
  const hasSelection = ed.selectedId !== null

  const handleClear = () => {
    if (ed.blockCount === 0) return
    if (!window.confirm(`Alle ${ed.blockCount} Blöcke löschen?`)) return
    ed.clear()
  }

  // Kap. 3 Mini-Export: Baum → Maske (HTML + SEvariablen-JSON), maschinell
  // geprüft BEVOR eine Datei entsteht. Schlägt die Prüfung fehl, gibt es
  // keine Datei — SoftEngine sieht nie ungeprüftes HTML.
  const handleExport = () => {
    const { html, sevariablen } = exportMask(ed.tree)
    const failed = failedChecks(validateMaskHtml(html))
    if (failed.length > 0) {
      window.alert(
        'Export abgebrochen — Prüfung fehlgeschlagen:\n\n'
        + failed.map((f) => `• ${f.name}: ${f.detail}`).join('\n'),
      )
      return
    }
    downloadFile('maske.html', html, 'text/html')
    downloadFile('maske.SEvariablen.json', sevariablen, 'application/json')
  }

  return (
    <div className="flex items-center gap-1">
      <ToolGroup>
        <IconButton
          aria-label="Rückgängig (Ctrl+Z)"
          title="Rückgängig"
          onClick={() => ed.undo()}
          disabled={!ed.canUndo}
        >
          <Undo2 size={15} />
        </IconButton>
        <IconButton
          aria-label="Wiederholen (Ctrl+Shift+Z)"
          title="Wiederholen"
          onClick={() => ed.redo()}
          disabled={!ed.canRedo}
        >
          <Redo2 size={15} />
        </IconButton>
      </ToolGroup>

      <Divider />

      <ToolGroup>
        <IconButton
          aria-label="Duplizieren (Ctrl+D)"
          title="Duplizieren"
          onClick={() => ed.selectedId && ed.duplicateBlock(ed.selectedId)}
          disabled={!hasSelection}
        >
          <Copy size={15} />
        </IconButton>
        <IconButton
          aria-label="Löschen (Entf)"
          title="Löschen"
          onClick={() => ed.selectedId && ed.removeBlock(ed.selectedId)}
          disabled={!hasSelection}
        >
          <Trash size={15} />
        </IconButton>
        <IconButton
          aria-label="Alle Blöcke löschen"
          title="Alle Blöcke löschen"
          onClick={handleClear}
          disabled={ed.blockCount === 0}
        >
          <Trash2 size={15} />
        </IconButton>
      </ToolGroup>

      <Divider />

      <ToolGroup>
        <IconButton
          aria-label="Als SoftEngine-Maske exportieren"
          title="Export (SoftEngine-Maske)"
          onClick={handleExport}
          disabled={ed.blockCount === 0}
        >
          <Download size={15} />
        </IconButton>
      </ToolGroup>
    </div>
  )
}

function ToolGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center">{children}</div>
}

function Divider() {
  return <span className="mx-1.5 h-5 w-px bg-border" />
}
