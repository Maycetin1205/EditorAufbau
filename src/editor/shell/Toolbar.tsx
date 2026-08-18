import {
  Download,
  FolderOpen,
  MoreHorizontal,
  Redo2,
  Save,
  SlidersHorizontal,
  Trash2,
  Undo2,
} from '@/ui/zeichen'
import { useEffect, useRef, useState } from 'react'
import { exportMask } from '../../export/exportMask'
import { failedChecks, validateMaskHtml } from '../../export/validator'
import { downloadFile } from '../../lib/dateiDownload'
import { dataSourceStore } from '../../state/DataSourceStore'
import { uebernehmeMaske } from '../../state/maskeUebernehmen'
import { packeMaske, packeMaskeAus } from '../../state/maskenDatei'
import { meldungen } from '../../state/meldungen'
import { meldeVerworfeneTypen } from '../../state/persistence'
import { relationStore } from '../../state/RelationStore'
import { useEditor } from '../../state/useEditor'
import { Button } from '@/ui/atoms/button'
import { IconButton } from '@/ui/atoms/icon-button'

export function Toolbar({ onDatencenter }: { onDatencenter: () => void }) {
  const ed = useEditor()

  const handleClear = () => {
    if (ed.blockCount === 0) return
    const popups = ed.pages.filter((p) => !p.istHauptseite).length
    const zusatz = popups === 0
      ? ''
      : popups === 1
        ? ' Die Popup-Seite fällt mit.'
        : ` Die ${popups} Popup-Seiten fallen mit.`
    if (!window.confirm(`Alle ${ed.blockCount} Blöcke aller Seiten löschen?${zusatz}`)) return
    ed.clear()
  }

  const handleExport = () => {
    const sources = dataSourceStore.list
    const relations = relationStore.list
    const { html, sevariablen } = exportMask(ed.tree, 'Maske', sources, relations)
    const failed = failedChecks(validateMaskHtml(html))
    if (failed.length > 0) {
      meldungen.melde(
        'Export abgebrochen — die Datei hätte in SoftEngine nicht geladen:\n\n'
        + failed.map((f) => `• ${f.name}: ${f.detail}`).join('\n'),
      )
      return
    }

    downloadFile('index.basis.source.html', html, 'text/html')
    downloadFile('index.basis.SEvariablen.json', sevariablen, 'application/json')
  }

  const handleSpeichern = () => {
    const text = packeMaske({
      tree: ed.tree,
      datenquellen: [...dataSourceStore.list],
      relationen: [...relationStore.list],
    })
    const heute = new Date().toISOString().slice(0, 10)
    downloadFile(`aufbau-maske-${heute}.json`, text, 'application/json')
  }

  const handleDateiGewaehlt = async (datei: File) => {
    let text: string
    try {
      text = await datei.text()
    } catch {
      meldungen.melde('Die Datei konnte nicht gelesen werden.')
      return
    }
    const ergebnis = packeMaskeAus(text)
    if (!ergebnis.ok) {
      const liste = ergebnis.probleme.slice(0, 10)
        .map((p) => `• ${p.bereich}${p.stelle === '' ? '' : ` (${p.stelle})`}: ${p.grund}`)
      const rest = ergebnis.probleme.length - liste.length
      meldungen.melde([
        ergebnis.grund,
        ...(liste.length > 0 ? ['', ...liste] : []),
        ...(rest > 0 ? [`… und ${rest} weitere.`] : []),
      ].join('\n'))
      return
    }

    if (!window.confirm(
      'Haben Sie den bisherigen Stand gespeichert?\n\n'
      + 'Mit OK wird die offene Maske unwiderruflich ersetzt — das lässt sich '
      + 'nicht rückgängig machen.',
    )) return

    uebernehmeMaske(ed, ergebnis.inhalt)
    meldeVerworfeneTypen(ergebnis.verworfen)
  }

  return (
    <div className="flex items-center gap-1.5 justify-self-end">
      <MoreMenu
        onClearAll={handleClear}
        clearDisabled={ed.blockCount === 0}
        onSpeichern={handleSpeichern}
        onDatei={handleDateiGewaehlt}
      />

      <Divider />

      <Button
        variant="outline"
        size="sm"
        onClick={onDatencenter}
        title="Datencenter — Datenquellen und Relationen der Maske"
      >
        <SlidersHorizontal size={14} /> Datencenter
      </Button>

      <Button
        size="sm"
        aria-label="Als SoftEngine-Maske exportieren"
        title="Export (SoftEngine-Maske)"
        onClick={handleExport}
        disabled={ed.blockCount === 0}
      >
        <Download size={14} /> Exportieren
      </Button>
    </div>
  )
}

export function VerlaufKnoepfe() {
  const ed = useEditor()
  return (
    <div className="flex items-center">
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
    </div>
  )
}

function MoreMenu({
  onClearAll,
  clearDisabled,
  onSpeichern,
  onDatei,
}: {
  onClearAll: () => void
  clearDisabled: boolean
  onSpeichern: () => void
  onDatei: (datei: File) => void
}) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const dateiRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={wrap} className="relative">
      <IconButton
        aria-label="Weitere Aktionen"
        title="Weitere Aktionen"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal size={15} />
      </IconButton>

      <input
        ref={dateiRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          const datei = e.target.files?.[0]
          try {
            if (datei) onDatei(datei)
          } finally {
            e.target.value = ''
          }
        }}
      />
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 min-w-[11.875rem] rounded-md border border-border bg-popover p-1 shadow-md"
        >
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false)
              onSpeichern()
            }}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
          >
            <Save size={13} /> Maske speichern…
          </button>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false)
              dateiRef.current?.click()
            }}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent"
          >
            <FolderOpen size={13} /> Maske laden…
          </button>
          <div className="my-1 h-px bg-border" />
          <button
            role="menuitem"
            type="button"
            disabled={clearDisabled}
            onClick={() => {
              setOpen(false)
              onClearAll()
            }}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs text-destructive hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-50"
          >
            <Trash2 size={13} /> Alle Blöcke löschen…
          </button>
        </div>
      )}
    </div>
  )
}

function Divider() {
  return <span className="mx-1 h-4 w-px bg-border" />
}
