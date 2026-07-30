// Toolbar
// Werkzeugleiste im Header. Loest die wenigen MVP-Editor-Befehle aus.
// R1 (2026-07-21): Exportieren = der EINE Primärknopf; „Alle Blöcke
// löschen" raus aus der Reihe in ein „…"-Menü (Zerstörerisches steht nie
// gleichrangig neben dem Hauptweg, Bestätigung bleibt).

import {
  Download,
  FolderOpen,
  MoreHorizontal,
  Redo2,
  Save,
  SlidersHorizontal,
  Trash2,
  Undo2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { exportMask } from '../../export/exportMask'
import { preflightMask } from '../../export/preflight'
import { failedChecks, validateMaskHtml } from '../../export/validator'
import { dataSourceStore } from '../../state/DataSourceStore'
import { packeMaske, packeMaskeAus } from '../../state/maskenDatei'
import { meldeVerworfeneTypen } from '../../state/persistence'
import { relationStore } from '../../state/RelationStore'
import { useEditor } from '../../state/useEditor'
import { Button } from '@/ui/atoms/button'
import { IconButton } from '@/ui/atoms/icon-button'

function downloadFile(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

// onSteuerung: öffnet die Kommandozentrale — Zustand hält die Shell.
export function Toolbar({ onSteuerung }: { onSteuerung: () => void }) {
  const ed = useEditor()

  const handleClear = () => {
    if (ed.blockCount === 0) return
    if (!window.confirm(`Alle ${ed.blockCount} Blöcke löschen?`)) return
    ed.clear()
  }

  // Mini-Export: Baum → Maske (HTML + SEvariablen-JSON), maschinell
  // geprüft BEVOR eine Datei entsteht. Schlägt die Prüfung fehl, gibt es
  // keine Datei — SoftEngine sieht nie ungeprüftes HTML.
  const handleExport = () => {
    // Dieselbe Vorlagen-Bibliothek fuer Preflight UND Export (Konsistenz).
    const sources = dataSourceStore.list
    const relations = relationStore.list
    const { html, sevariablen } = exportMask(ed.tree, 'Maske', sources, relations)
    // Semantische Preflight (kaputte Datenquellen-Referenz)
    // + Dateiform-Pruefung — beide muessen gruen sein, sonst kein Download.
    const failed = [
      ...failedChecks(preflightMask(ed.tree, sources, relations)),
      ...failedChecks(validateMaskHtml(html)),
    ]
    if (failed.length > 0) {
      window.alert(
        'Export abgebrochen — Prüfung fehlgeschlagen:\n\n'
        + failed.map((f) => `• ${f.name}: ${f.detail}`).join('\n'),
      )
      return
    }
    // SE-Namenskonvention (2026-07-11): eine Maske = ein Ordner mit
    // index.basis.source.html + index.basis.SEvariablen.json — belegt durch
    // ALLE 124 Referenzmasken + behandlung-umbau. Kein Umbenennen von Hand.
    downloadFile('index.basis.source.html', html, 'text/html')
    downloadFile('index.basis.SEvariablen.json', sevariablen, 'application/json')
  }

  // Maske als DATEI sichern (2026-07-28). Nicht zu verwechseln mit dem
  // Export: der erzeugt die fertige SoftEngine-Maske und ist eine
  // Einbahnstrasse. Diese Datei ist der BAUPLAN und laesst sich wieder laden.
  // Dateiname mit Datum, damit Sicherungen sich von selbst sortieren und
  // einander nicht ueberschreiben.
  const handleSpeichern = () => {
    const text = packeMaske({
      tree: ed.tree,
      datenquellen: [...dataSourceStore.list],
      relationen: [...relationStore.list],
    })
    const heute = new Date().toISOString().slice(0, 10)
    downloadFile(`aufbau-maske-${heute}.json`, text, 'application/json')
  }

  // Feste Reihenfolge (Codex-Planreview 2026-07-28): lesen -> GANZ pruefen
  // -> Rueckfrage -> vollstaendig ersetzen -> erst DANN warnen. Andernfalls
  // saehe der Bediener „Beim Laden entfernt: …", obwohl er gleich darauf
  // abbricht und gar nichts geladen wurde.
  const handleDateiGewaehlt = async (datei: File) => {
    let text: string
    try {
      text = await datei.text()
    } catch {
      window.alert('Die Datei konnte nicht gelesen werden.')
      return
    }
    const ergebnis = packeMaskeAus(text)
    if (!ergebnis.ok) {
      window.alert(ergebnis.grund)
      return
    }
    // Laden ist der einzige Knopf, der mit einem Klick ALLES ueberschreibt —
    // und es gibt danach kein Undo (die Historie wird geleert, s.
    // Editor.ersetzeMaske). Diese Rueckfrage ist das einzige Netz; ihr Text
    // passt bewusst zu OK/Abbrechen und verspricht keine Speicheraktion.
    if (!window.confirm(
      'Haben Sie den bisherigen Stand gespeichert?\n\n'
      + 'Mit OK wird die offene Maske unwiderruflich ersetzt — das lässt sich '
      + 'nicht rückgängig machen.',
    )) return

    dataSourceStore.ersetzeAlle(ergebnis.inhalt.datenquellen)
    relationStore.ersetzeAlle(ergebnis.inhalt.relationen)
    ed.ersetzeMaske(ergebnis.inhalt.tree)
    meldeVerworfeneTypen(ergebnis.verworfen)
  }

  return (
    <div className="flex items-center gap-1.5 justify-self-end">
      <MoreMenu
        onClearAll={handleClear}
        clearDisabled={ed.blockCount === 0}
        onSpeichern={handleSpeichern}
        speichernDisabled={false}
        onDatei={handleDateiGewaehlt}
      />

      <Divider />

      <Button
        variant="outline"
        size="sm"
        onClick={onSteuerung}
        title="Steuerung — Datenquellen und Relationen der Maske"
      >
        <SlidersHorizontal size={14} /> Steuerung
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

// Verlauf (Rückgängig/Wiederholen) — wohnt seit dem R1-Feinschliff LINKS
// neben dem Logo (Figma-Muster), nicht mehr im Aktionen-Cluster rechts.
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

// „…"-Menü: Sammelplatz für seltene/zerstörerische Befehle. Bewusst von
// Hand gebaut (kein Radix-Menu im Projekt) — schließt bei Klick daneben
// und bei Escape.
function MoreMenu({
  onClearAll,
  clearDisabled,
  onSpeichern,
  speichernDisabled,
  onDatei,
}: {
  onClearAll: () => void
  clearDisabled: boolean
  onSpeichern: () => void
  speichernDisabled: boolean
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
      {/* Verstecktes Datei-Feld: der Menue-Eintrag klickt es an. Der Wert wird
          nach JEDEM Versuch geleert (finally) — sonst loest die Auswahl
          DERSELBEN Datei kein zweites 'change' aus, und der Bediener klickt
          ins Leere, ohne zu verstehen warum. */}
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
            disabled={speichernDisabled}
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
